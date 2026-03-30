import { pool } from "@/lib/db";

export type OwnerGuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

type ProfileSettingsRow = {
  guestbook_enabled: boolean;
};

type GuestbookEntryRow = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

export async function getOwnerGuestbookDashboard(profileId: string) {
  const [profileResult, entriesResult] = await Promise.all([
    pool.query(
      `
      SELECT guestbook_enabled
      FROM profiles
      WHERE id = $1
      LIMIT 1
      `,
      [profileId]
    ),
    pool.query(
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
      LIMIT 100
      `,
      [profileId]
    ),
  ]);

  if (profileResult.rowCount === 0) {
    return null;
  }

  const profile = profileResult.rows[0] as ProfileSettingsRow;
  const rows = entriesResult.rows as GuestbookEntryRow[];

  return {
    guestbookEnabled: profile.guestbook_enabled,
    entries: rows.map((row) => ({
      id: row.id,
      author_name: row.author_name,
      message: row.message,
      created_at: row.created_at,
    })),
  };
}

export async function updateOwnerGuestbookSettings(
  profileId: string,
  enabled: boolean
) {
  const result = await pool.query(
    `
    UPDATE profiles
    SET guestbook_enabled = $2
    WHERE id = $1
    RETURNING guestbook_enabled
    `,
    [profileId, enabled]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0] as ProfileSettingsRow;

  return {
    guestbookEnabled: row.guestbook_enabled,
  };
}

export async function updateOwnerGuestbookEntry(input: {
  profileId: string;
  entryId: string;
  authorName: string;
  message: string;
}) {
  const result = await pool.query(
    `
    UPDATE profile_guestbook_entries
    SET
      author_name = $3,
      message = $4
    WHERE id = $1
      AND profile_id = $2
      AND moderation_status = 'active'
    RETURNING
      id,
      author_name,
      message,
      created_at
    `,
    [input.entryId, input.profileId, input.authorName, input.message]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0] as GuestbookEntryRow;

  return {
    id: row.id,
    author_name: row.author_name,
    message: row.message,
    created_at: row.created_at,
  };
}

export async function deleteOwnerGuestbookEntry(input: {
  profileId: string;
  entryId: string;
}) {
  const result = await pool.query(
    `
    UPDATE profile_guestbook_entries
    SET moderation_status = 'removed'
    WHERE id = $1
      AND profile_id = $2
      AND moderation_status = 'active'
    RETURNING id
    `,
    [input.entryId, input.profileId]
  );

  return result.rowCount > 0;
}