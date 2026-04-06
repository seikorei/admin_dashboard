import mysql from "mysql2/promise";

let globalPool = null;

export function getDb() {
  if (!process.env.DB_HOST || !process.env.DB_PORT) {
    return null; 
  }

  if (!globalPool) {
    globalPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
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