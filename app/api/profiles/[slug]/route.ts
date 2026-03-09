import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const result = await pool.query(
      `
      SELECT
        id,
        slug,
        full_name,
        birth_year,
        death_year,
        quote,
        biography,
        hero_image_url,
        expires_at,
        qr_token,
        owner_user_id,
        created_at,
        updated_at
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/profiles/[slug] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
