import { pool } from "@/lib/db";
import type {
  CreatePartnerAssignmentInput,
  CreatePartnerInput,
  UpdatePartnerInput,
} from "./schema";

export type PartnerListItem = {
  id: string;
  name: string;
  city: string | null;
  status: "active" | "paused" | "inactive";
  assigned_lots_count: number;
  assigned_quantity: number;
  activated_profiles_count: number;
  created_at: string;
};

export type PartnerDetails = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  nip: string | null;
  notes: string | null;
  status: "active" | "paused" | "inactive";
  created_at: string;
  updated_at: string;
};

export type PartnerAssignment = {
  id: string;
  lot_id: string;
  lot_code: string;
  quantity_assigned: number;
  unit_price_gross: string | null;
  assignment_type: "sale" | "consignment" | "sample";
  assigned_at: string;
  notes: string | null;
};

export type PartnerActivation = {
  profile_id: string;
  qr_code_id: string;
  lot_code: string;
  slug: string;
  full_name: string;
  token_prefix: string;
  profile_created_at: string;
};

export type AvailableLot = {
  id: string;
  lot_code: string;
  run_code: string;
  quantity_total: number;
};

function normalizeBlank(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

export async function listPartnersSummary(): Promise<PartnerListItem[]> {
  const result = await pool.query(`
    SELECT
      id,
      name,
      city,
      status,
      assigned_lots_count::int,
      assigned_quantity::int,
      activated_profiles_count::int,
      created_at::text
    FROM admin_partner_summary
    ORDER BY created_at DESC, name ASC
  `);

  return result.rows as PartnerListItem[];
}

export async function createPartner(input: CreatePartnerInput): Promise<PartnerDetails | null> {
  const result = await pool.query(
    `
    INSERT INTO partners (
      name,
      contact_person,
      email,
      phone,
      city,
      nip,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      name,
      contact_person,
      email,
      phone,
      city,
      nip,
      notes,
      status,
      created_at::text,
      updated_at::text
    `,
    [
      input.name.trim(),
      normalizeBlank(input.contactPerson),
      normalizeBlank(input.email),
      normalizeBlank(input.phone),
      normalizeBlank(input.city),
      normalizeBlank(input.nip),
      normalizeBlank(input.notes),
    ]
  );

  return (result.rows[0] as PartnerDetails) ?? null;
}

export async function getPartnerById(id: string): Promise<PartnerDetails | null> {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      contact_person,
      email,
      phone,
      city,
      nip,
      notes,
      status,
      created_at::text,
      updated_at::text
    FROM partners
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return (result.rows[0] as PartnerDetails) ?? null;
}

export async function updatePartner(
  id: string,
  input: UpdatePartnerInput
): Promise<PartnerDetails | null> {
  const result = await pool.query(
    `
    UPDATE partners
    SET
      name = $2,
      contact_person = $3,
      email = $4,
      phone = $5,
      city = $6,
      nip = $7,
      notes = $8,
      status = $9,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      contact_person,
      email,
      phone,
      city,
      nip,
      notes,
      status,
      created_at::text,
      updated_at::text
    `,
    [
      id,
      input.name.trim(),
      normalizeBlank(input.contactPerson),
      normalizeBlank(input.email),
      normalizeBlank(input.phone),
      normalizeBlank(input.city),
      normalizeBlank(input.nip),
      normalizeBlank(input.notes),
      input.status,
    ]
  );

  return (result.rows[0] as PartnerDetails) ?? null;
}

export async function listPartnerAssignments(
  partnerId: string
): Promise<PartnerAssignment[]> {
  const result = await pool.query(
    `
    SELECT
      pla.id,
      pla.lot_id,
      ql.lot_code,
      pla.quantity_assigned::int,
      pla.unit_price_gross::text,
      pla.assignment_type,
      pla.assigned_at::text,
      pla.notes
    FROM partner_lot_assignments pla
    JOIN qr_lots ql ON ql.id = pla.lot_id
    WHERE pla.partner_id = $1
    ORDER BY pla.assigned_at DESC
    `,
    [partnerId]
  );

  return result.rows as PartnerAssignment[];
}

export async function listPartnerActivations(
  partnerId: string
): Promise<PartnerActivation[]> {
  const result = await pool.query(
    `
    SELECT
      profile_id,
      qr_code_id,
      lot_code,
      slug,
      full_name,
      token_prefix,
      profile_created_at::text
    FROM admin_partner_profile_activations
    WHERE partner_id = $1
    ORDER BY profile_created_at DESC
    `,
    [partnerId]
  );

  return result.rows as PartnerActivation[];
}

export async function listAvailableLots(): Promise<AvailableLot[]> {
  const result = await pool.query(
    `
    SELECT
      ql.id,
      ql.lot_code,
      qr.run_code,
      COUNT(qc.id)::int AS quantity_total,
      MAX(qr.created_at) AS run_created_at,
      MAX(ql.created_at) AS lot_created_at
    FROM qr_lots ql
    JOIN qr_runs qr ON qr.id = ql.run_id
    JOIN qr_codes qc ON qc.lot_id = ql.id
    LEFT JOIN partner_lot_assignments pla ON pla.lot_id = ql.id
    WHERE pla.id IS NULL
    GROUP BY ql.id, ql.lot_code, qr.run_code
    ORDER BY MAX(qr.created_at) DESC, MAX(ql.created_at) DESC, ql.lot_code ASC
    `
  );

  return result.rows.map((row: any) => ({
  id: row.id,
  lot_code: row.lot_code,
  run_code: row.run_code,
  quantity_total: Number(row.quantity_total),
})) as AvailableLot[];
}

export async function createPartnerAssignment(
  partnerId: string,
  input: CreatePartnerAssignmentInput
): Promise<PartnerAssignment | null> {
  const result = await pool.query(
    `
    INSERT INTO partner_lot_assignments (
      partner_id,
      lot_id,
      quantity_assigned,
      unit_price_gross,
      assignment_type,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      lot_id,
      (
        SELECT lot_code
        FROM qr_lots
        WHERE id = $2
      ) AS lot_code,
      quantity_assigned::int,
      unit_price_gross::text,
      assignment_type,
      assigned_at::text,
      notes
    `,
    [
      partnerId,
      input.lotId,
      input.quantityAssigned,
      input.unitPriceGross ?? null,
      input.assignmentType,
      normalizeBlank(input.notes),
    ]
  );

  return (result.rows[0] as PartnerAssignment) ?? null;
}

export async function deletePartnerAssignment(
  partnerId: string,
  assignmentId: string
): Promise<boolean> {
  const result = await pool.query(
    `
    DELETE FROM partner_lot_assignments
    WHERE id = $1
      AND partner_id = $2
    RETURNING id
    `,
    [assignmentId, partnerId]
  );

  return result.rowCount > 0;
}
