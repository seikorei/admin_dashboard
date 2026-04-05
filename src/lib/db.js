import mysql from "mysql2/promise";

// Load .env for standalone scripts (Next.js handles this automatically for the app)
try {
  require("dotenv").config();
} catch (e) {
  // .env loading fallback for specific environments
}

// STRICT ENVIRONMENT VALIDATION
if (!process.env.DB_HOST || !process.env.DB_PORT) {
  throw new Error(
    "CRITICAL DATABASE CONFIG ERROR: DB_HOST or DB_PORT is missing from Environment Variables."
  );
}

/**
 * PRODUCTION-GRADE DATABASE CONNECTION POOL
 * Strictly relies on process.env configuration.
 * Configured for scalability and persistence on Vercel/Railway.
 */
export const db = mysql.createPool({
  host:               process.env.DB_HOST,
  port:        Number(process.env.DB_PORT),
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,           // Optimized for Vercel Serverless/Railway Proxy
  maxIdle:            10, 
  idleTimeout:        60000,        // 1 minute idle timeout
  queueLimit:         0,
  enableKeepAlive:    true,         // Prevent stale connections
  keepAliveInitialDelay: 0,
});

// Global Pool Error Logging 
db.on("error", (err) => {
  console.error("[Database Pool Error]:", err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("[Database Pool Error]: Connection to DB was lost.");
  }
});