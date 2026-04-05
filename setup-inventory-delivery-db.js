require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function setup() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "admin_dashboard",
    });

    console.log("Setting up products table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(20),
        name VARCHAR(100),
        category VARCHAR(50),
        stock INT,
        price VARCHAR(20)
      );
    `);

    console.log("Setting up deliveries table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_id VARCHAR(20),
        order_id VARCHAR(20),
        customer VARCHAR(100),
        address VARCHAR(255),
        status VARCHAR(50),
        carrier VARCHAR(50),
        eta DATE
      );
    `);

    const [pRows] = await db.query("SELECT COUNT(*) AS count FROM products");
    if (pRows[0].count === 0) {
      console.log("Inserting default products...");
      await db.query(`
        INSERT INTO products (product_id, name, category, stock, price) VALUES
        ('#PROD-0001', 'Logitech G Pro X', 'Peripherals', 45, '$129.99'),
        ('#PROD-0002', 'Sony WH-1000XM5', 'Electronics', 12, '$348.00'),
        ('#PROD-0003', 'Herman Miller Embody', 'Furniture', 0, '$1,495.00')
      `);
    }

    const [dRows] = await db.query("SELECT COUNT(*) AS count FROM deliveries");
    if (dRows[0].count === 0) {
      console.log("Inserting default deliveries...");
      await db.query(`
        INSERT INTO deliveries (delivery_id, order_id, customer, address, status, carrier, eta) VALUES
        ('#DEL-8901', '#ORD-7421', 'John Doe', '123 Main St, New York, NY 10001', 'In Transit', 'FedEx', '2024-03-25'),
        ('#DEL-8902', '#ORD-7422', 'Jane Smith', '456 Market St, San Francisco, CA 94103', 'Out for Delivery', 'UPS', '2024-03-24'),
        ('#DEL-8903', '#ORD-7423', 'Michael Brown', '789 Elm St, Chicago, IL 60601', 'Delivered', 'USPS', '2024-03-20')
      `);
    }

    console.log("Database setup complete!");
    db.end();
  } catch (err) {
    console.error("Setup error:", err);
  }
}
setup();
