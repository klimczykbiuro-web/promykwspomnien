import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";
import {
  generateSessionToken,
  getSessionExpiresAt,
  hashClaimToken,
  verifyPassword,
} from "@/lib/owner/auth";

type ClaimPageState =
  | {
      state: "available";
      profileId: string;
      slug: string;
      fullName: string;
    }
  | {
      state: "already_claimed";
      profileId: string;
      slug: string;
      fullName: string;
    }
  | {
      state: "invalid_token";
    }
  | {
      state: "not_found";
    };

export async function getClaimPageState(
  slug: string,
  rawToken: string
): Promise<ClaimPageState> {
  const result = await pool.query(
    `
    SELECT id, slug, full_name, owner_access_enabled, owner_claim_token_hash
    FROM profiles
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  if (result.rowCount === 0) {
    return { state: "not_found" };
  }

  const row = result.rows[0] as {
    id: string;
    slug: string;
    full_name: string;
    owner_access_enabled: boolean;
    owner_claim_token_hash: string | null;
  };

  if (row.owner_access_enabled || !row.owner_claim_token_hash) {
    return {
      state: "already_claimed",
      profileId: row.id,
      slug: row.slug,
      fullName: row.full_name,
    };
  }

  if (row.owner_claim_token_hash !== hashClaimToken(rawToken)) {
    return { state: "invalid_token" };
  }

  return {
    state: "available",
    profileId: row.id,
    slug: row.slug,
    fullName: row.full_name,
  };
}

type ClaimOwnerInput = {
  slug: string;
  rawToken: string;
  passwordHash: string;
};

type ClaimOwnerResult =
  | {
      ok: true;
      profileId: string;
      slug: string;
      fullName: string;
      sessionToken: string;
      sessionExpiresAt: string;
    }
  | {
      ok: false;
      reason: "not_found" | "invalid_token" | "already_claimed";
    };

export async function claimOwnerAccess(
  input: ClaimOwnerInput
): Promise<ClaimOwnerResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT
        id,
        slug,
        full_name,
        owner_access_enabled,
        owner_claim_token_hash
      FROM profiles
      WHERE slug = $1
      FOR UPDATE
      `,
      [input.slug]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "not_found" };
    }

    const profile = result.rows[0] as {
      id: string;
      slug: string;
      full_name: string;
      owner_access_enabled: boolean;
      owner_claim_token_hash: string | null;
    };

    if (profile.owner_access_enabled || !profile.owner_claim_token_hash) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "already_claimed" };
    }

    const expectedTokenHash = hashClaimToken(input.rawToken);

    if (profile.owner_claim_token_hash !== expectedTokenHash) {
      await client.query("ROLLBACK");
      return { ok: false, reason: "invalid_token" };
    }

    await client.query(
      `
      UPDATE profiles
      SET
        owner_password_hash = $2,
        owner_access_enabled = TRUE,
        owner_claimed_at = NOW(),
        owner_claim_token_hash = NULL
      WHERE id = $1
      `,
      [profile.id, input.passwordHash]
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
        profile.id,
        session.hashedToken,
        sessionExpiresAt.toISOString(),
      ]
    );

    await client.query("COMMIT");

    return {
      ok: true,
      profileId: profile.id,
      slug: profile.slug,
      fullName: profile.full_name,
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

type LoginOwnerResult =
  | {
      ok: true;
      profileId: string;
      slug: string;
      fullName: string;
      sessionToken: string;
      sessionExpiresAt: string;
    }
  | {
      ok: false;
      reason: "not_found" | "not_claimed" | "invalid_credentials";
    };

export async function loginOwner(
  slug: string,
  password: string
): Promise<LoginOwnerResult> {
  const result = await pool.query(
    `
    SELECT
      id,
      slug,
      full_name,
      owner_access_enabled,
      owner_password_hash
    FROM profiles
    WHERE slug = $1
    LIMIT 1
    `,
    [slug]
  );

  if (result.rowCount === 0) {
    return { ok: false, reason: "not_found" };
  }

  const profile = result.rows[0] as {
    id: string;
    slug: string;
    full_name: string;
    owner_access_enabled: boolean;
    owner_password_hash: string | null;
  };

  if (!profile.owner_access_enabled || !profile.owner_password_hash) {
    return { ok: false, reason: "not_claimed" };
  }

  const valid = verifyPassword(password, profile.owner_password_hash);

  if (!valid) {
    return { ok: false, reason: "invalid_credentials" };
  }

  const session = generateSessionToken();
  const sessionExpiresAt = getSessionExpiresAt();

  await pool.query(
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
      profile.id,
      session.hashedToken,
      sessionExpiresAt.toISOString(),
    ]
  );

  return {
    ok: true,
    profileId: profile.id,
    slug: profile.slug,
    fullName: profile.full_name,
    sessionToken: session.rawToken,
    sessionExpiresAt: sessionExpiresAt.toISOString(),
  };
}

