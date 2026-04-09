export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Find user by email and plain text password
    const [users] = await db.query(
      "SELECT id, name, role FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const user = users[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
