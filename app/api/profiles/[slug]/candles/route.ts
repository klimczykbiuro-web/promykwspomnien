import { NextRequest, NextResponse } from "next/server";
import {
  createCandleBySlug,
  getCandleCountBySlug,
} from "@/lib/profile/candles";

export const runtime = "nodejs";

const COOKIE_PREFIX = "memorial_candle_";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 godzin

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const cookieName = `${COOKIE_PREFIX}${slug}`;

    const existingCookie = request.cookies.get(cookieName)?.value;
    const currentCount = await getCandleCountBySlug(slug);

    if (currentCount === null) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    if (existingCookie === "1") {
      return NextResponse.json(
        {
          count: currentCount,
          alreadyLit: true,
          message: "Znicz został już zapalony z tego urządzenia.",
        },
        { status: 429 }
      );
    }

    const created = await createCandleBySlug(slug);

    if (!created) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const response = NextResponse.json(
      {
        count: created.count,
        alreadyLit: true,
        message: "Dziękujemy. Znicz został zapalony.",
      },
      { status: 201 }
    );

    response.cookies.set({
      name: cookieName,
      value: "1",
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}