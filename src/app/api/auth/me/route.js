export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const [rows] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
