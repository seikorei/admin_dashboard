import fetch from 'node-fetch';

async function testApi() {
    try {
        console.log("Fetching from http://localhost:3000/api/products ...");
        const res = await fetch('http://localhost:3000/api/products');
        const data = await res.json();
        console.log("API Response Length:", data.length);
        console.log("Sample Product:", JSON.stringify(data[0], null, 2));
        console.log("Product Categories:", data.map(p => p.category));
    } catch (err) {
        console.error("API Fetch Error (Is the server running on :3000?):", err.message);
    }
}
testApi();
