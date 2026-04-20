export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    const salt = process.env.PASSWORD_SALT || "novamart_salt_2024";
    const hashed = crypto.createHash("sha256").update(password + salt).digest("hex");

    // Insert user with hashed password
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email.trim().toLowerCase(), hashed, "user"]
    );

    const userId = result.insertId;

    // Generate token for auto-login
    const secret = process.env.JWT_SECRET || "novamart_salt_2024"; // Note: using same salt/secret pattern as login
    const payload = Buffer.from(JSON.stringify({ id: userId, email: email, ts: Date.now() })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const token = `${payload}.${sig}`;

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name: name,
        email: email.trim().toLowerCase(),
        role: "user"
      }
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
