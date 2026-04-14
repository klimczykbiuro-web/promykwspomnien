import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { deleteOwnerSession } from "@/lib/owner/repository";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  if (rawToken) {
    await deleteOwnerSession(rawToken);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);

  response.cookies.set(OWNER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
