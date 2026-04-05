import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/orders
 * Returns all orders with customer info for the admin dashboard.
 * Joins users table where available so real names are shown.
 */
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT
        o.id,
        CASE
          WHEN o.order_id IS NOT NULL AND o.order_id != ''
          THEN o.order_id
          ELSE CONCAT('#ORD-', LPAD(o.id, 4, '0'))
        END                                                     AS display_id,
        COALESCE(u.name, o.customer, 'Unknown')                 AS customer,
        COALESCE(
          DATE_FORMAT(o.created_at, '%Y-%m-%d'),
          DATE_FORMAT(o.order_date, '%Y-%m-%d'),
          ''
        )                                                       AS date,
        COALESCE(o.status, 'Pending')                           AS status,
        COALESCE(CONCAT('RM ', FORMAT(o.amount, 2)), 'RM 0.00') AS amount,
        o.user_id
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC`
    );

    const mapped = rows.map((r) => ({
      id:       r.display_id,
      dbId:     r.id,
      customer: r.customer,
      date:     r.date,
      status:   r.status,
      amount:   r.amount,
      userId:   r.user_id,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
