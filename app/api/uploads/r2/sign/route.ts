import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { getOwnerSessionByToken } from "@/lib/owner/repository";
import { createObjectKey, createPresignedUpload } from "@/lib/storage/r2";

export const runtime = "nodejs";

const schema = z.object({
  kind: z.enum(["hero", "gallery"]),
  fileName: z.string().trim().min(1).max(255),
  contentType: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "image/jpeg" ||
        value === "image/png" ||
        value === "image/webp",
      "Dozwolone są tylko pliki JPG, PNG i WEBP."
    ),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, "Maksymalny rozmiar pliku to 10 MB."),
});

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

    const objectKey = createObjectKey({
      profileId: session.profile_id,
      kind: payload.kind,
      fileName: payload.fileName,
      contentType: payload.contentType,
    });

    const signed = await createPresignedUpload({
      key: objectKey,
      contentType: payload.contentType,
      expiresIn: 600,
    });

    return NextResponse.json({
      ok: true,
      uploadUrl: signed.uploadUrl,
      publicUrl: signed.publicUrl,
      objectKey: signed.objectKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się przygotować uploadu.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}