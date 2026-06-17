-- Etap 1 modułu Partnerzy / Odbiorcy hurtowi
-- Zakłada istnienie tabel qr_runs, qr_lots, qr_codes, profiles
-- Bez prowizji na tym etapie: partnerzy + przypisanie partii + raport aktywacji

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  nip TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT partners_status_check CHECK (status IN ('active', 'paused', 'inactive'))
);

CREATE INDEX IF NOT EXISTS partners_status_idx ON partners(status);
CREATE INDEX IF NOT EXISTS partners_name_idx ON partners(name);

CREATE TABLE IF NOT EXISTS partner_lot_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES qr_lots(id) ON DELETE RESTRICT,
  quantity_assigned INT NOT NULL,
  unit_price_gross NUMERIC(10,2),
  assignment_type TEXT NOT NULL DEFAULT 'sale',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT partner_lot_assignments_quantity_check CHECK (quantity_assigned > 0),
  CONSTRAINT partner_lot_assignments_type_check CHECK (assignment_type IN ('sale', 'consignment', 'sample'))
);

CREATE INDEX IF NOT EXISTS partner_lot_assignments_partner_idx
  ON partner_lot_assignments(partner_id);

CREATE INDEX IF NOT EXISTS partner_lot_assignments_lot_idx
  ON partner_lot_assignments(lot_id);

-- Jeden lot może być przypisany tylko raz na etapie 1.
CREATE UNIQUE INDEX IF NOT EXISTS partner_lot_assignments_lot_unique
  ON partner_lot_assignments(lot_id);

-- Powiązanie profilu z QR, z którego powstał.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_qr_code_id_idx ON profiles(qr_code_id);

-- Widok pomocniczy: aktywacje i profile przypisane partnerowi przez lot i QR
CREATE OR REPLACE VIEW admin_partner_profile_activations AS
SELECT
  p.id AS partner_id,
  p.name AS partner_name,
  pla.lot_id,
  ql.lot_code,
  qc.id AS qr_code_id,
  qc.token_prefix,
  pr.id AS profile_id,
  pr.slug,
  pr.full_name,
  pr.created_at AS profile_created_at
FROM partners p
JOIN partner_lot_assignments pla ON pla.partner_id = p.id
JOIN qr_lots ql ON ql.id = pla.lot_id
JOIN qr_codes qc ON qc.lot_id = ql.id
JOIN profiles pr ON pr.qr_code_id = qc.id;

-- Widok pomocniczy: podstawowe KPI partnera na liście admina
CREATE OR REPLACE VIEW admin_partner_summary AS
SELECT
  p.id,
  p.name,
  p.city,
  p.status,
  p.created_at,
  COUNT(DISTINCT pla.id) AS assigned_lots_count,
  COALESCE(SUM(pla.quantity_assigned), 0) AS assigned_quantity,
  COUNT(DISTINCT ap.profile_id) AS activated_profiles_count
FROM partners p
LEFT JOIN partner_lot_assignments pla ON pla.partner_id = p.id
LEFT JOIN admin_partner_profile_activations ap ON ap.partner_id = p.id
GROUP BY p.id, p.name, p.city, p.status, p.created_at;
