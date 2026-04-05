/**
 * add-image-url.js
 * Run once to safely add image_url column to products table.
 * Usage: node add-image-url.js
 */
const mysql = require("mysql2/promise");

async function main() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "admin_dashboard",
  });

  console.log("Connected to MySQL.");

  // Check if column already exists
  const [cols] = await db.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'admin_dashboard'
      AND TABLE_NAME   = 'products'
      AND COLUMN_NAME  = 'image_url'
  `);

  if (cols.length > 0) {
    console.log("✅ image_url column already exists — nothing to do.");
  } else {
    await db.query(`ALTER TABLE products ADD COLUMN image_url TEXT`);
    console.log("✅ image_url column added to products table.");
  }

  await db.end();
  console.log("Done.");
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
