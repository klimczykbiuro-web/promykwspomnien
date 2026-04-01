import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createDailyShippingBatch } from "@/lib/admin/orders";

export const runtime = "nodejs";

export async function POST() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  try {
    const result = await createDailyShippingBatch({ source: "admin" });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nie udało się utworzyć batcha.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
