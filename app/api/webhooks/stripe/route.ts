import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { applyExtension } from "@/lib/extensions/apply-extension";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const payload = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "paid",
            providerPaymentId: session.id,
          },
        });
        await applyExtension(paymentId);
      }
    }

    return NextResponse.json({ ok: true, provider: "stripe" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
