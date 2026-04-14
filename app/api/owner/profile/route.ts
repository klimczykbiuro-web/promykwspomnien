import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import {
  getOwnerSessionByToken,
  updateOwnerProfileContent,
} from "@/lib/owner/repository";

export const runtime = "nodejs";

const imageField = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("http://") ||
      value.startsWith("https://"),
    "Adres zdjęcia musi zaczynać się od http:// lub https://"
  );

const dateField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Data musi mieć format RRRR-MM-DD"
  );

const schema = z
  .object({
    heroImageUrl: imageField,
    quote: z.string().trim().max(240),
    biography: z.string().trim().max(6000),
    galleryImages: z.array(imageField).max(10),
    birthDate: dateField.optional().default(""),
    deathDate: dateField.optional().default(""),
  })
  .refine(
    (value) => {
      if (!value.birthDate || !value.deathDate) return true;
      return value.birthDate <= value.deathDate;
    },
    {
      message: "Data śmierci nie może być wcześniejsza niż data urodzenia.",
      path: ["deathDate"],
    }
  );

function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeGallery(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
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
      galleryImages: normalizeGallery(payload.galleryImages),
      birthDate: normalizeOptional(payload.birthDate),
      deathDate: normalizeOptional(payload.deathDate),
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Nie znaleziono profilu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: updated,
      message: "Zapisano zmiany.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieznany błąd.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}