import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import {
  getOwnerSessionByToken,
  updateOwnerProfileContent,
} from "@/lib/owner/repository";

export const runtime = "nodejs";

const schema = z.object({
  heroImageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("http://") ||
        value.startsWith("https://"),
      "Adres zdjęcia musi zaczynać się od http:// lub https://"
    ),
  quote: z.string().trim().max(240),
  biography: z.string().trim().max(6000),
});

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

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

    const payload = schema.parse(await request.json());

    const updated = await updateOwnerProfileContent(session.profile_id, {
      heroImageUrl: normalizeOptional(payload.heroImageUrl),
      quote: normalizeOptional(payload.quote),
      biography: normalizeOptional(payload.biography),
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: updated,
      message: "Zapisano zmiany.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieznany błąd.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}