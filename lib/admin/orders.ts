import { pool } from "@/lib/db";
import { getShippingBusinessWindow } from "@/lib/shipping/business-day";
import {
  getApaczkaTurnInBase64,
  getApaczkaWaybillBase64,
  sendApaczkaOrder,
} from "@/lib/shipping/apaczka";
import { mergePdfBase64Files } from "@/lib/shipping/pdf";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  memorial_name: string;
  street: string;
  postal_code: string;
  city: string;
  notes: string | null;
  amount: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  shipping_status: string | null;
  shipping_error: string | null;
  batch_id: string | null;
  apaczka_order_id: string | null;
  apaczka_waybill_number: string | null;
  apaczka_tracking_url: string | null;
};

export type ShippingBatchRow = {
  id: string;
  business_day: string;
  window_start: string;
  window_end: string;
  status: string;
  orders_count: number;
  success_count: number;
  error_count: number;
  labels_ready: boolean;
  turn_in_ready: boolean;
  created_at: string;
  updated_at: string;
  error_message: string | null;
};

export async function getOrdersDashboard(limit = 120) {
  const { businessDay, windowStart, windowEnd, timeZone } = getShippingBusinessWindow();

  const [ordersResult, latestBatchResult, queuedResult] = await Promise.all([
    pool.query(
      `
      SELECT
        id,
        order_number,
        status,
        buyer_name,
        buyer_email,
        buyer_phone,
        memorial_name,
        street,
        postal_code,
        city,
        notes,
        amount,
        currency,
        paid_at,
        created_at,
        shipping_status,
        shipping_error,
        batch_id,
        apaczka_order_id,
        apaczka_waybill_number,
        apaczka_tracking_url
      FROM orders
      ORDER BY COALESCE(paid_at, created_at) DESC
      LIMIT $1
      `,
      [limit]
    ),
    pool.query(
      `
      SELECT
        id,
        business_day,
        window_start,
        window_end,
        status,
        orders_count,
        success_count,
        error_count,
        (labels_pdf_base64 IS NOT NULL) AS labels_ready,
        (turn_in_pdf_base64 IS NOT NULL) AS turn_in_ready,
        created_at,
        updated_at,
        error_message
      FROM shipping_batches
      ORDER BY business_day DESC
      LIMIT 10
      `
    ),
    pool.query(
      `
      SELECT count(*)::int AS value
      FROM orders
      WHERE status = 'paid'
        AND COALESCE(shipping_status, 'new') IN ('new', 'error')
        AND batch_id IS NULL
        AND COALESCE(paid_at, created_at) >= $1
        AND COALESCE(paid_at, created_at) < $2
      `,
      [windowStart.toISOString(), windowEnd.toISOString()]
    ),
  ]);

  return {
    currentWindow: {
      businessDay,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      timeZone,
      queuedOrders: Number(queuedResult.rows[0]?.value ?? 0),
    },
    orders: ordersResult.rows as AdminOrderRow[],
    batches: latestBatchResult.rows as ShippingBatchRow[],
  };
}

export async function getBatchById(batchId: string) {
  const result = await pool.query(
    `
    SELECT
      id,
      business_day,
      window_start,
      window_end,
      status,
      orders_count,
      success_count,
      error_count,
      labels_pdf_base64,
      turn_in_pdf_base64,
      created_at,
      updated_at,
      error_message
    FROM shipping_batches
    WHERE id = $1
    LIMIT 1
    `,
    [batchId]
  );

  return result.rows[0] || null;
}

async function updateOrderAfterSuccess(input: {
  orderId: string;
  batchId: string;
  apaczkaOrderId: string;
  waybillNumber: string;
  trackingUrl: string;
  serviceId: number;
}) {
  await pool.query(
    `
    UPDATE orders
    SET
      batch_id = $2,
      shipping_status = 'label_ready',
      apaczka_order_id = $3,
      apaczka_waybill_number = $4,
      apaczka_tracking_url = $5,
      apaczka_service_id = $6,
      shipping_error = NULL,
      shipping_requested_at = NOW(),
      label_ready_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    `,
    [
      input.orderId,
      input.batchId,
      input.apaczkaOrderId,
      input.waybillNumber,
      input.trackingUrl,
      input.serviceId,
    ]
  );
}

async function updateOrderAfterError(orderId: string, batchId: string, errorMessage: string) {
  await pool.query(
    `
    UPDATE orders
    SET
      batch_id = $2,
      shipping_status = 'error',
      shipping_error = $3,
      shipping_requested_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
    `,
    [orderId, batchId, errorMessage]
  );
}

