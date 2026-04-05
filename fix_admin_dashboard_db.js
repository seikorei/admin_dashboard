const mysql = require("mysql2/promise");

async function fixAdminDashboardDb() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "admin_dashboard"
  });

  console.log("Connected to admin_dashboard");

  // Delete non-electronic categories completely
  const [delResult] = await conn.query(
    "DELETE FROM products WHERE category NOT IN ('Electronics', 'Audio', 'Accessories', 'Devices', 'Peripherals')"
  );
  console.log(`Deleted ${delResult.affectedRows} non-electronics items.`);

  // Update categories that might be 'Peripherals' to 'Accessories' to match frontend strictly
  const [updCat] = await conn.query(
    "UPDATE products SET category = 'Accessories' WHERE category = 'Peripherals'"
  );
  console.log(`Updated ${updCat.affectedRows} Peripherals to Accessories.`);

  const urls = [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", // laptop
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", // headphones
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80", // keyboard
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80", // mouse
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80", // smartwatch
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", // speaker
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", // ultrabook
    "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=600&q=80", // usb hub
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", // earbuds
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"  // display
  ];

  // Fetch all remaining electronics products
  const [products] = await conn.query("SELECT id FROM products ORDER BY id ASC");
  
  let updatedCount = 0;
  for (let i = 0; i < products.length; i++) {
    await conn.query(
      "UPDATE products SET image_url = ? WHERE id = ?",
      [urls[i % urls.length], products[i].id]
    );
    updatedCount++;
  }
  
  console.log(`Updated image_url for ${updatedCount} electronics products with guaranteed Unsplash links!`);
  await conn.end();
}

fixAdminDashboardDb().catch(console.error);
