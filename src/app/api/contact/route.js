export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    // Validate all fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "All fields (name, email, message) are required." },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Log the message to console (demo mode — no email sending)
    console.log("=== NEW CONTACT MESSAGE ===");
    console.log("From:", name, `<${email}>`);
    console.log("Message:", message);
    console.log("Received at:", new Date().toISOString());
    console.log("===========================");

    // Save to DB
    const { db } = await import("@/lib/db");
    await db.query(
      "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), message.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Message received. We will get back to you soon!",
    });

  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
