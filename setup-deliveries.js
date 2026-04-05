/**
 * setup-deliveries.js
 * Ensures the deliveries table has the correct schema and
 * backfills deliveries for any Paid orders that don't have one yet.
 * Usage: node setup-deliveries.js
 */
const mysql = require("mysql2/promise");

const DB = {
  host: "localhost", user: "root", password: "1234", database: "admin_dashboard",
};

async function main() {
  const db = await mysql.createConnection(DB);
  console.log("✅ Connected.");

  // 1. Create deliveries table with full schema
  await db.query(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      delivery_id    VARCHAR(20)  DEFAULT NULL,
      order_id       INT          DEFAULT NULL,
      customer       VARCHAR(255) DEFAULT 'Unknown',
      address        TEXT,
      carrier        VARCHAR(50)  DEFAULT 'DHL',
      status         VARCHAR(50)  DEFAULT 'Processing',
      eta            DATE         DEFAULT NULL,
      items_count    INT          DEFAULT 1,
      created_at     DATETIME     DEFAULT NOW()
    )
  `);
  console.log("✅ deliveries table ready.");

  // 2. Safe ALTER: add columns that might not exist
  const alterCols = [
    "ALTER TABLE deliveries ADD COLUMN delivery_id VARCHAR(20) DEFAULT NULL",
    "ALTER TABLE deliveries ADD COLUMN carrier VARCHAR(50) DEFAULT 'DHL'",
    "ALTER TABLE deliveries ADD COLUMN items_count INT DEFAULT 1",
    "ALTER TABLE deliveries ADD COLUMN created_at DATETIME DEFAULT NOW()",
  ];
  for (const sql of alterCols) {
    try { await db.query(sql); } catch (_) { /* column already exists */ }
  }

  // 3. Backfill: create delivery for any Paid order without one
  const [paidOrders] = await db.query(`
    SELECT o.id, o.customer, o.amount, o.created_at,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
    FROM orders o
    WHERE LOWER(o.status) IN ('paid', 'shipped')
      AND o.id NOT IN (SELECT COALESCE(order_id, -1) FROM deliveries WHERE order_id IS NOT NULL)
  `);

  let created = 0;
  for (const o of paidOrders) {
    const eta = new Date();
    eta.setDate(eta.getDate() + 3);
    const etaStr = eta.toISOString().split("T")[0];

    const [res] = await db.query(
      `INSERT INTO deliveries (order_id, customer, address, carrier, status, eta, items_count, created_at)
       VALUES (?, ?, ?, 'DHL', 'Processing', ?, ?, NOW())`,
      [o.id, o.customer || "Unknown", "", etaStr, Math.max(1, Number(o.item_count))]
    );
    const newId = res.insertId;
    await db.query(
      `UPDATE deliveries SET delivery_id = ? WHERE id = ?`,
      [`#DEL-${String(newId).padStart(4, "0")}`, newId]
    );
    created++;
  }

  if (created > 0) {
    console.log(`✅ Backfilled ${created} delivery record(s) for existing Paid orders.`);
  } else {
    console.log("ℹ️  No new deliveries to backfill.");
  }

  await db.end();
  console.log("🎉 Done.");
}

main().catch(e => { console.error(e); process.exit(1); });
