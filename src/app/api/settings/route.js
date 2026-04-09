export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET /api/settings
 * Returns store settings + notification preferences.
 */
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM settings WHERE id = 1 LIMIT 1");

    if (rows.length === 0) {
      // Seed default row if missing
      await db.query("INSERT IGNORE INTO settings (id) VALUES (1)");
      const [newRows] = await db.query("SELECT * FROM settings WHERE id = 1 LIMIT 1");
      return NextResponse.json(newRows[0] || {});
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Settings GET error:", error);
    // Return safe defaults
    return NextResponse.json({
      store_name:       "NovaMart",
      store_email:      "contact@novamart.com",
      store_phone:      "",
      store_address:    "",
      notif_low_stock:  1,
      notif_new_order:  1,
      notif_delivery:   0,
      notif_email:      1,
      notif_sms:        0,
      notif_system:     1,
    });
  }
}

/**
 * PUT /api/settings
 * Updates store settings and notification preferences.
 */
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      store_name, store_email, store_phone, store_address,
      notif_low_stock, notif_new_order, notif_delivery,
      notif_email, notif_sms, notif_system,
    } = body;

    await db.query(`
      INSERT INTO settings (id, store_name, store_email, store_phone, store_address,
        notif_low_stock, notif_new_order, notif_delivery, notif_email, notif_sms, notif_system)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        store_name      = VALUES(store_name),
        store_email     = VALUES(store_email),
        store_phone     = VALUES(store_phone),
        store_address   = VALUES(store_address),
        notif_low_stock = VALUES(notif_low_stock),
        notif_new_order = VALUES(notif_new_order),
        notif_delivery  = VALUES(notif_delivery),
        notif_email     = VALUES(notif_email),
        notif_sms       = VALUES(notif_sms),
        notif_system    = VALUES(notif_system)
    `, [
      store_name    || "NovaMart",
      store_email   || "",
      store_phone   || "",
      store_address || "",
      notif_low_stock ? 1 : 0,
      notif_new_order ? 1 : 0,
      notif_delivery  ? 1 : 0,
      notif_email     ? 1 : 0,
      notif_sms       ? 1 : 0,
      notif_system    ? 1 : 0,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}