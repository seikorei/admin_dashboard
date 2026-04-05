const mysql = require('mysql2/promise');

async function countData() {
    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "admin_dashboard"
    });

    const [rows] = await db.query("SELECT COUNT(*) as count FROM products");
    console.log(`Total Products in DB: ${rows[0].count}`);

    const [all] = await db.query("SELECT id, product_name, category FROM products");
    console.table(all);

    await db.end();
}

countData().catch(console.error);
