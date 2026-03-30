import { NextRequest, NextResponse } from "next/server";
import {
  createGuestbookEntryBySlug,
  getGuestbookEntriesBySlug,
} from "@/lib/profile/guestbook";

export const runtime = "nodejs";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const entries = await getGuestbookEntriesBySlug(slug, 20);

    if (entries === null) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      entries,
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
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

    const created = await createGuestbookEntryBySlug({
      slug,
      authorName,
      message,
    });

    if (!created) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        ok: true,
        entry: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}