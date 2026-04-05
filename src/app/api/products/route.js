import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT 
        id,
        id AS dbId,
        COALESCE(name, '') AS name,
        COALESCE(name, '') AS product_name,
        COALESCE(category, 'Uncategorized') AS category,
        COALESCE(price, 0) AS price,
        COALESCE(stock, 0) AS stock,
        COALESCE(image_url, '') AS image_url
      FROM products
      ORDER BY id DESC`
    );

    const mapped = rows.map(r => ({
      id:           r.id,
      dbId:         r.id,
      name:         r.name,
      product_name: r.product_name,
      category:     r.category,
      price:        Number(r.price).toFixed(2),   // raw numeric string for shop page
      stock:        Number(r.stock),
      image_url:    r.image_url || "",
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name      = body.name || body.product_name || "";
    const category  = body.category || "Uncategorized";
    const stock     = Number(body.stock) || 0;
    const price     = parseFloat(String(body.price).replace(/[^0-9.]/g, "")) || 0;
    const image_url = body.image_url || null;

    if (!name.trim()) {
      return NextResponse.json({ success: false, error: "Product name required" }, { status: 400 });
    }

    // Ensure image_url column exists (safe ALTER – ignored if already present)
    try {
      await db.query(`ALTER TABLE products ADD COLUMN image_url TEXT`);
    } catch (_) { /* column already exists – ignore */ }

    const [result] = await db.query(
      `INSERT INTO products (name, category, stock, price, image_url) VALUES (?, ?, ?, ?, ?)`,
      [name, category, stock, price, image_url]
    );

    return NextResponse.json({ success: true, dbId: result.insertId, id: result.insertId });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const dbId      = body.dbId || body.id;
    const name      = body.name || body.product_name || "";
    const category  = body.category || "Uncategorized";
    const stock     = Number(body.stock) || 0;
    const price     = parseFloat(String(body.price).replace(/[^0-9.]/g, "")) || 0;
    const image_url = body.image_url;   // undefined → keep existing; null/string → update

    if (image_url !== undefined) {
      // Update including image_url
      await db.query(
        `UPDATE products SET name = ?, category = ?, stock = ?, price = ?, image_url = ? WHERE id = ?`,
        [name, category, stock, price, image_url || null, dbId]
      );
    } else {
      // Update without touching image_url
      await db.query(
        `UPDATE products SET name = ?, category = ?, stock = ?, price = ? WHERE id = ?`,
        [name, category, stock, price, dbId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Products PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const url  = new URL(req.url);
    const dbId = url.searchParams.get("id");

    if (!dbId) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    console.log(`[Products API] DELETE requested for Product ID: ${dbId}`);

    // OPTION A: Delete child records first to prevent foreign key errors
    await db.query("DELETE FROM cart WHERE product_id = ?", [dbId]);
    await db.query("DELETE FROM order_items WHERE product_id = ?", [dbId]);

    const [result] = await db.query("DELETE FROM products WHERE id = ?", [dbId]);
    console.log(`[Products API] DELETE result from DB:`, result);

    const response = { success: true };
    console.log(`[Products API] Returning response:`, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Products DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}