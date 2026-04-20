// Run this script to create the messages table in your Railway MySQL database
// Usage: node setup-messages-db.js

require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function setup() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1" && { ssl: { rejectUnauthorized: false } })
  });

  console.log("✅ Connected to Railway database.");

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100)  NOT NULL,
      email      VARCHAR(150)  NOT NULL,
      message    TEXT          NOT NULL,
      is_read    TINYINT(1)    NOT NULL DEFAULT 0,
      created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log("✅ Table 'messages' created (or already exists).");
  await connection.end();
  console.log("Done. You can now submit messages via the Contact form.");
}

setup().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
