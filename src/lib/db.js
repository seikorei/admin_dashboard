import mysql from "mysql2/promise";

let globalPool = null;

export function getDb() {
  const host = process.env.DB_HOST?.trim();
  const port = process.env.DB_PORT?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const database = process.env.DB_NAME?.trim();

  if (!host || !port) {
    console.error("[DB] Missing host or port environment variables.");
    return null; 
  }

  if (!globalPool) {
    console.log(`[DB] Initializing pool for ${host}:${port}`);
    globalPool = mysql.createPool({
      host,
      port: Number(port),
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds timeout for Vercel
      ...(host !== "localhost" && host !== "127.0.0.1" && { ssl: { rejectUnauthorized: false } })
    });
  }
  return globalPool;
}

export const db = {
  query: async (...args) => {
    const pool = getDb();
    if (!pool) {
      throw new Error("CRITICAL ERROR: Database connection is missing! You need to set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in your environment variables on Vercel or .env.local.");
    }
    return await pool.query(...args);
  },
  execute: async (...args) => {
    const pool = getDb();
    if (!pool) {
      throw new Error("CRITICAL ERROR: Database connection is missing! You need to set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in your environment variables on Vercel or .env.local.");
    }
    return await pool.execute(...args);
  }
};