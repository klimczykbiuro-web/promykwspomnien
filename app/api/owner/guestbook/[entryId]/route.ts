import { NextRequest, NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { getOwnerSessionByToken } from "@/lib/owner/repository";
import {
  deleteOwnerGuestbookEntry,
  updateOwnerGuestbookEntry,
} from "@/lib/owner/guestbook";

export const runtime = "nodejs";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ entryId: string }> }
) {
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

    const { entryId } = await context.params;
    const body = await request.json();

    const authorName = normalizeText(body?.authorName);
    const message = normalizeText(body?.message);

    if (!authorName) {
      return NextResponse.json(
        { error: "Podaj imię lub podpis." },
        { status: 400 }
      );
    }

    if (authorName.length > 80) {
      return NextResponse.json(
        { error: "Podpis jest za długi." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Wpis nie może być pusty." },
        { status: 400 }
      );
    }

    if (message.length > 800) {
      return NextResponse.json(
        { error: "Wpis jest za długi." },
        { status: 400 }
      );
    }

    const updated = await updateOwnerGuestbookEntry({
      profileId: session.profile_id,
      entryId,
      authorName,
      message,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Nie znaleziono wpisu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      entry: updated,
      message: "Wpis został zapisany.",
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ entryId: string }> }
) {
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

    const { entryId } = await context.params;

    const deleted = await deleteOwnerGuestbookEntry({
      profileId: session.profile_id,
      entryId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Nie znaleziono wpisu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Wpis został usunięty.",
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