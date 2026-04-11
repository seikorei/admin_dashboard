const BASE_URL = 'https://admindashboard-vert-one.vercel.app';
const routes = [
  "/api/admin/login",
  "/api/admin/me",
  "/api/admin/orders",
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/register",
  "/api/cart",
  "/api/checkout",
  "/api/delivery",
  "/api/order-items",
  "/api/orders",
  "/api/products",
  "/api/settings",
  "/api/status",
  "/api/test-db",
  "/api/upload",
  "/about",
  "/account",
  "/admin/dashboard",
  "/admin/login",
  "/admin",
  "/cart",
  "/checkout",
  "/contact",
  "/delivery",
  "/home",
  "/inventory",
  "/login",
  "/register",
  "/sales",
  "/settings",
  "/shop",
  "/"
];

async function audit() {
  console.log(`🚀 Starting Full Audit for: ${BASE_URL}\n`);
  const results = {
    ready: [],
    broken: [],
    missing: []
  };

  for (const route of routes) {
    try {
      const resp = await fetch(`${BASE_URL}${route}`);
      const status = resp.status;
      
      if (status === 200) {
        results.ready.push({ route, status });
        console.log(`✅ [${status}] ${route}`);
      } else if (status === 404) {
        results.missing.push({ route, status });
        console.log(`⚠️ [${status}] ${route}`);
      } else {
        results.broken.push({ route, status });
        console.log(`❌ [${status}] ${route}`);
      }
    } catch (err) {
      results.broken.push({ route, error: err.message });
      console.log(`❌ [ERROR] ${route}: ${err.message}`);
    }
  }

  console.log('\n--- Final Audit Summary ---');
  console.log(`Total Routes: ${routes.length}`);
  console.log(`✅ Ready: ${results.ready.length}`);
  console.log(`❌ Broken: ${results.broken.length}`);
  console.log(`⚠️ Missing: ${results.missing.length}`);
}

audit();
