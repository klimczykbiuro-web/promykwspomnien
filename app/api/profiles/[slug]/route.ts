import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const profileResult = await pool.query(
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
        expires_at
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (profileResult.rowCount === 0) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const profile = profileResult.rows[0] as {
      id: string;
      slug: string;
      full_name: string;
      birth_year: number | null;
      death_year: number | null;
      quote: string | null;
      biography: string | null;
      hero_image_url: string | null;
      expires_at: string | null;
    };

    const galleryResult = await pool.query(
      `
      SELECT image_url, sort_order
      FROM profile_gallery_images
      WHERE profile_id = $1
      ORDER BY sort_order ASC
      `,
      [profile.id]
    );

    const galleryImages = (galleryResult.rows as Array<{ image_url: string }>).map(
  (row) => row.image_url
);

    return NextResponse.json({
      ...profile,
      galleryImages,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}