const mysql = require('mysql2/promise');

async function checkData() {
    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "admin_dashboard"
    });

    const [rows] = await db.query("SELECT id, name, category, image_url FROM products");
    console.log("Current Products in DB:");
    console.table(rows);

    await db.end();
}

checkData().catch(console.error);
