export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email, newPassword } = await req.json();

    // 1. Validate input fields
    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 2. Check if user exists
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found. Please check your email." },
        { status: 404 }
      );
    }

    // 3. Hash new password using the same SHA-256 + salt method as login
    const salt = process.env.PASSWORD_SALT || "novamart_salt_2024";
    const hashedPassword = crypto
      .createHash("sha256")
      .update(newPassword + salt)
      .digest("hex");

    // 4. Update the password in the database
    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email.trim().toLowerCase()]
    );

    console.log(`[Reset Password] Password updated for: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });

  } catch (error) {
    console.error("[Reset Password] API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
