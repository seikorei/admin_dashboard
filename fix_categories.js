const mysql = require('mysql2/promise');

async function fixCategories() {
    const db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "admin_dashboard"
    });

    console.log("Connected. Fixing database categories...");

    // 1. Update based on name matching
    const queries = [
        ["UPDATE products SET category = 'Fashion' WHERE product_name LIKE ?", ["%Nike%"]],
        ["UPDATE products SET category = 'Electronics' WHERE product_name LIKE ?", ["%Laptop%"]],
        ["UPDATE products SET category = 'Audio' WHERE product_name LIKE ?", ["%Sony%"]],
        ["UPDATE products SET category = 'Audio' WHERE product_name LIKE ?", ["%AirPods%"]],
        ["UPDATE products SET category = 'Peripherals' WHERE product_name LIKE ?", ["%Keyboard%"]],
        ["UPDATE products SET category = 'Peripherals' WHERE product_name LIKE ?", ["%Mouse%"]],
        ["UPDATE products SET category = 'Electronics' WHERE product_name LIKE ?", ["%Smart Watch%"]]
    ];

    for (const [sql, params] of queries) {
        const [result] = await db.query(sql, params);
        console.log(`Updated for ${params[0]}: ${result.affectedRows} rows`);
    }

    // 2. Ensure NO NULLs or empty strings
    const [nullResult] = await db.query("UPDATE products SET category = 'Other' WHERE category IS NULL OR category = ''");
    console.log(`Cleaned up ${nullResult.affectedRows} NULL/Empty categories.`);

    await db.end();
}

fixCategories().catch(console.error);
