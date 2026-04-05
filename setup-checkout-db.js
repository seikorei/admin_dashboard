const mysql = require("mysql2/promise");

const DB = {
  host: "localhost", user: "root", password: "1234", database: "admin_dashboard",
};

async function main() {
  const db = await mysql.createConnection(DB);
  console.log("✅ Connected.");

  const alterCols = [
    "ALTER TABLE orders ADD COLUMN email VARCHAR(255) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN city VARCHAR(255) DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN address TEXT",
  ];

  for (const sql of alterCols) {
    try {
      await db.query(sql);
      console.log(`✅ Executed: ${sql}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️ Column already exists: ${sql.split('ADD COLUMN ')[1]}`);
      } else {
        console.error(`❌ Error on: ${sql}`, e.message);
      }
    }
  }

  await db.end();
  console.log("🎉 Database checkout setup complete.");
}

main().catch(e => { console.error(e); process.exit(1); });
