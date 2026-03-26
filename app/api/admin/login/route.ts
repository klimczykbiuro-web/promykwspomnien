import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const login = String(body.login || "").trim();
    const password = String(body.password || "");

    if (!verifyAdminCredentials(login, password)) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło." },
        { status: 401 }
      );
    }

    const session = createAdminSessionToken();

    const response = NextResponse.json({ ok: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, session.raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}