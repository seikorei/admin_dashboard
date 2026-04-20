export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email.trim().toLowerCase()]);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "No account found with that email" }, { status: 404 });
    }

    // Hash the new password
    const salt = process.env.PASSWORD_SALT || "novamart_salt_2024";
    const hashed = crypto.createHash("sha256").update(newPassword + salt).digest("hex");

    // Update password in DB
    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashed, email.trim().toLowerCase()]
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Forgot Password API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