export async function createDailyShippingBatch(options?: { source?: "admin" | "cron" }) {
  const { businessDay, windowStart, windowEnd } = getShippingBusinessWindow();

  const existing = await pool.query(
    `
    SELECT id, business_day, labels_pdf_base64, turn_in_pdf_base64, status
    FROM shipping_batches
    WHERE business_day = $1
    LIMIT 1
    `,
    [businessDay]
  );

  if (existing.rowCount && existing.rows[0]) {
    return {
      kind: "existing" as const,
      batchId: existing.rows[0].id as string,
      businessDay,
      status: existing.rows[0].status as string,
    };
  }

  const eligibleOrdersResult = await pool.query(
    `
    SELECT
      id,
      order_number,
      status,
      buyer_name,
      buyer_email,
      buyer_phone,
      memorial_name,
      street,
      postal_code,
      city,
      notes,
      amount,
      currency,
      paid_at,
      created_at,
      shipping_status,
      shipping_error,
      batch_id,
      apaczka_order_id,
      apaczka_waybill_number,
      apaczka_tracking_url
    FROM orders
    WHERE status = 'paid'
      AND COALESCE(shipping_status, 'new') IN ('new', 'error')
      AND batch_id IS NULL
      AND COALESCE(paid_at, created_at) >= $1
      AND COALESCE(paid_at, created_at) < $2
    ORDER BY COALESCE(paid_at, created_at) ASC
    `,
    [windowStart.toISOString(), windowEnd.toISOString()]
  );

  const eligibleOrders = eligibleOrdersResult.rows as AdminOrderRow[];

  const batchInsert = await pool.query(
    `
    INSERT INTO shipping_batches (
      business_day,
      window_start,
      window_end,
      status,
      orders_count,
      success_count,
      error_count,
      labels_pdf_base64,
      turn_in_pdf_base64,
      error_message,
      created_at,
      updated_at,
      generated_by
    )
    VALUES ($1, $2, $3, $4, $5, 0, 0, NULL, NULL, NULL, NOW(), NOW(), $6)
    RETURNING id
    `,
    [
      businessDay,
      windowStart.toISOString(),
      windowEnd.toISOString(),
      eligibleOrders.length === 0 ? 'empty' : 'processing',
      eligibleOrders.length,
      options?.source || 'admin',
    ]
  );

  const batchId = batchInsert.rows[0].id as string;

  if (eligibleOrders.length === 0) {
    return {
      kind: 'empty' as const,
      batchId,
      businessDay,
    };
  }

  const labelBase64Files: string[] = [];
  const apaczkaOrderIds: string[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const order of eligibleOrders) {
    try {
      const sent = await sendApaczkaOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        buyerName: order.buyer_name,
        buyerEmail: order.buyer_email,
        buyerPhone: order.buyer_phone,
        street: order.street,
        postalCode: order.postal_code,
        city: order.city,
        notes: order.notes,
      });

      const waybillBase64 = await getApaczkaWaybillBase64(sent.apaczkaOrderId);

      await updateOrderAfterSuccess({
        orderId: order.id,
        batchId,
        apaczkaOrderId: sent.apaczkaOrderId,
        waybillNumber: sent.waybillNumber,
        trackingUrl: sent.trackingUrl,
        serviceId: sent.serviceId,
      });

      labelBase64Files.push(waybillBase64);
      apaczkaOrderIds.push(sent.apaczkaOrderId);
      successCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się wysłać zamówienia do Apaczki.';
      await updateOrderAfterError(order.id, batchId, message);
      errorCount += 1;
    }
  }

  let mergedLabels: string | null = null;
  let turnIn: string | null = null;

  if (successCount > 0) {
    mergedLabels = await mergePdfBase64Files(labelBase64Files);
    turnIn = await getApaczkaTurnInBase64(apaczkaOrderIds);
  }

  await pool.query(
    `
    UPDATE shipping_batches
    SET
      status = $2,
      success_count = $3,
      error_count = $4,
      labels_pdf_base64 = $5,
      turn_in_pdf_base64 = $6,
      updated_at = NOW(),
      error_message = $7
    WHERE id = $1
    `,
    [
      batchId,
      errorCount > 0 ? (successCount > 0 ? 'partial' : 'failed') : 'completed',
      successCount,
      errorCount,
      mergedLabels,
      turnIn,
      errorCount > 0 && successCount === 0 ? 'Wszystkie zamówienia z batcha zakończyły się błędem.' : null,
    ]
  );

  return {
    kind: 'created' as const,
    batchId,
    businessDay,
    successCount,
    errorCount,
  };
}
