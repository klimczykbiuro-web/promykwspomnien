import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

export type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

type GuestbookRow = {
  id: string | null;
  author_name: string | null;
  message: string | null;
  created_at: string | null;
};

export async function getGuestbookEntriesBySlug(
  slug: string,
  limit = 20
): Promise<GuestbookEntry[] | null> {
  const result = await pool.query(
    `
    SELECT
      g.id,
      g.author_name,
      g.message,
      g.created_at
    FROM profiles p
    LEFT JOIN profile_guestbook_entries g
      ON g.profile_id = p.id
     AND g.moderation_status = 'active'
    WHERE p.slug = $1
    ORDER BY g.created_at DESC NULLS LAST
    LIMIT $2
    `,
    [slug, limit]
  );

  if (result.rowCount === 0) {
    const profileResult = await pool.query(
      `
      SELECT id
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (profileResult.rowCount === 0) {
      return null;
    }

    return [];
  }

  const rows = result.rows as GuestbookRow[];

  const filteredRows = rows.filter((row: GuestbookRow) => row.id);

  return filteredRows.map((row: GuestbookRow) => ({
    id: row.id as string,
    author_name: row.author_name as string,
    message: row.message as string,
    created_at: row.created_at as string,
  }));
}

export async function createGuestbookEntryBySlug(input: {
  slug: string;
  authorName: string;
  message: string;
}): Promise<GuestbookEntry | null> {
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
      [input.slug]
    );

    if (profileResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const profileId = profileResult.rows[0].id as string;
    const entryId = randomUUID();

    const insertResult = await client.query(
      `
      INSERT INTO profile_guestbook_entries (
        id,
        profile_id,
        author_name,
        message,
        moderation_status,
        created_at
      )
      VALUES ($1, $2, $3, $4, 'active', NOW())
      RETURNING
        id,
        author_name,
        message,
        created_at
      `,
      [entryId, profileId, input.authorName, input.message]
    );

    await client.query("COMMIT");

    const row = insertResult.rows[0] as GuestbookEntry;

    return {
      id: row.id,
      author_name: row.author_name,
      message: row.message,
      created_at: row.created_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}