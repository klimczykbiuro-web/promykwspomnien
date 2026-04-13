import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Ustawianie lokalizacji z publicznego profilu zostało wyłączone. Zaloguj się jako właściciel i ustaw lokalizację w panelu.",
    },
    { status: 403 }
  );
}
