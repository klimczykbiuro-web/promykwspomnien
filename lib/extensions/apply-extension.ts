import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

type AppliedExtensionResult =
  | {
      applied: true;
      extensionId: string;
      profileId: string;
      paymentId: string;
      yearsAdded: number;
      previousExpiresAt: string | null;
      newExpiresAt: string;
    }
  | {
      applied: false;
      reason: "payment_not_found" | "payment_not_paid" | "already_applied";
    };

export async function applyExtensionForPayment(
  paymentId: string
): Promise<AppliedExtensionResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const paymentResult = await client.query(
      `
      SELECT
        id,
        profile_id,
        status,
        years_to_add,
        paid_at
      FROM payments
      WHERE id = $1
      FOR UPDATE
      `,
      [paymentId]
    );

    if (paymentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { applied: false, reason: "payment_not_found" };
    }

    const payment = paymentResult.rows[0] as {
      id: string;
      profile_id: string;
      status: string;
      years_to_add: number;
      paid_at: string | null;
    };

    if (payment.status !== "paid") {
      await client.query("ROLLBACK");
      return { applied: false, reason: "payment_not_paid" };
    }

    const existingExtensionResult = await client.query(
      `
      SELECT id
      FROM extensions
      WHERE payment_id = $1
      LIMIT 1
      `,
      [payment.id]
    );

    if (existingExtensionResult.rowCount > 0) {
      await client.query("ROLLBACK");
      return { applied: false, reason: "already_applied" };
    }

    const profileResult = await client.query(
      `
      SELECT id, expires_at
      FROM profiles
      WHERE id = $1
      FOR UPDATE
      `,
      [payment.profile_id]
    );

    if (profileResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { applied: false, reason: "payment_not_found" };
    }

    const profile = profileResult.rows[0] as {
      id: string;
      expires_at: string | null;
    };

    const previousExpiresAt = profile.expires_at;
    const baseDate = previousExpiresAt ? new Date(previousExpiresAt) : new Date();

    const now = new Date();
    const effectiveBase = baseDate > now ? baseDate : now;

    const newExpiresAtDate = new Date(effectiveBase);
    newExpiresAtDate.setFullYear(newExpiresAtDate.getFullYear() + payment.years_to_add);

    const newExpiresAt = newExpiresAtDate.toISOString();
    const extensionId = randomUUID();

    await client.query(
      `
      UPDATE profiles
      SET expires_at = $2
      WHERE id = $1
      `,
      [profile.id, newExpiresAt]
    );

    await client.query(
      `
      INSERT INTO extensions (
        id,
        profile_id,
        payment_id,
        years_added,
        previous_expires_at,
        new_expires_at,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
      [
        extensionId,
        profile.id,
        payment.id,
        payment.years_to_add,
        previousExpiresAt,
        newExpiresAt,
      ]
    );

    await client.query("COMMIT");

    return {
      applied: true,
      extensionId,
      profileId: profile.id,
      paymentId: payment.id,
      yearsAdded: payment.years_to_add,
      previousExpiresAt,
      newExpiresAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}