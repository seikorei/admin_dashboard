import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "novamart_salt_2024").digest("hex");
}

function makeToken(adminId, email) {
  // Simple signed token: base64(payload).signature
  const payload = Buffer.from(JSON.stringify({ id: adminId, email, ts: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", "novamart_secret_2024").update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required." }, { status: 400 });
    }

    const [rows] = await db.query("SELECT * FROM admins WHERE email = ? LIMIT 1", [email.trim().toLowerCase()]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const admin = rows[0];
    const hashed = hashPassword(password);

    if (hashed !== admin.password) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const token = makeToken(admin.id, admin.email);

    return NextResponse.json({
      success: true,
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
