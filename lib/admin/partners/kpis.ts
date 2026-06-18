import "server-only";

import pg from "pg";

const { Pool } = pg;

export type AdminPartnerKpis = {
  partner_id: string;
  name: string;
  assigned_lots_count: number;
  assigned_quantity: number;
  plaques_revenue_gross: string;
  activated_profiles_count: number;
  unactivated_quantity: number;
  extended_profiles_count: number;
  extensions_revenue_gross: string;
  activation_rate_percent: string;
};

export type AdminPartnerExtension = {
  partner_id: string;
  profile_id: string;
  full_name: string | null;
  slug: string;
  payment_id: string;
  amount_gross: string;
  years_to_add: number | null;
  paid_at: string | Date | null;
  created_at: string | Date;
};

type QueryResultLike = {
  rows: unknown[];
};

type PgPoolLike = {
  query: (text: string, values?: unknown[]) => Promise<QueryResultLike>;
};

declare global {
  // eslint-disable-next-line no-var
  var __adminPartnerKpiPool: PgPoolLike | undefined;
}

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Brak DATABASE_URL / POSTGRES_URL / POSTGRES_PRISMA_URL / NEON_DATABASE_URL w env."
    );
  }

  return connectionString;
}

function getPool(): PgPoolLike {
  if (global.__adminPartnerKpiPool) {
    return global.__adminPartnerKpiPool;
  }

  const connectionString = getConnectionString();
  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  }) as PgPoolLike;

  if (process.env.NODE_ENV !== "production") {
    global.__adminPartnerKpiPool = pool;
  }

  return pool;
}

export async function getAdminPartnerKpis(
  partnerId: string
): Promise<AdminPartnerKpis | null> {
  const result = await getPool().query(
    `
      SELECT
        partner_id,
        name,
        assigned_lots_count,
        assigned_quantity,
        plaques_revenue_gross::text AS plaques_revenue_gross,
        activated_profiles_count,
        unactivated_quantity,
        extended_profiles_count,
        extensions_revenue_gross::text AS extensions_revenue_gross,
        activation_rate_percent::text AS activation_rate_percent
      FROM admin_partner_kpis
      WHERE partner_id = $1
      LIMIT 1
    `,
    [partnerId]
  );

  const rows = result.rows as AdminPartnerKpis[];

  return rows[0] ?? null;
}

export async function getAdminPartnerExtensions(
  partnerId: string
): Promise<AdminPartnerExtension[]> {
  const result = await getPool().query(
    `
      SELECT
        partner_id,
        profile_id,
        full_name,
        slug,
        payment_id,
        amount_gross::text AS amount_gross,
        years_to_add,
        paid_at,
        created_at
      FROM admin_partner_extensions
      WHERE partner_id = $1
      ORDER BY COALESCE(paid_at, created_at) DESC
      LIMIT 50
    `,
    [partnerId]
  );

  return result.rows as AdminPartnerExtension[];
}
