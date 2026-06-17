import { NextRequest, NextResponse } from "next/server";
import { updatePartnerSchema } from "@/lib/admin/partners/schema";
import {
  getPartnerById,
  listPartnerAssignments,
  listPartnerActivations,
  updatePartner,
} from "@/lib/admin/partners/repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const partner = await getPartnerById(id);

    if (!partner) {
      return NextResponse.json(
        { ok: false, error: "Nie znaleziono partnera." },
        { status: 404 }
      );
    }

    const [assignments, activations] = await Promise.all([
      listPartnerAssignments(id),
      listPartnerActivations(id),
    ]);

    return NextResponse.json({
      ok: true,
      partner,
      assignments,
      activations,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = updatePartnerSchema.parse(await request.json());
    const partner = await updatePartner(id, payload);

    if (!partner) {
      return NextResponse.json(
        { ok: false, error: "Nie znaleziono partnera." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, partner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
