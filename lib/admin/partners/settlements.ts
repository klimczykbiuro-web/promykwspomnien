import "server-only";

import { pool } from "@/lib/db";

export type AdminPartnerSettlement = {
  partner_id: string;
  name: string;
  plaques_revenue_gross: string;
  extended_profiles_count: number;
  extensions_revenue_gross_raw: string;
  extensions_revenue_gross: string;
  extension_commission_percent: string;
  extension_commission_gross: string;
  total_commission_gross: string;
  paid_out_gross: string;
  remaining_to_pay_gross: string;
};

export type PartnerPayout = {
  id: string;
  partner_id: string;
  amount_gross: string;
  payout_date: string;
  status: "paid" | "cancelled" | "pending";
  notes: string | null;
  created_at: string;
};

function normalizeBlank(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export async function getPartnerSettlement(
  partnerId: string
): Promise<AdminPartnerSettlement | null> {
  const result = await pool.query(
    `
    SELECT
      partner_id,
      name,
      plaques_revenue_gross::text,
      extended_profiles_count::int,
      extensions_revenue_gross_raw::text,
      extensions_revenue_gross::text,
      extension_commission_percent::text,
      extension_commission_gross::text,
      total_commission_gross::text,
      paid_out_gross::text,
      remaining_to_pay_gross::text
    FROM admin_partner_settlements
    WHERE partner_id = $1
    LIMIT 1
    `,
    [partnerId]
  );

  return (result.rows[0] as AdminPartnerSettlement) ?? null;
}

export async function updatePartnerExtensionCommissionPercent(
  partnerId: string,
  extensionCommissionPercent: number
): Promise<void> {
  await pool.query(
    `
    UPDATE partners
    SET
      extension_commission_percent = $2,
      updated_at = NOW()
    WHERE id = $1
    `,
    [partnerId, extensionCommissionPercent]
  );
}

export async function createPartnerPayout(input: {
  partnerId: string;
  amountGross: number;
  payoutDate: string;
  notes?: string | null;
}): Promise<PartnerPayout | null> {
  const result = await pool.query(
    `
    INSERT INTO partner_payouts (
      partner_id,
      amount_gross,
      payout_date,
      status,
      notes
    )
    VALUES ($1, $2, $3, 'paid', $4)
    RETURNING
      id,
      partner_id,
      amount_gross::text,
      payout_date::text,
      status,
      notes,
      created_at::text
    `,
    [
      input.partnerId,
      input.amountGross,
      input.payoutDate,
      normalizeBlank(input.notes),
    ]
  );

  return (result.rows[0] as PartnerPayout) ?? null;
}

export async function listPartnerPayouts(
  partnerId: string
): Promise<PartnerPayout[]> {
  const result = await pool.query(
    `
    SELECT
      id,
      partner_id,
      amount_gross::text,
      payout_date::text,
      status,
      notes,
      created_at::text
    FROM partner_payouts
    WHERE partner_id = $1
    ORDER BY payout_date DESC, created_at DESC
    LIMIT 50
    `,
    [partnerId]
  );

  return result.rows as PartnerPayout[];
}
