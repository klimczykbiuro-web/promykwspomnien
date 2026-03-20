import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { activateQrCodeAndCreateProfile } from "@/lib/qr/repository";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(16),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());

    const result = await activateQrCodeAndCreateProfile({
      rawToken: payload.token,
      fullName: payload.fullName,
      password: payload.password,
    });

    if (!result.ok) {
      const message =
        result.reason === "already_activated"
          ? "Ta tabliczka została już aktywowana."
          : result.reason === "disabled"
          ? "Ta tabliczka jest nieaktywna."
          : "Nie znaleziono tabliczki.";

      return NextResponse.json({ error: message }, { status: 409 });
    }

    const response = NextResponse.json({
      ok: true,
      profileId: result.profileId,
      slug: result.slug,
    });

    response.cookies.set(OWNER_SESSION_COOKIE, result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(result.sessionExpiresAt),
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}