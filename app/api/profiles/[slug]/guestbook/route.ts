import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type GuestbookRow = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const result = await pool.query(
      `
      SELECT
        ge.id,
        ge.author_name,
        ge.message,
        ge.created_at
      FROM guestbook_entries ge
      INNER JOIN profiles p ON p.id = ge.profile_id
      WHERE p.slug = $1
        AND ge.is_approved = TRUE
      ORDER BY ge.created_at DESC
      `,
      [slug],
    );

    return NextResponse.json({
      entries: (result.rows ?? []) as GuestbookRow[],
    });
  } catch (error) {
    console.error("GET /api/profiles/[slug]/guestbook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as {
      authorName?: string;
      message?: string;
    };

    const authorName = body.authorName?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (authorName.length < 2) {
      return NextResponse.json(
        { error: "Imię musi mieć co najmniej 2 znaki." },
        { status: 400 },
      );
    }

    if (message.length < 3) {
      return NextResponse.json(
        { error: "Treść wpisu musi mieć co najmniej 3 znaki." },
        { status: 400 },
      );
    }

    if (authorName.length > 80) {
      return NextResponse.json(
        { error: "Imię jest za długie." },
        { status: 400 },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Treść wpisu jest za długa." },
        { status: 400 },
      );
    }

    const profileResult = await pool.query(
      `
      SELECT id
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug],
    );

    if (profileResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Profil nie został znaleziony." },
        { status: 404 },
      );
    }

    const profileId = (profileResult.rows[0] as { id: string }).id;

    const inserted = await pool.query(
      `
      INSERT INTO guestbook_entries (
        profile_id,
        author_name,
        message,
        is_approved
      )
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, author_name, message, created_at
      `,
      [profileId, authorName, message],
    );

    return NextResponse.json(
      { entry: inserted.rows[0] as GuestbookRow },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/profiles/[slug]/guestbook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
