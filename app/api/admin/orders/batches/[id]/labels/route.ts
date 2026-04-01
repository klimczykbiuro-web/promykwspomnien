import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getBatchById } from "@/lib/admin/orders";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const { id } = await context.params;
  const batch = await getBatchById(id);

  if (!batch) {
    return NextResponse.json({ error: "Nie znaleziono batcha." }, { status: 404 });
  }

  if (!batch.labels_pdf_base64) {
    return NextResponse.json({ error: "Batch nie ma jeszcze pliku etykiet." }, { status: 404 });
  }

  const buffer = Buffer.from(batch.labels_pdf_base64 as string, "base64");

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="etykiety-${batch.business_day}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
