import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { claimOwnerAccess } from "@/lib/owner/repository";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1),
  token: z.string().min(16),
  password: z.string().min(8).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());

    const result = await claimOwnerAccess({
      slug: payload.slug,
      rawToken: payload.token,
      passwordHash: hashPassword(payload.password),
    });

    if (!result.ok) {
      const message =
        result.reason === "already_claimed"
          ? "Dostęp właściciela został już aktywowany dla tego profilu."
          : result.reason === "invalid_token"
          ? "Nieprawidłowy link aktywacyjny."
          : "Profil nie został znaleziony.";

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