import { NextResponse } from "next/server";
import {
  insertWebhookEventIfNew,
  markPaymentPaid,
} from "@/lib/payments/repository";
import { verifyPrzelewy24Transaction } from "@/lib/payments/przelewy24";
import { applyExtensionForPayment } from "@/lib/extensions/apply-extension";

export const runtime = "nodejs";

type Przelewy24Notification = {
  merchantId?: number;
  posId?: number;
  sessionId?: string;
  amount?: number;
  originAmount?: number;
  currency?: "PLN" | string;
  orderId?: number;
  methodId?: number;
  statement?: string;
  sign?: string;
};

export async function POST(req: Request) {
  let payload: Przelewy24Notification;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sessionId = payload.sessionId;
  const orderId = Number(payload.orderId);
  const amount = Number(payload.amount);
  const currency = (payload.currency || "PLN").toUpperCase() as "PLN";

  if (!sessionId || !orderId || !amount) {
    return NextResponse.json(
      { error: "Missing sessionId, orderId or amount." },
      { status: 400 }
    );
  }

  await verifyPrzelewy24Transaction({
    sessionId,
    orderId,
    amount,
    currency,
  });

  const providerEventId = `${sessionId}:${orderId}:${amount}`;
  const isNewEvent = await insertWebhookEventIfNew({
    provider: "przelewy24",
    providerEventId,
    eventType: "transaction.verified",
    payload,
  });

  if (!isNewEvent) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await markPaymentPaid(sessionId, String(orderId));
  await applyExtensionForPayment(sessionId);

  return NextResponse.json({ ok: true, provider: "przelewy24" });
}
