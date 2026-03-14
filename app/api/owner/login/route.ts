import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { loginOwner } from "@/lib/owner/repository";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const result = await loginOwner(payload.slug, payload.password);

    if (!result.ok) {
      const message =
        result.reason === "not_claimed"
          ? "Dostęp właściciela nie został jeszcze aktywowany."
          : "Nieprawidłowy slug lub hasło.";

      return NextResponse.json({ error: message }, { status: 401 });
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