export async function getOwnerSessionByToken(rawSessionToken: string) {
  const sessionTokenHash = hashClaimToken(rawSessionToken);

  const result = await pool.query(
    `
    SELECT
      s.profile_id,
      s.expires_at,
      p.slug,
      p.full_name,
      p.expires_at AS profile_expires_at,
      p.owner_claimed_at
    FROM owner_sessions s
    JOIN profiles p ON p.id = s.profile_id
    WHERE s.session_token_hash = $1
      AND s.expires_at > NOW()
    LIMIT 1
    `,
    [sessionTokenHash]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0] as {
    profile_id: string;
    expires_at: string;
    slug: string;
    full_name: string;
    profile_expires_at: string | null;
    owner_claimed_at: string | null;
  };
}

export async function deleteOwnerSession(rawSessionToken: string) {
  const sessionTokenHash = hashClaimToken(rawSessionToken);

  await pool.query(
    `
    DELETE FROM owner_sessions
    WHERE session_token_hash = $1
    `,
    [sessionTokenHash]
  );
}

export async function getOwnerDashboard(profileId: string) {
  const [profileResult, paymentsResult, extensionsResult] = await Promise.all([
    pool.query(
      `
      SELECT
        id,
        slug,
        full_name,
        expires_at,
        owner_claimed_at,
        hero_image_url,
        quote,
        biography
      FROM profiles
      WHERE id = $1
      LIMIT 1
      `,
      [profileId]
    ),
    pool.query(
      `
      SELECT id, status, amount, currency, years_to_add, provider, created_at, paid_at
      FROM payments
      WHERE profile_id = $1
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [profileId]
    ),
    pool.query(
      `
      SELECT id, payment_id, years_added, previous_expires_at, new_expires_at, created_at
      FROM extensions
      WHERE profile_id = $1
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [profileId]
    ),
  ]);

  if (profileResult.rowCount === 0) {
    return null;
  }

  return {
    profile: profileResult.rows[0] as {
      id: string;
      slug: string;
      full_name: string;
      expires_at: string | null;
      owner_claimed_at: string | null;
      hero_image_url: string | null;
      quote: string | null;
      biography: string | null;
    },
    payments: paymentsResult.rows as Array<{
      id: string;
      status: string;
      amount: number;
      currency: string;
      years_to_add: number;
      provider: string;
      created_at: string;
      paid_at: string | null;
    }>,
    extensions: extensionsResult.rows as Array<{
      id: string;
      payment_id: string | null;
      years_added: number;
      previous_expires_at: string | null;
      new_expires_at: string;
      created_at: string;
    }>,
  };
}

type UpdateOwnerProfileInput = {
  heroImageUrl: string | null;
  quote: string | null;
  biography: string | null;
};

export async function updateOwnerProfileContent(
  profileId: string,
  input: UpdateOwnerProfileInput
) {
  const result = await pool.query(
    `
    UPDATE profiles
    SET
      hero_image_url = $2,
      quote = $3,
      biography = $4
    WHERE id = $1
    RETURNING
      id,
      slug,
      full_name,
      hero_image_url,
      quote,
      biography
    `,
    [profileId, input.heroImageUrl, input.quote, input.biography]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0] as {
    id: string;
    slug: string;
    full_name: string;
    hero_image_url: string | null;
    quote: string | null;
    biography: string | null;
  };
}