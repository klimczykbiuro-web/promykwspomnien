import { Pool } from "pg";

function getRawConnectionString() {
  const raw =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

  if (!raw) {
    throw new Error("Missing DATABASE_URL_UNPOOLED or DATABASE_URL");
  }

  return raw;
}

function createPool() {
  const raw = getRawConnectionString();
  const url = new URL(raw);

  const user = decodeURIComponent(url.username || "");
  const password = decodeURIComponent(url.password || "");
  const host = url.hostname;
  const port = url.port ? Number(url.port) : 5432;
  const database = url.pathname.replace(/^\//, "");

  if (!user) {
    throw new Error("Database user is empty in connection string");
  }

  if (!password) {
    throw new Error("Database password is empty in connection string");
  }

  if (!host) {
    throw new Error("Database host is empty in connection string");
  }

  if (!database) {
    throw new Error("Database name is empty in connection string");
  }

  return new Pool({
    user,
    password,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

type PgPool = ReturnType<typeof createPool>;

const globalForDb = globalThis as typeof globalThis & {
  __pgPool?: PgPool;
};

function getPool(): PgPool {
  if (globalForDb.__pgPool) {
    return globalForDb.__pgPool;
  }

  const created = createPool();

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__pgPool = created;
  }

  return created;
}

export const pool = new Proxy({} as PgPool, {
  get(_target, prop) {
    const realPool = getPool();
    const value = (realPool as any)[prop];
    return typeof value === "function" ? value.bind(realPool) : value;
  },
});