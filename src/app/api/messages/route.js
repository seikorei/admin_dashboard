export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const [messages] = await db.query(
      "SELECT id, name, email, message, is_read, created_at FROM messages ORDER BY created_at DESC"
    );

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[Get Messages API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error while fetching messages." },
      { status: 500 }
    );
  }
}
