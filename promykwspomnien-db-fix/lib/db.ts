import { Pool } from "pg";

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
}

const globalForDb = globalThis as typeof globalThis & {
  __pool?: ReturnType<typeof createPool>;
};

export const pool = globalForDb.__pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pool = pool;
}
