import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

type PurgedProfile = {
  profileId: string;
  slug: string;
  expiresAt: string | null;
  deletedGalleryImages: number;
  deletedCandles: number;
  deletedSessions: number;
  qrDisabled: boolean;
};

type PurgeExpiredProfilesResult = {
  scanned: number;
  purged: PurgedProfile[];
};

export async function purgeExpiredProfiles(options?: {
  limit?: number;
  dryRun?: boolean;
}) {
  const limit = options?.limit ?? 100;
  const dryRun = options?.dryRun ?? false;

  const candidatesResult = await pool.query(
    `
    SELECT
      p.id,
      p.slug,
      p.expires_at,
      p.source_qr_code_id
    FROM profiles p
    WHERE p.expires_at IS NOT NULL
      AND p.expires_at < NOW() - INTERVAL '3 months'
      AND (
        p.hero_image_url IS NOT NULL
        OR p.quote IS NOT NULL
        OR p.biography IS NOT NULL
        OR p.owner_user_id IS NOT NULL
        OR p.owner_password_hash IS NOT NULL
        OR p.owner_claim_token_hash IS NOT NULL
        OR p.owner_claimed_at IS NOT NULL
        OR p.owner_access_enabled = TRUE
        OR EXISTS (
          SELECT 1
          FROM profile_gallery_images g
          WHERE g.profile_id = p.id
        )
        OR EXISTS (
          SELECT 1
          FROM profile_candles c
          WHERE c.profile_id = p.id
        )
      )
    ORDER BY p.expires_at ASC
    LIMIT $1
    `,
    [limit]
  );

  type CandidateRow = {
    id: string;
    slug: string;
    expires_at: string | null;
    source_qr_code_id: string | null;
  };

  const candidates = candidatesResult.rows as CandidateRow[];

  if (dryRun) {
    return {
      scanned: candidates.length,
      purged: candidates.map((candidate) => ({
        profileId: candidate.id,
        slug: candidate.slug,
        expiresAt: candidate.expires_at,
        deletedGalleryImages: 0,
        deletedCandles: 0,
        deletedSessions: 0,
        qrDisabled: Boolean(candidate.source_qr_code_id),
      })),
    } satisfies PurgeExpiredProfilesResult;
  }

  const purged: PurgedProfile[] = [];

  for (const candidate of candidates) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const profileResult = await client.query(
        `
        SELECT
          id,
          slug,
          expires_at,
          source_qr_code_id
        FROM profiles
        WHERE id = $1
          AND expires_at IS NOT NULL
          AND expires_at < NOW() - INTERVAL '3 months'
        FOR UPDATE
        `,
        [candidate.id]
      );

      if (profileResult.rowCount === 0) {
        await client.query("ROLLBACK");
        continue;
      }

      const profile = profileResult.rows[0] as CandidateRow;

      const deleteSessionsResult = await client.query(
        `
        DELETE FROM owner_sessions
        WHERE profile_id = $1
        `,
        [profile.id]
      );

      const deleteGalleryResult = await client.query(
        `
        DELETE FROM profile_gallery_images
        WHERE profile_id = $1
        `,
        [profile.id]
      );

      const deleteCandlesResult = await client.query(
        `
        DELETE FROM profile_candles
        WHERE profile_id = $1
        `,
        [profile.id]
      );

      let qrDisabled = false;

      if (profile.source_qr_code_id) {
        const qrResult = await client.query(
          `
          UPDATE qr_codes
          SET
            status = 'disabled',
            is_enabled = FALSE,
            disabled_at = COALESCE(disabled_at, NOW()),
            disabled_reason = COALESCE(disabled_reason, 'profile_purged_after_grace_period'),
            updated_at = NOW()
          WHERE id = $1
          RETURNING id, run_id, lot_id
          `,
          [profile.source_qr_code_id]
        );

        if (qrResult.rowCount === 1) {
          qrDisabled = true;

          const qr = qrResult.rows[0] as {
            id: string;
            run_id: string | null;
            lot_id: string | null;
          };

          await client.query(
            `
            INSERT INTO qr_audit_log (
              id,
              run_id,
              lot_id,
              qr_code_id,
              actor_type,
              actor_label,
              event_type,
              payload_json,
              created_at
            )
            VALUES ($1, $2, $3, $4, 'system', 'cleanup', 'qr_disabled_after_profile_purge', $5::jsonb, NOW())
            `,
            [
              randomUUID(),
              qr.run_id,
              qr.lot_id,
              qr.id,
              JSON.stringify({
                profileId: profile.id,
                slug: profile.slug,
              }),
            ]
          );
        }
      }

      await client.query(
        `
        UPDATE profiles
        SET
          hero_image_url = NULL,
          quote = NULL,
          biography = NULL,
          owner_user_id = NULL,
          owner_password_hash = NULL,
          owner_claim_token_hash = NULL,
          owner_claimed_at = NULL,
          owner_access_enabled = FALSE,
          updated_at = NOW()
        WHERE id = $1
        `,
        [profile.id]
      );

      await client.query("COMMIT");

      purged.push({
        profileId: profile.id,
        slug: profile.slug,
        expiresAt: profile.expires_at,
        deletedGalleryImages: deleteGalleryResult.rowCount ?? 0,
        deletedCandles: deleteCandlesResult.rowCount ?? 0,
        deletedSessions: deleteSessionsResult.rowCount ?? 0,
        qrDisabled,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    scanned: candidates.length,
    purged,
  } satisfies PurgeExpiredProfilesResult;
}