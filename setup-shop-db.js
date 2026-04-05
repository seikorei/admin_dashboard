/**
 * Setup script: Creates the 'shop' database and populates electronics products.
 * Run with: node setup-shop-db.js
 */
const mysql = require("mysql2/promise");

async function setup() {
  // Connect without specifying a database first
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
  });

  console.log("Connected to MySQL.");

  // Create database
  await conn.query("CREATE DATABASE IF NOT EXISTS shop");
  console.log("✅ Database 'shop' ready.");
  await conn.query("USE shop");

  // Create products table Drop old one first to remake
  await conn.query("DROP TABLE IF EXISTS products");
  await conn.query(`
    CREATE TABLE products (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255)   NOT NULL,
      category   VARCHAR(100)   NOT NULL,
      price      DECIMAL(10,2)  NOT NULL,
      stock      INT            NOT NULL DEFAULT 50,
      image_url  VARCHAR(500)   NOT NULL
    )
  `);

  console.log("✅ Table 'products' schema enforced smoothly.");

  // Clear old data and insert fresh electronics products
  await conn.query("TRUNCATE TABLE products");
  await conn.query(`
    INSERT INTO products (name, category, price, stock, image_url) VALUES
      ('Laptop Pro 16',         'Electronics',  4599.00, 15,  'https://source.unsplash.com/300x200/?laptop'),
      ('Wireless Headphones',   'Audio',          899.00, 40,  'https://source.unsplash.com/300x200/?headphones'),
      ('Mechanical Keyboard',   'Accessories',    299.00, 60,  'https://source.unsplash.com/300x200/?keyboard'),
      ('Gaming Mouse',          'Accessories',    199.00, 80,  'https://source.unsplash.com/300x200/?mouse'),
      ('Smart Watch Series 9',  'Devices',       1299.00, 25,  'https://source.unsplash.com/300x200/?smartwatch'),
      ('Bluetooth Speaker',     'Audio',          499.00, 35,  'https://source.unsplash.com/300x200/?speaker'),
      ('Ultrabook Air',         'Electronics',   3499.00, 10,  'https://source.unsplash.com/300x200/?laptop'),
      ('USB-C Hub 7-in-1',      'Accessories',    149.00, 100, 'https://source.unsplash.com/300x200/?usb'),
      ('Noise-Cancelling Buds', 'Audio',          599.00, 55,  'https://source.unsplash.com/300x200/?earbuds'),
      ('Smart Display 10in',    'Devices',        799.00, 20,  'https://source.unsplash.com/300x200/?display'),
      ('Gaming Headset',        'Audio',          349.00, 45,  'https://source.unsplash.com/300x200/?headset'),
      ('Mechanical Numpad',     'Accessories',    149.00, 70,  'https://source.unsplash.com/300x200/?numpad')
  `);
  console.log("✅ Inserted 12 fully defined electronics products matching strict schema.");

  await conn.end();
  console.log("\n🎉 Setup complete! The 'shop' database holds completely solid API data mapping.");
}

setup().catch(err => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
