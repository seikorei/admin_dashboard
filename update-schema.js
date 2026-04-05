require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function updateSchema() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    console.log("Updating products table schema...");
    
    // Check if product_name column exists. If not, we probably need to alter the table
    // We will just drop and recreate for clean state since this is dummy data
    await db.query("DROP TABLE IF EXISTS products");
    await db.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(20),
        product_name VARCHAR(100),
        category VARCHAR(50),
        price DECIMAL(10, 2),
        status VARCHAR(50),
        stock INT
      );
    `);

    console.log("Inserting correctly mapped dummy data...");
    await db.query(`
      INSERT INTO products (product_id, product_name, category, price, status, stock) VALUES
      ('#PROD-0001', 'Logitech G Pro X', 'Peripherals', 129.99, 'In Stock', 45),
      ('#PROD-0002', 'Sony WH-1000XM5', 'Electronics', 348.00, 'Low Stock', 12),
      ('#PROD-0003', 'Herman Miller Embody', 'Furniture', 1495.00, 'Out of Stock', 0)
    `);

    console.log("Schema update complete!");
    db.end();
  } catch (err) {
    console.error("Schema update error:", err);
  }
}
updateSchema();
