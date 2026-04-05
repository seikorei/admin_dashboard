import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/order-items?orderId=123
 * Returns all line items for a given order ID.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId query param required" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT
        oi.id,
        oi.order_id,
        oi.quantity,
        oi.price,
        p.id         AS product_id,
        COALESCE(p.name, 'Unknown Product') AS product_name,
        COALESCE(p.image_url, '')           AS image_url,
        COALESCE(p.category, '')            AS category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC`,
      [orderId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Order-items GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
