export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { user_id, total_amount, customer_name } = await req.json();

    if (!user_id) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    // 1. Get cart items
    const [cartItems] = await db.query(
      "SELECT c.product_id, c.quantity, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?",
      [user_id]
    );

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    // 2. Create Order
    const order_id_formatted = `ORD-${Date.now().toString().slice(-6)}`;
    const [orderResult] = await db.query(
      "INSERT INTO orders (order_id, customer, status, amount, user_id) VALUES (?, ?, ?, ?, ?)",
      [order_id_formatted, customer_name || "Customer", "Pending", total_amount, user_id]
    );
    const db_order_id = orderResult.insertId;

    // 3. Move items to order_items
    for (const item of cartItems) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [db_order_id, item.product_id, item.quantity, item.price]
      );
    }

    // 4. Clear Cart
    await db.query("DELETE FROM cart WHERE user_id = ?", [user_id]);

    return NextResponse.json({ success: true, order_id: order_id_formatted });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
