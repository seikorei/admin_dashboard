export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const DELIVERY_STATUSES = ["Processing", "Shipped", "In Transit", "Delivered"];

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        d.id,
        COALESCE(d.delivery_id, CONCAT('#DEL-', LPAD(d.id, 4, '0'))) AS delivery_id,
        CASE 
          WHEN o.order_id IS NOT NULL AND o.order_id != '' THEN o.order_id 
          ELSE CONCAT('#ORD-', LPAD(o.id, 4, '0')) 
        END                                                             AS displayOrderId,
        d.order_id                                                      AS orderDbId,
        COALESCE(d.customer, 'Unknown')                                 AS customer,
        COALESCE(d.address, '')                                         AS address,
        COALESCE(d.carrier, 'DHL')                                      AS carrier,
        COALESCE(d.status, 'Processing')                                AS status,
        COALESCE(DATE_FORMAT(d.eta, '%Y-%m-%d'), 'TBD')                 AS eta,
        COALESCE(d.items_count, 1)                                      AS items,
        COALESCE(
          DATE_FORMAT(d.created_at, '%Y-%m-%d'),
          DATE_FORMAT(NOW(), '%Y-%m-%d')
        )                                                               AS created_at,
        /* Pull order amount for reference */
        COALESCE(CONCAT('RM ', FORMAT(o.amount, 2)), '')               AS order_amount
      FROM deliveries d
      LEFT JOIN orders o ON o.id = d.order_id
      ORDER BY d.id DESC
    `);

    const mapped = rows.map(r => ({
      id:           r.delivery_id,
      dbId:         r.id,
      orderId:      r.displayOrderId,
      orderDbId:    r.orderDbId,
      customer:     r.customer,
      address:      r.address,
      carrier:      r.carrier,
      status:       r.status,
      eta:          r.eta,
      items:        Number(r.items),
      createdAt:    r.created_at,
      orderAmount:  r.order_amount,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Deliveries GET error:", error.message);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { order_id, customer, address, carrier, eta, status, items_count } = body;

    const [result] = await db.query(
      `INSERT INTO deliveries (order_id, customer, address, carrier, eta, status, items_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        order_id    || null,
        customer    || "Unknown",
        address     || "",
        carrier     || "DHL",
        eta         || null,
        status      || "Processing",
        items_count || 1,
      ]
    );
    const newId = result.insertId;
    const deliveryId = `#DEL-${String(newId).padStart(4, "0")}`;
    await db.query(`UPDATE deliveries SET delivery_id = ? WHERE id = ?`, [deliveryId, newId]);

    return NextResponse.json({ success: true, id: newId, delivery_id: deliveryId });
  } catch (error) {
    console.error("Deliveries POST error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}