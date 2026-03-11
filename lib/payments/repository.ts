import { randomUUID } from "node:crypto";
import { pool } from "@/lib/db";

type CreatePendingPaymentInput = {
  profileId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  currency: string;
  yearsToAdd: number;
};

export async function getProfileIdBySlug(slug: string): Promise<string | null> {
  const result = await pool.query(
    `
    SELECT id
    FROM profiles
    WHERE slug = $1
    LIMIT 1
    `,
    [slug],
  );

  if (result.rowCount === 0) return null;
  return (result.rows[0] as { id: string }).id;
}

export async function createPendingPayment(input: CreatePendingPaymentInput) {
  const id = randomUUID();

  const result = await pool.query(
    `
    INSERT INTO payments (
      id,
      profile_id,
      provider,
      buyer_name,
      buyer_email,
      status,
      amount,
      currency,
      years_to_add,
      created_at,
      updated_at
    )
    VALUES ($1, $2, 'stripe', $3, $4, 'pending', $5, $6, $7, NOW(), NOW())
    RETURNING id, profile_id, status, amount, currency, years_to_add
    `,
    [
      id,
      input.profileId,
      input.buyerName,
      input.buyerEmail,
      input.amount,
      input.currency,
      input.yearsToAdd,
    ],
  );

  return result.rows[0] as {
    id: string;
    profile_id: string;
    status: string;
    amount: number;
    currency: string;
    years_to_add: number;
  };
}

export async function attachProviderPaymentId(paymentId: string, providerPaymentId: string) {
  await pool.query(
    `
    UPDATE payments
    SET provider_payment_id = $2,
        updated_at = NOW()
    WHERE id = $1
    `,
    [paymentId, providerPaymentId],
  );
}

export async function markPaymentPaid(paymentId: string, providerPaymentId?: string) {
  await pool.query(
    `
    UPDATE payments
    SET status = 'paid',
        provider_payment_id = COALESCE($2, provider_payment_id),
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
    WHERE id = $1
    `,
    [paymentId, providerPaymentId ?? null],
  );
}

export async function insertWebhookEventIfNew(input: {
  provider: string;
  providerEventId: string;
  eventType: string;
  payload: unknown;
}) {
  const result = await pool.query(
    `
    INSERT INTO webhook_events (
      id,
      provider,
      provider_event_id,
      event_type,
      payload_json,
      created_at,
      processed_at
    )
    VALUES ($1, $2, $3, $4, $5::jsonb, NOW(), NOW())
    ON CONFLICT (provider, provider_event_id) DO NOTHING
    RETURNING id
    `,
    [
      randomUUID(),
      input.provider,
      input.providerEventId,
      input.eventType,
      JSON.stringify(input.payload),
    ],
  );

  return result.rowCount === 1;
}