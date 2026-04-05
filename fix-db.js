require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function fixDB() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    console.log("Cleaning order_status table...");
    await db.query("DELETE FROM order_status;");
    
    // reset auto increment
    await db.query("ALTER TABLE order_status AUTO_INCREMENT = 1;");

    console.log("Inserting clean default values...");
    await db.query(`
      INSERT INTO order_status (name) VALUES
      ('Pending'),
      ('Processing'),
      ('Shipped'),
      ('Cancelled');
    `);

    console.log("DB fix complete!");
    db.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

fixDB();
