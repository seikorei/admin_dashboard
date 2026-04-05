require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function testDB() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    const [rows] = await db.query("SELECT * FROM orders LIMIT 2");
    console.log("Existing Orders:", rows);

    // Test inserting a row to delete
    const [insertResult] = await db.query(
      "INSERT INTO orders (customer, order_date, status, amount) VALUES (?, ?, ?, ?)",
      ["Test Debug", "2024-01-01", "Pending", "$100.00"]
    );
    const insertId = insertResult.insertId;
    console.log("Inserted test row:", insertId);

    // Test DELETING the row
    const [deleteResult] = await db.execute("DELETE FROM orders WHERE id = ?", [insertId]);
    console.log("Delete result affectedRows:", deleteResult.affectedRows);

    db.end();
  } catch (err) {
    console.error("DB Error:", err);
  }
}

testDB();
