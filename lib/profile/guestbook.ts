import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

export type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

type ProfileGuestbookRow = {
  id: string;
  guestbook_enabled: boolean;
};

type GuestbookEntryRow = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

export async function getPublicGuestbookStateBySlug(
  slug: string,
  limit = 20
): Promise<{ enabled: boolean; entries: GuestbookEntry[] } | null> {
  const profileResult = await pool.query(
    `
    SELECT id, guestbook_enabled
    FROM profiles
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  if (profileResult.rowCount === 0) {
    return null;
  }

  const profile = profileResult.rows[0] as ProfileGuestbookRow;

  if (!profile.guestbook_enabled) {
    return {
      enabled: false,
      entries: [],
    };
  }

  const entriesResult = await pool.query(
    `
    SELECT
      id,
      author_name,
      message,
      created_at
    FROM profile_guestbook_entries
    WHERE profile_id = $1
      AND moderation_status = 'active'
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [profile.id, limit]
  );

  const rows = entriesResult.rows as GuestbookEntryRow[];

  return {
    enabled: true,
    entries: rows.map((row) => ({
      id: row.id,
      author_name: row.author_name,
      message: row.message,
      created_at: row.created_at,
    })),
  };
}

export async function createGuestbookEntryBySlug(input: {
  slug: string;
  authorName: string;
  message: string;
}): Promise<
  | { kind: "created"; entry: GuestbookEntry }
  | { kind: "not_found" }
  | { kind: "disabled" }
> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profileResult = await client.query(
      `
      SELECT id, guestbook_enabled
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      FOR UPDATE
      `,
      [input.slug]
    );

    if (profileResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { kind: "not_found" };
    }

    const profile = profileResult.rows[0] as ProfileGuestbookRow;

    if (!profile.guestbook_enabled) {
      await client.query("ROLLBACK");
      return { kind: "disabled" };
    }

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
      [entryId, profile.id, input.authorName, input.message]
    );

    await client.query("COMMIT");

    const row = insertResult.rows[0] as GuestbookEntryRow;

    return {
      kind: "created",
      entry: {
        id: row.id,
        author_name: row.author_name,
        message: row.message,
        created_at: row.created_at,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}