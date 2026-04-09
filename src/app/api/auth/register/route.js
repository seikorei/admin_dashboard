export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    // Insert user with plain text password
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, "customer"]
    );

    return NextResponse.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
