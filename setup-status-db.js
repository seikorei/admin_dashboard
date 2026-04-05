require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function setupDB() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    console.log("Creating order_status table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    console.log("Inserting default values...");
    await db.query(`
      INSERT IGNORE INTO order_status (name) VALUES
      ('Pending'),
      ('Processing'),
      ('Shipped'),
      ('Cancelled');
    `);

    console.log("Setup complete!");
    db.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

setupDB();
