export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database configuration missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required." },
        { status: 400 }
      );
    }

    const [rows] = await db.query("SELECT * FROM admins WHERE email = ? LIMIT 1", [
      email.trim().toLowerCase(),
    ]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const admin = rows[0];

    const salt = process.env.PASSWORD_SALT || "novamart_salt_2024";
    const hashed = crypto.createHash("sha256").update(password + salt).digest("hex");

    if (hashed !== admin.password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "novamart_secret_2024";
    const payload = Buffer.from(JSON.stringify({ id: admin.id, email: admin.email, ts: Date.now() })).toString("base64url");
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const token = `${payload}.${sig}`;

    return NextResponse.json({
      success: true,
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
