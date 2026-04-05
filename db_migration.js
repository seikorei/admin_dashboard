const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'admin_dashboard'
  });

  try {
    console.log("Dropping existing products table in admin_dashboard...");
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('DROP TABLE IF EXISTS products');

    console.log("Creating unified products table schema...");
    await db.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(100),
        price DECIMAL(10,2),
        stock INT,
        image_url TEXT
      )
    `);

    console.log("Copying data natively from shop.products...");
    await db.query(`
      INSERT INTO admin_dashboard.products (name, category, price, stock, image_url)
      SELECT name, category, price, stock, image_url
      FROM shop.products
    `);

    const [rows] = await db.query('SELECT * FROM admin_dashboard.products');
    console.log("Successfully migrated " + rows.length + " products into admin_dashboard.products!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    await db.end();
  }
}

run();
