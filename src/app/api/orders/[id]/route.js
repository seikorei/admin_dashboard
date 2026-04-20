export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

/* ─── Helper: auto-create delivery for a Paid order ────── */
async function ensureDelivery(orderId, customer) {
  // Only create if none exists for this order
  const [existing] = await db.query(
    "SELECT id FROM deliveries WHERE order_id = ? LIMIT 1",
    [orderId]
  );
  if (existing.length > 0) return; // already has a delivery

  // Count items in this order
  const [[{ cnt }]] = await db.query(
    "SELECT COUNT(*) AS cnt FROM order_items WHERE order_id = ?",
    [orderId]
  );

  const eta = new Date();
  eta.setDate(eta.getDate() + 3);
  const etaStr = eta.toISOString().split("T")[0];

  const [[orderRow]] = await db.query(
    "SELECT address FROM orders WHERE id = ?",
    [orderId]
  );
  const orderAddress = orderRow?.address || "";

  const tempDelId = `DEL-SN-${Date.now()}`;
  const [res] = await db.query(
    `INSERT INTO deliveries (delivery_id, order_id, customer, address, carrier, status, eta, items_count, created_at)
     VALUES (?, ?, ?, ?, 'DHL', 'Processing', ?, ?, NOW())`,
    [tempDelId, orderId, customer || "Unknown", orderAddress, etaStr, Math.max(1, Number(cnt))]
  );
  const newId = res.insertId;
  await db.query(
    "UPDATE deliveries SET delivery_id = ? WHERE id = ?",
    [`#DEL-${String(newId).padStart(4, "0")}`, newId]
  );
}

/* ======================
   DELETE – Remove order
====================== */
export async function DELETE(req, props) {
  const { id } = await props.params;

  try {
    console.log(`[Orders API] DELETE requested for Order ID: ${id}`);

    // OPTION A: Delete child records first to prevent foreign key errors
    await db.execute("DELETE FROM deliveries WHERE order_id = ?", [id]);
    await db.execute("DELETE FROM order_items WHERE order_id = ?", [id]);

    const [result] = await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    console.log(`[Orders API] DELETE result from DB:`, result);

    if (result.affectedRows === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const response = { success: true };
    console.log(`[Orders API] Returning response:`, response);
    return Response.json(response);
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return Response.json({ error: "DB error", details: err.message }, { status: 500 });
  }
}

/* ======================
   PUT – Update order
====================== */
export async function PUT(req, props) {
  const { id } = await props.params;

  try {
    const body = await req.json();
    const numericAmount = parseFloat(String(body.amount).replace(/[^0-9.]/g, "")) || 0;
    const newStatus = body.status || "Pending";

    const [result] = await db.execute(
      "UPDATE orders SET customer = ?, status = ?, amount = ? WHERE id = ?",
      [body.customer, newStatus, numericAmount, id]
    );

    if (result.affectedRows === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Auto-create delivery when order is marked as Paid or Shipped
    if (["Paid", "Shipped"].includes(newStatus)) {
      try {
        await ensureDelivery(Number(id), body.customer);
      } catch (deliveryErr) {
        console.warn("Could not create delivery record:", deliveryErr.message);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("PUT ERROR:", err);
    return Response.json({ error: "DB error", details: err.message }, { status: 500 });
  }
}