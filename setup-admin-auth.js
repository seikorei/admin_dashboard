/**
 * setup-admin-auth.js
 * Run once to create admins + settings tables and seed a default admin account.
 * Usage: node setup-admin-auth.js
 */
const mysql = require("mysql2/promise");
const crypto = require("crypto");

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "admin_dashboard",
};

// Simple SHA-256 hash (no bcrypt dependency needed)
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "novamart_salt_2024").digest("hex");
}

async function main() {
  const db = await mysql.createConnection(DB_CONFIG);
  console.log("✅ Connected to MySQL.");

  // 1. Create admins table
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      name     VARCHAR(255) NOT NULL DEFAULT 'Administrator',
      email    VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT NOW()
    )
  `);
  console.log("✅ admins table ready.");

  // 2. Create settings table (store + notifications combined)
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id                INT PRIMARY KEY DEFAULT 1,
      store_name        VARCHAR(255) DEFAULT 'NovaMart',
      store_email       VARCHAR(255) DEFAULT 'contact@novamart.com',
      store_phone       VARCHAR(50)  DEFAULT '+60 12-345 6789',
      store_address     TEXT         DEFAULT '123 Commerce Blvd, Kuala Lumpur',
      notif_low_stock   TINYINT(1)   DEFAULT 1,
      notif_new_order   TINYINT(1)   DEFAULT 1,
      notif_delivery    TINYINT(1)   DEFAULT 0,
      notif_email       TINYINT(1)   DEFAULT 1,
      notif_sms         TINYINT(1)   DEFAULT 0,
      notif_system      TINYINT(1)   DEFAULT 1,
      updated_at        DATETIME     DEFAULT NOW() ON UPDATE NOW()
    )
  `);
  console.log("✅ settings table ready.");

  // 3. Seed default settings row
  await db.query(`
    INSERT IGNORE INTO settings (id) VALUES (1)
  `);
  console.log("✅ Default settings row ensured.");

  // 4. Ensure admin_settings has full_name & phone columns (backward compat)
  try {
    await db.query(`ALTER TABLE admin_settings ADD COLUMN full_name VARCHAR(255) DEFAULT 'Administrator'`);
  } catch (_) {}
  try {
    await db.query(`ALTER TABLE admin_settings ADD COLUMN phone VARCHAR(50) DEFAULT ''`);
  } catch (_) {}
  try {
    await db.query(`ALTER TABLE admin_settings ADD COLUMN theme VARCHAR(20) DEFAULT 'dark'`);
  } catch (_) {}

  // 5. Seed default admin if none exists
  const [[{ count }]] = await db.query("SELECT COUNT(*) AS count FROM admins");
  if (Number(count) === 0) {
    const hashed = hashPassword("admin123");
    await db.query(
      "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
      ["Administrator", "admin@novamart.com", hashed]
    );
    console.log("✅ Default admin created:");
    console.log("   Email:    admin@novamart.com");
    console.log("   Password: admin123");
  } else {
    console.log("ℹ️  Admin(s) already exist — skipping seed.");
  }

  await db.end();
  console.log("\n🎉 Done! You can now login at /admin/login");
}

main().catch(err => {
  console.error("Setup error:", err);
  process.exit(1);
});
