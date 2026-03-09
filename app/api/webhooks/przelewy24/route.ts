import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyExtension } from "@/lib/extensions/apply-extension";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { paymentId?: string } | null;

  if (!body?.paymentId) {
    return NextResponse.json({ error: "Missing paymentId." }, { status: 400 });
  }

  await prisma.payment.update({
    where: { id: body.paymentId },
    data: { status: "paid" },
  });

  await applyExtension(body.paymentId);

  return NextResponse.json({ ok: true, provider: "przelewy24" });
}
