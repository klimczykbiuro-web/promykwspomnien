import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPrzelewy24Transaction } from "@/lib/payments/przelewy24";
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
      provider: "przelewy24",
    });

    const transaction = await createPrzelewy24Transaction({
      sessionId: payment.id,
      amount: plan.amount,
      email: payload.buyerEmail,
      client: payload.buyerName,
      description: `Przedłużenie profilu – ${plan.label}`,
      urlReturn: `${siteUrl}/profile/${payload.slug}?payment=success&p24_session_id=${payment.id}`,
      urlStatus: `${siteUrl}/api/webhooks/przelewy24`,
    });

    await attachProviderPaymentId(payment.id, transaction.token);

    return NextResponse.json({
      redirectUrl: transaction.redirectUrl,
      paymentId: payment.id,
      provider: "przelewy24",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
