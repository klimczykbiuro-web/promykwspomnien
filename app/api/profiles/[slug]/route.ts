import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

type ProfileRow = {
  id: string;
  slug: string;
  full_name: string;
  birth_year: number | null;
  death_year: number | null;
  quote: string | null;
  biography: string | null;
  hero_image_url: string | null;
  expires_at: string | null;
  grave_latitude: number | null;
  grave_longitude: number | null;
};

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function getProfileState(expiresAt: string | null) {
  if (!expiresAt) {
    return {
      state: "active" as const,
      graceUntil: null as string | null,
    };
  }

  const expiry = new Date(expiresAt);

  if (Number.isNaN(expiry.getTime())) {
    return {
      state: "active" as const,
      graceUntil: null as string | null,
    };
  }

  const now = new Date();
  const graceUntilDate = addMonths(expiry, 3);

  if (now <= expiry) {
    return {
      state: "active" as const,
      graceUntil: graceUntilDate.toISOString(),
    };
  }

  if (now <= graceUntilDate) {
    return {
      state: "expired" as const,
      graceUntil: graceUntilDate.toISOString(),
    };
  }

  return {
    state: "deleted" as const,
    graceUntil: graceUntilDate.toISOString(),
  };
}

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
        expires_at,
        grave_latitude,
        grave_longitude
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (profileResult.rowCount === 0) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const profile = profileResult.rows[0] as ProfileRow;
    const profileState = getProfileState(profile.expires_at);

    if (profileState.state === "deleted") {
      return NextResponse.json({
        id: profile.id,
        slug: profile.slug,
        full_name: profile.full_name,
        birth_year: profile.birth_year,
        death_year: profile.death_year,
        quote: null,
        biography: null,
        hero_image_url: null,
        expires_at: profile.expires_at,
        grace_until: profileState.graceUntil,
        visibility_state: "deleted",
        grave_latitude: null,
        grave_longitude: null,
        galleryImages: [],
      });
    }

    if (profileState.state === "expired") {
      return NextResponse.json({
        id: profile.id,
        slug: profile.slug,
        full_name: profile.full_name,
        birth_year: profile.birth_year,
        death_year: profile.death_year,
        quote: null,
        biography: null,
        hero_image_url: profile.hero_image_url,
        expires_at: profile.expires_at,
        grace_until: profileState.graceUntil,
        visibility_state: "expired",
        grave_latitude: profile.grave_latitude,
        grave_longitude: profile.grave_longitude,
        galleryImages: [],
      });
    }

    const galleryResult = await pool.query(
      `
      SELECT id, image_url, sort_order
      FROM profile_gallery_images
      WHERE profile_id = $1
        AND moderation_status = 'active'
      ORDER BY sort_order ASC
      `,
      [profile.id]
    );

    const galleryImages = (
      galleryResult.rows as Array<{ id: string; image_url: string }>
    ).map((row) => ({
      id: row.id,
      url: row.image_url,
    }));

    return NextResponse.json({
      ...profile,
      grace_until: profileState.graceUntil,
      visibility_state: "active",
      galleryImages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}