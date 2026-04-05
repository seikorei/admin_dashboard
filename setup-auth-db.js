require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function setupAuth() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    console.log("Setting up users table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Ensuring default admin exists...");
    const [rows] = await db.query("SELECT * FROM users WHERE email = 'admin@novamart.com'");
    if (rows.length === 0) {
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin", "admin@novamart.com", "admin123", "admin"]
      );
      console.log("Default admin created: admin@novamart.com / admin123");
    } else {
      console.log("Admin user already exists.");
    }

    console.log("Auth database setup complete!");
    db.end();
  } catch (err) {
    console.error("Auth Setup error:", err);
  }
}
setupAuth();
