import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/payments/stripe";
import { plans, type PlanId } from "@/lib/payments/plans";
import {
  attachProviderPaymentId,
  createPendingPayment,
  getProfileIdBySlug,
} from "@/lib/payments/repository";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1),
  planId: z.enum(["plan_1y", "plan_5y", "plan_20y"]),
  buyerName: z.string().trim().min(2).max(120),
  buyerEmail: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SITE_URL." }, { status: 500 });
    }

    const payload = schema.parse(await request.json());
    const plan = plans[payload.planId as PlanId];

    const profileId = await getProfileIdBySlug(payload.slug);
    if (!profileId) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const payment = await createPendingPayment({
      profileId,
      buyerName: payload.buyerName,
      buyerEmail: payload.buyerEmail,
      amount: plan.amount,
      currency: plan.currency,
      yearsToAdd: plan.years,
    });

    const lineItem = plan.stripePriceId
      ? { price: plan.stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: plan.currency,
            unit_amount: plan.amount,
            product_data: {
              name: `Przedłużenie profilu – ${plan.label}`,
            },
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: payment.id,
        customer_email: payload.buyerEmail,
        metadata: {
          payment_id: payment.id,
          profile_id: profileId,
          profile_slug: payload.slug,
          years_to_add: String(plan.years),
        },
        line_items: [lineItem],
        success_url: `${siteUrl}/profile/${payload.slug}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/profile/${payload.slug}?payment=canceled`,
      },
      {
        idempotencyKey: `checkout_session:${payment.id}`,
      },
    );

    await attachProviderPaymentId(payment.id, session.id);

    return NextResponse.json({
      redirectUrl: session.url,
      paymentId: payment.id,
      provider: "stripe",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}