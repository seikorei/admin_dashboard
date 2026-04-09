export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user_id, product_id, quantity } = await req.json();

    if (!user_id || !product_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if item already exists in cart
    const [existing] = await db.query(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE cart SET quantity = quantity + ? WHERE id = ?",
        [quantity || 1, existing[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [user_id, product_id, quantity || 1]
      );
    }

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const [rows] = await db.query(
      `SELECT c.id, c.quantity, p.product_name, p.price, p.image_url 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ?`,
      [user_id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
