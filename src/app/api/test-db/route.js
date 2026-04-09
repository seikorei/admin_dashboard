export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Perform a minimal handshake handshake (Strictly SELECT 1)
    await db.query("SELECT 1");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Health Check API] Handshake Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
