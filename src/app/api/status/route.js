export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

const DEFAULT_STATUSES = ["Pending", "Processing", "Shipped", "Paid", "Cancelled"];

export async function GET() {
  try {
    const [rows] = await db.query("SELECT DISTINCT name FROM order_status ORDER BY name");
    if (Array.isArray(rows) && rows.length > 0) {
      return Response.json(rows);
    }
    // Fallback: derive statuses from actual orders table
    const [orderRows] = await db.query("SELECT DISTINCT status FROM orders WHERE status IS NOT NULL");
    if (Array.isArray(orderRows) && orderRows.length > 0) {
      return Response.json(orderRows.map((r) => ({ name: r.status })));
    }
    // Final fallback: hardcoded defaults
    return Response.json(DEFAULT_STATUSES.map((s) => ({ name: s })));
  } catch (error) {
    console.error("Failed to fetch order statuses:", error);
    // Return defaults so UI doesn't break
    return Response.json(DEFAULT_STATUSES.map((s) => ({ name: s })));
  }
}
