import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // ── ADMIN / SALES PAGE: no user_id → flat Order[] array ──
    if (!user_id) {
      let rows = [];
      try {
        const [result] = await db.query(
          `SELECT 
            o.id,
            CASE WHEN o.order_id IS NOT NULL AND o.order_id != '' THEN o.order_id 
                 ELSE CONCAT('#ORD-', LPAD(o.id, 4, '0')) END AS display_id,
            COALESCE(u.name, o.customer, 'Unknown')            AS customer,
            COALESCE(DATE_FORMAT(o.created_at, '%Y-%m-%d'), DATE_FORMAT(o.order_date, '%Y-%m-%d'), '') AS date,
            COALESCE(o.status, 'Pending')                      AS status,
            COALESCE(CONCAT('RM ', FORMAT(o.amount, 2)), 'RM 0.00') AS amount
          FROM orders o
          LEFT JOIN users u ON o.user_id = u.id
          ORDER BY o.id DESC`
        );
        // Map to shape expected by SalesOrderPage
        rows = result.map(r => ({
          id:       r.display_id,
          dbId:     r.id,
          customer: r.customer,
          date:     r.date,
          status:   r.status,
          amount:   r.amount,
        }));
      } catch (e) {
        console.warn("Admin orders query error:", e.message);
      }
      return NextResponse.json(rows);
    }

    // ── USER ACCOUNT PAGE: return their orders grouped with items ──
    let rows = [];
    try {
      const [result] = await db.query(
        `SELECT 
          o.id AS order_id,
          o.amount AS total_amount,
          COALESCE(o.status, 'Pending') AS status,
          o.created_at,
          p.name AS product_name,
          oi.quantity,
          oi.price AS item_price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC`,
        [user_id]
      );
      rows = result;
    } catch (queryErr) {
      console.warn("User orders query warning:", queryErr.message);
      return NextResponse.json({ orders: [] });
    }

    // Group flat results into nested structure
    const ordersMap = new Map();
    rows.forEach(row => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id:     row.order_id,
          total_amount: row.total_amount,
          status:       row.status,
          created_at:   row.created_at,
          items:        []
        });
      }
      ordersMap.get(row.order_id).items.push({
        product_name: row.product_name,
        quantity:     row.quantity,
        price:        row.item_price
      });
    });

    return NextResponse.json({ orders: Array.from(ordersMap.values()) });
  } catch (error) {
    console.error("Order History API error:", error);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (Array.isArray(body.items)) {
      const { userId, items, total, paymentId, customerName: providedName, email, city, address } = body;

      if (!providedName || !email || !city || !address) {
        return NextResponse.json({ success: false, error: "Missing checkout details. Full Info is required." }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
      }

      // Resolve real customer name from users table if not provided
      let customerName = providedName || (userId ? `User #${userId}` : "Guest");
      if (!providedName && userId) {
        try {
          const [userRows] = await db.query("SELECT name FROM users WHERE id = ? LIMIT 1", [userId]);
          if (userRows.length > 0 && userRows[0].name) {
            customerName = userRows[0].name;
          }
        } catch (e) {
          console.warn("Could not fetch user name:", e.message);
        }
      }

      const [orderResult] = await db.query(
        `INSERT INTO orders (user_id, amount, status, customer, email, city, address, order_date, created_at) VALUES (?, ?, 'Paid', ?, ?, ?, ?, NOW(), NOW())`,
        [userId || null, total, customerName, email || "", city || "", address || ""]
      );
      const orderId = orderResult.insertId;
      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      // Auto-create delivery for this Paid order
      try {
        const eta = new Date();
        eta.setDate(eta.getDate() + 3);
        const etaStr = eta.toISOString().split("T")[0];
        const [delRes] = await db.query(
          `INSERT INTO deliveries (order_id, customer, address, carrier, status, eta, items_count, created_at)
           VALUES (?, ?, ?, 'DHL', 'Processing', ?, ?, NOW())`,
          [orderId, customerName, address || "", etaStr, items.length]
        );
        const delId = delRes.insertId;
        await db.query(
          "UPDATE deliveries SET delivery_id = ? WHERE id = ?",
          [`#DEL-${String(delId).padStart(4, "0")}`, delId]
        );
      } catch (delErr) {
        console.warn("Delivery creation warning:", delErr.message);
      }

      return NextResponse.json({ success: true, orderId });
    }

    // ── ADMIN ADD ORDER flow: customer + order_date + status + amount ──
    const { customer, order_date, status, amount } = body;
    if (!customer) {
      return NextResponse.json({ success: false, error: "Missing customer" }, { status: 400 });
    }
    const numericAmount = parseFloat(String(amount).replace(/[^0-9.]/g, "")) || 0;
    const [result] = await db.query(
      `INSERT INTO orders (customer, order_date, status, amount, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [customer, order_date || new Date().toISOString().split("T")[0], status || "Pending", numericAmount]
    );
    const newId = result.insertId;

    // Auto-create delivery if status is Paid or Shipped
    if (["Paid", "Shipped"].includes(status || "Pending")) {
      try {
        const eta = new Date();
        eta.setDate(eta.getDate() + 3);
        const etaStr = eta.toISOString().split("T")[0];
        const [delRes] = await db.query(
          `INSERT INTO deliveries (order_id, customer, address, carrier, status, eta, items_count, created_at)
           VALUES (?, ?, '', 'DHL', 'Processing', ?, 1, NOW())`,
          [newId, customer, etaStr]
        );
        const delId = delRes.insertId;
        await db.query(
          "UPDATE deliveries SET delivery_id = ? WHERE id = ?",
          [`#DEL-${String(delId).padStart(4, "0")}`, delId]
        );
      } catch (delErr) {
        console.warn("Delivery creation warning:", delErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      dbId:    newId,
      id:      `#ORD-${String(newId).padStart(4, "0")}`,
    });
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}