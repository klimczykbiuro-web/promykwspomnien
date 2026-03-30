import { NextRequest, NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { getOwnerSessionByToken } from "@/lib/owner/repository";
import { updateOwnerGuestbookSettings } from "@/lib/owner/guestbook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawSessionToken =
      request.cookies.get(OWNER_SESSION_COOKIE)?.value ?? "";

    if (!rawSessionToken) {
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
    }

    const session = await getOwnerSessionByToken(rawSessionToken);

    if (!session) {
      return NextResponse.json(
        { error: "Sesja wygasła. Zaloguj się ponownie." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const enabled = Boolean(body?.enabled);

    const updated = await updateOwnerGuestbookSettings(
      session.profile_id,
      enabled
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      guestbookEnabled: updated.guestbookEnabled,
      message: updated.guestbookEnabled
        ? "Księga gości została włączona."
        : "Księga gości została wyłączona.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}