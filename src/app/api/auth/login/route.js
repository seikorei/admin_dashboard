export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Find user by email
    const [users] = await db.query(
      "SELECT id, name, role, password FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    const user = users[0];

    // Hash input to verify
    const salt = process.env.PASSWORD_SALT || "novamart_salt_2024";
    const hashed = crypto.createHash("sha256").update(password + salt).digest("hex");

    // Allow both the new hashed password OR the old unhashed legacy password
    if (hashed !== user.password && password !== user.password) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    // Generate token
    const secret = process.env.JWT_SECRET || "novamart_secret_2024";
    const payload = Buffer.from(JSON.stringify({ id: user.id, email: email, ts: Date.now() })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const token = `${payload}.${sig}`;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: email.trim().toLowerCase(),
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
