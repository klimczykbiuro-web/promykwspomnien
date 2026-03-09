import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { plans, type PlanId } from "@/lib/payments/plans";
import { stripe } from "@/lib/payments/stripe";
import { createPrzelewy24Transaction } from "@/lib/payments/przelewy24";

const schema = z.object({
  profileId: z.string().min(1),
  planId: z.enum(["plan_1y", "plan_5y", "plan_20y"]),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(),
  provider: z.enum(["stripe", "przelewy24", "blik"]),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const plan = plans[payload.planId as PlanId];

    const payment = await prisma.payment.create({
      data: {
        profileId: payload.profileId,
        provider: payload.provider,
        buyerName: payload.buyerName,
        buyerEmail: payload.buyerEmail,
        status: "pending",
        amount: plan.amount,
        yearsToAdd: plan.years,
      },
    });

    if (payload.provider === "stripe" && stripe && plan.stripePriceId) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/${payload.profileId}?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/${payload.profileId}?canceled=1`,
        metadata: { paymentId: payment.id, profileId: payload.profileId },
        customer_email: payload.buyerEmail,
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { providerPaymentId: session.id },
      });

      return NextResponse.json({ redirectUrl: session.url, mode: "stripe" });
    }

    if (payload.provider === "przelewy24") {
      const result = await createPrzelewy24Transaction({
        sessionId: payment.id,
        amount: plan.amount,
        email: payload.buyerEmail,
        description: `${plan.label} · ${payload.profileId}`,
      });

      return NextResponse.json({ redirectUrl: result.redirectUrl, mode: "przelewy24_demo" });
    }

    return NextResponse.json({ paymentId: payment.id, mode: "demo" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
