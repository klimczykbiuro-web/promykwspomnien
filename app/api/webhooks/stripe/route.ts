import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import {
  insertWebhookEventIfNew,
  markPaymentPaid,
} from "@/lib/payments/repository";
import { applyExtensionForPayment } from "@/lib/extensions/apply-extension";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const isNewEvent = await insertWebhookEventIfNew({
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    payload: event,
  });

  if (!isNewEvent) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;

      // 1) nowy zakup tabliczki
      if (session.metadata?.order_type === "plaque_purchase") {
        const orderId = session.metadata?.order_id ?? session.client_reference_id;

        if (orderId) {
          await pool.query(
            `
              update orders
              set
                status = 'paid',
                paid_at = now(),
                updated_at = now(),
                stripe_session_id = $2,
                stripe_payment_intent_id = $3
              where id = $1
            `,
            [
              orderId,
              session.id,
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            ],
          );
        }

        break;
      }

      // 2) stara logika przedłużeń zostaje bez zmian
      const paymentId = session.metadata?.payment_id ?? session.client_reference_id;

      if (paymentId) {
        await markPaymentPaid(paymentId, session.id);
        await applyExtensionForPayment(paymentId);
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true, provider: "stripe" });
}