import { NextRequest, NextResponse } from "next/server";
import { createPartnerSchema } from "@/lib/admin/partners/schema";
import {
  createPartner,
  listPartnersSummary,
} from "@/lib/admin/partners/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const partners = await listPartnersSummary();
    return NextResponse.json({ ok: true, partners });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = createPartnerSchema.parse(await request.json());
    const partner = await createPartner(payload);
    return NextResponse.json({ ok: true, partner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
