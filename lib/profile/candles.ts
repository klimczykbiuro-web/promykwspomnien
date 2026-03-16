import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

export async function getCandleCountBySlug(slug: string): Promise<number | null> {
  const result = await pool.query(
    `
    SELECT
      p.id,
      COUNT(c.id)::int AS candle_count
    FROM profiles p
    LEFT JOIN profile_candles c ON c.profile_id = p.id
    WHERE p.slug = $1
    GROUP BY p.id
    LIMIT 1
    `,
    [slug]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return Number(result.rows[0].candle_count ?? 0);
}

export async function createCandleBySlug(
  slug: string
): Promise<{ count: number } | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profileResult = await client.query(
      `
      SELECT id
      FROM profiles
      WHERE slug = $1
      FOR UPDATE
      `,
      [slug]
    );

    if (profileResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const profileId = profileResult.rows[0].id as string;

    await client.query(
      `
      INSERT INTO profile_candles (id, profile_id, created_at)
      VALUES ($1, $2, NOW())
      `,
      [randomUUID(), profileId]
    );

    const countResult = await client.query(
      `
      SELECT COUNT(*)::int AS candle_count
      FROM profile_candles
      WHERE profile_id = $1
      `,
      [profileId]
    );

    await client.query("COMMIT");

    return {
      count: Number(countResult.rows[0].candle_count ?? 0),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}