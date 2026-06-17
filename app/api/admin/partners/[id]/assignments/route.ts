import { NextRequest, NextResponse } from "next/server";
import { createPartnerAssignmentSchema } from "@/lib/admin/partners/schema";
import {
  createPartnerAssignment,
  getPartnerById,
} from "@/lib/admin/partners/repository";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
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

    const payload = createPartnerAssignmentSchema.parse(await request.json());
    const assignment = await createPartnerAssignment(id, payload);

    return NextResponse.json({ ok: true, assignment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message.includes("partner_lot_assignments_lot_unique") ||
      message.includes("unique")
        ? 409
        : 400;

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
