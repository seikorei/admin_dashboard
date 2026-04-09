import mysql from "mysql2/promise";

let globalPool = null;

export function getDb() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;

  if (!host || !port) {
    console.error("[DB] Missing host or port environment variables.");
    return null; 
  }

  if (!globalPool) {
    console.log(`[DB] Connecting to ${host.substring(0, 3)}...${host.substring(host.length - 4)}:${port}`);
    globalPool = mysql.createPool({
      host: host,
      port: Number(port),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
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