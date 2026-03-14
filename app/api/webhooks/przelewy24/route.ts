import { NextRequest, NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/payments/repository";
import { applyExtensionForPayment } from "@/lib/extensions/apply-extension";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          paymentId?: string;
          providerPaymentId?: string;
        }
      | null;

    if (!body?.paymentId) {
      return NextResponse.json(
        { error: "Missing paymentId" },
        { status: 400 }
      );
    }

    await markPaymentPaid(body.paymentId, body.providerPaymentId);
    const extensionResult = await applyExtensionForPayment(body.paymentId);

    return NextResponse.json({
      ok: true,
      paymentId: body.paymentId,
      extensionResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}