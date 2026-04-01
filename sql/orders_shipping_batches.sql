CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS batch_id uuid,
  ADD COLUMN IF NOT EXISTS apaczka_order_id text,
  ADD COLUMN IF NOT EXISTS apaczka_waybill_number text,
  ADD COLUMN IF NOT EXISTS apaczka_tracking_url text,
  ADD COLUMN IF NOT EXISTS apaczka_service_id integer,
  ADD COLUMN IF NOT EXISTS shipping_error text,
  ADD COLUMN IF NOT EXISTS shipping_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS label_ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS printed_at timestamptz;

CREATE TABLE IF NOT EXISTS shipping_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_day date NOT NULL UNIQUE,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  orders_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  labels_pdf_base64 text,
  turn_in_pdf_base64 text,
  error_message text,
  generated_by text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_batch_id_fkey'
      AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_batch_id_fkey
      FOREIGN KEY (batch_id) REFERENCES shipping_batches(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS orders_shipping_status_idx
  ON orders (shipping_status, status, paid_at, created_at);

CREATE INDEX IF NOT EXISTS orders_batch_idx
  ON orders (batch_id);
