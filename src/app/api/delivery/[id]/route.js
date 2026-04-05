import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["Processing", "Shipped", "In Transit", "Delivered"];

/**
 * PUT /api/deliveries/[id]
 * Updates status (and optionally carrier/address/eta) for a delivery.
 */
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, carrier, address, eta } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Build dynamic SET clause
    const sets   = [];
    const values = [];

    if (status  !== undefined) { sets.push("status = ?");  values.push(status);  }
    if (carrier !== undefined) { sets.push("carrier = ?"); values.push(carrier); }
    if (address !== undefined) { sets.push("address = ?"); values.push(address); }
    if (eta     !== undefined) { sets.push("eta = ?");     values.push(eta);     }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const [result] = await db.query(
      `UPDATE deliveries SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Delivery not found" }, { status: 404 });
    }

    // If status changed to Shipped, also update the linked order's status
    if (status === "Shipped") {
      const [dRows] = await db.query("SELECT order_id FROM deliveries WHERE id = ? LIMIT 1", [id]);
      if (dRows.length > 0 && dRows[0].order_id) {
        await db.query(
          "UPDATE orders SET status = 'Shipped' WHERE id = ? AND status NOT IN ('Cancelled', 'Delivered')",
          [dRows[0].order_id]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delivery PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/deliveries/[id]
 */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    console.log(`[Deliveries API] DELETE requested for Delivery ID: ${id}`);

    const [result] = await db.query("DELETE FROM deliveries WHERE id = ?", [id]);
    console.log(`[Deliveries API] DELETE result from DB:`, result);

    if (result.affectedRows === 0) {
      console.log(`[Deliveries API] No records deleted: ID not found`);
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    const response = { success: true };
    console.log(`[Deliveries API] Returning response:`, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Delivery DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
