import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyToken(token) {
  if (!token) return null;
  try {
    const [payload, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", "novamart_secret_2024").update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/me?token=XXX
 * Verifies the admin token and returns admin profile info.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("authorization")?.replace("Bearer ", "");

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await db.query("SELECT id, name, email FROM admins WHERE id = ? LIMIT 1", [decoded.id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, admin: rows[0] });
  } catch (error) {
    console.error("Admin me error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/me
 * Updates admin profile (name, email, password).
 */
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("authorization")?.replace("Bearer ", "");

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, newPassword } = body;

    if (newPassword && newPassword.length >= 6) {
      const hashed = crypto.createHash("sha256").update(newPassword + "novamart_salt_2024").digest("hex");
      await db.query("UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?", [name, email, hashed, decoded.id]);
    } else {
      await db.query("UPDATE admins SET name = ?, email = ? WHERE id = ?", [name, email, decoded.id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin me PUT error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
