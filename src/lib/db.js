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
      ssl: {
        rejectUnauthorized: false // Required for Railway and many managed DBs
      }
    });
  }
  return globalPool;
}

export const db = {
  query: async (...args) => {
    const pool = getDb();
    if (!pool) return [[], []];
    return await pool.query(...args);
  },
  execute: async (...args) => {
    const pool = getDb();
    if (!pool) return [[], []];
    return await pool.execute(...args);
  }
};