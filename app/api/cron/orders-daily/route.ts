import { NextRequest, NextResponse } from "next/server";
import { createDailyShippingBatch } from "@/lib/admin/orders";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return NextResponse.json({ error: "Brak CRON_SECRET." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (token !== expected) {
    return NextResponse.json({ error: "Brak autoryzacji crona." }, { status: 401 });
  }

  try {
    const result = await createDailyShippingBatch({ source: "cron" });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron batch failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
