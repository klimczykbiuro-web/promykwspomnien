import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";
import {
  generateSessionToken,
  getSessionExpiresAt,
  hashPassword,
} from "@/lib/owner/auth";
import {
  generateLotCode,
  generateQrRawToken,
  generateRunCode,
  getQrTokenPrefix,
  hashQrToken,
} from "@/lib/qr/tokens";

type DbClient = Awaited<ReturnType<typeof pool.connect>>;

type CreateQrRunInput = {
  runName: string;
  count: number;
  notes?: string | null;
};

type MarkLotsSoldInput = {
  lotCodes: string[];
  soldToLabel: string | null;
  soldNote: string | null;
};

export async function createQrRunWithLots(input: CreateQrRunInput) {
  if (input.count < 1 || input.count > 10000) {
    throw new Error("Count must be between 1 and 10000.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const runId = randomUUID();
    const runCode = await generateUniqueRunCode(client);

    await client.query(
      `
      INSERT INTO qr_runs (
        id, run_code, run_name, planned_quantity, generated_quantity,
        status, is_enabled, notes, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'generated', TRUE, $6, NOW(), NOW())
      `,
      [runId, runCode, input.runName, input.count, input.count, input.notes ?? null]
    );

    const lotsNeeded = Math.ceil(input.count / 1000);
    const lots: Array<{ id: string; lotCode: string; quantity: number }> = [];
    let remaining = input.count;

    for (let i = 0; i < lotsNeeded; i += 1) {
      const quantity = Math.min(1000, remaining);
      const lotId = randomUUID();
      const lotCode = await generateUniqueLotCode(client);

      await client.query(
        `
        INSERT INTO qr_lots (
          id, run_id, lot_code, quantity, status, is_enabled, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, 'in_stock', TRUE, NOW(), NOW())
        `,
        [lotId, runId, lotCode, quantity]
      );

      lots.push({ id: lotId, lotCode, quantity });
      remaining -= quantity;
    }

    const qrRecords: Array<{
      id: string;
      rawToken: string;
      tokenHash: string;
      tokenPrefix: string;
      lotId: string;
      sheetNo: number;
      sheetRow: number;
      sheetCol: number;
    }> = [];

    let globalIndex = 0;

    for (const lot of lots) {
      for (let i = 0; i < lot.quantity; i += 1) {
        const rawToken = generateQrRawToken();

        qrRecords.push({
          id: randomUUID(),
          rawToken,
          tokenHash: hashQrToken(rawToken),
          tokenPrefix: getQrTokenPrefix(rawToken),
          lotId: lot.id,
          sheetNo: Math.floor(globalIndex / 25) + 1,
          sheetRow: Math.floor((globalIndex % 25) / 5) + 1,
          sheetCol: (globalIndex % 5) + 1,
        });

        globalIndex += 1;
      }
    }

    for (const qr of qrRecords) {
      await client.query(
        `
        INSERT INTO qr_codes (
          id, run_id, lot_id, token_hash, token_prefix, status, is_enabled,
          sheet_no, sheet_row, sheet_col, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'generated', TRUE, $6, $7, $8, NOW(), NOW())
        `,
        [
          qr.id,
          runId,
          qr.lotId,
          qr.tokenHash,
          qr.tokenPrefix,
          qr.sheetNo,
          qr.sheetRow,
          qr.sheetCol,
        ]
      );
    }

    await client.query(
      `
      INSERT INTO qr_audit_log (
        id, run_id, actor_type, actor_label, event_type, payload_json, created_at
      )
      VALUES ($1, $2, 'system', 'generator', 'run_generated', $3::jsonb, NOW())
      `,
      [
        randomUUID(),
        runId,
        JSON.stringify({
          runName: input.runName,
          count: input.count,
          lots: lots.map((lot) => ({
            lotCode: lot.lotCode,
            quantity: lot.quantity,
          })),
        }),
      ]
    );

    await client.query("COMMIT");

    return {
      runId,
      runCode,
      lots,
      qrRecords,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getQrActivationState(rawToken: string) {
  const tokenHash = hashQrToken(rawToken);

  const result = await pool.query(
    `
    SELECT
      q.id,
      q.status,
      q.is_enabled,
      q.profile_id,
      p.slug,
      l.is_enabled AS lot_enabled,
      r.is_enabled AS run_enabled
    FROM qr_codes q
    JOIN qr_lots l ON l.id = q.lot_id
    JOIN qr_runs r ON r.id = q.run_id
    LEFT JOIN profiles p ON p.id = q.profile_id
    WHERE q.token_hash = $1
    LIMIT 1
    `,
    [tokenHash]
  );

  if (result.rowCount === 0) {
    return { state: "not_found" as const };
  }

  const row = result.rows[0] as {
    id: string;
    status: string;
    is_enabled: boolean;
    profile_id: string | null;
    slug: string | null;
    lot_enabled: boolean;
    run_enabled: boolean;
  };

  if (!row.is_enabled || !row.lot_enabled || !row.run_enabled || row.status === "disabled") {
    return { state: "disabled" as const };
  }

  if (row.profile_id && row.slug) {
    return { state: "activated" as const, slug: row.slug };
  }

  return { state: "available" as const, qrCodeId: row.id };
}

export async function markLotsSold(input: MarkLotsSoldInput) {
  const cleaned = input.lotCodes
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return { updated: [] as Array<{ id: string; lot_code: string }> };
  }

  const result = await pool.query(
    `
    UPDATE qr_lots
    SET
      status = 'sold',
      sold_at = COALESCE(sold_at, NOW()),
      sold_to_label = COALESCE($2, sold_to_label),
      sold_note = COALESCE($3, sold_note),
      updated_at = NOW()
    WHERE lot_code = ANY($1::text[])
    RETURNING id, lot_code
    `,
    [cleaned, input.soldToLabel, input.soldNote]
  );

  return {
    updated: result.rows as Array<{ id: string; lot_code: string }>,
  };
}

export async function activateQrCodeAndCreateProfile(input: {
  rawToken: string;
  fullName: string;
  password: string;
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tokenHash = hashQrToken(input.rawToken);

    const qrResult = await client.query(
      `
      SELECT
        q.id,
        q.run_id,
        q.lot_id,
        q.profile_id,
        q.status,
        q.is_enabled,
        l.is_enabled AS lot_enabled,
        r.is_enabled AS run_enabled
      FROM qr_codes q
      JOIN qr_lots l ON l.id = q.lot_id
      JOIN qr_runs r ON r.id = q.run_id
      WHERE q.token_hash = $1
      FOR UPDATE
      `,
      [tokenHash]
    );

    if (qrResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { ok: false as const, reason: "not_found" as const };
    }

    const qr = qrResult.rows[0] as {
      id: string;
      run_id: string;
      lot_id: string;
      profile_id: string | null;
      status: string;
      is_enabled: boolean;
      lot_enabled: boolean;
      run_enabled: boolean;
    };

    if (!qr.is_enabled || !qr.lot_enabled || !qr.run_enabled || qr.status === "disabled") {
      await client.query("ROLLBACK");
      return { ok: false as const, reason: "disabled" as const };
    }

    if (qr.profile_id) {
      await client.query("ROLLBACK");
      return { ok: false as const, reason: "already_activated" as const };
    }

    const profileId = randomUUID();
    const slug = await generateUniqueSlug(client, input.fullName);
    const passwordHash = hashPassword(input.password);
    const legacyQrToken = generateQrRawToken();

    await client.query(
      `
      INSERT INTO profiles (
        id,
        slug,
        full_name,
        expires_at,
        qr_token,
        owner_password_hash,
        owner_claim_token_hash,
        owner_claimed_at,
        owner_access_enabled,
        source_qr_code_id
      )
      VALUES ($1, $2, $3, NOW() + INTERVAL '1 year', $4, $5, NULL, NOW(), TRUE, $6)
      `,
      [
        profileId,
        slug,
        input.fullName.trim(),
        legacyQrToken,
        passwordHash,
        qr.id,
      ]
    );

    await client.query(
      `
      UPDATE qr_codes
      SET
        profile_id = $2,
        status = 'activated',
        activated_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
      [qr.id, profileId]
    );

    const session = generateSessionToken();
    const sessionExpiresAt = getSessionExpiresAt();

    await client.query(
      `
      INSERT INTO owner_sessions (
        id,
        profile_id,
        session_token_hash,
        expires_at,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [
        randomUUID(),
        profileId,
        session.hashedToken,
        sessionExpiresAt.toISOString(),
      ]
    );

    await client.query(
      `
      INSERT INTO qr_audit_log (
        id, run_id, lot_id, qr_code_id, actor_type, actor_label, event_type, payload_json, created_at
      )
      VALUES ($1, $2, $3, $4, 'system', 'activation', 'qr_activated', $5::jsonb, NOW())
      `,
      [
        randomUUID(),
        qr.run_id,
        qr.lot_id,
        qr.id,
        JSON.stringify({ profileId, slug }),
      ]
    );

    await client.query("COMMIT");

    return {
      ok: true as const,
      profileId,
      slug,
      sessionToken: session.rawToken,
      sessionExpiresAt: sessionExpiresAt.toISOString(),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function generateUniqueRunCode(client: DbClient) {
  while (true) {
    const code = generateRunCode();
    const result = await client.query(
      `SELECT 1 FROM qr_runs WHERE run_code = $1 LIMIT 1`,
      [code]
    );

    if (result.rowCount === 0) {
      return code;
    }
  }
}

async function generateUniqueLotCode(client: DbClient) {
  while (true) {
    const code = generateLotCode();
    const result = await client.query(
      `SELECT 1 FROM qr_lots WHERE lot_code = $1 LIMIT 1`,
      [code]
    );

    if (result.rowCount === 0) {
      return code;
    }
  }
}

async function generateUniqueSlug(client: DbClient, fullName: string) {
  const base = slugifyName(fullName);
  let slug = base;
  let counter = 2;

  while (true) {
    const result = await client.query(
      `SELECT 1 FROM profiles WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (result.rowCount === 0) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
}

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "profil";
}