import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(10000).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const payload = schema.parse(await request.json());

    const existingResult = await pool.query(
      `
      SELECT
        id,
        grave_latitude,
        grave_longitude
      FROM profiles
      WHERE slug = $1
      LIMIT 1
      `,
      [slug]
    );

    if (existingResult.rowCount === 0) {
      return NextResponse.json({ error: "Profil nie został znaleziony." }, { status: 404 });
    }

    const existing = existingResult.rows[0] as {
      id: string;
      grave_latitude: number | null;
      grave_longitude: number | null;
    };

    if (existing.grave_latitude !== null && existing.grave_longitude !== null) {
      return NextResponse.json(
        {
          error: "Lokalizacja została już ustawiona.",
          data: {
            latitude: existing.grave_latitude,
            longitude: existing.grave_longitude,
          },
        },
        { status: 409 }
      );
    }

    const updateResult = await pool.query(
      `
      UPDATE profiles
      SET
        grave_latitude = $2,
        grave_longitude = $3,
        grave_location_accuracy_meters = $4,
        grave_location_set_at = NOW()
      WHERE slug = $1
      RETURNING
        grave_latitude,
        grave_longitude
      `,
      [
        slug,
        payload.latitude,
        payload.longitude,
        payload.accuracy ? Math.round(payload.accuracy) : null,
      ]
    );

    const updated = updateResult.rows[0] as {
      grave_latitude: number;
      grave_longitude: number;
    };

    return NextResponse.json({
      ok: true,
      data: {
        latitude: updated.grave_latitude,
        longitude: updated.grave_longitude,
      },
      message: "Lokalizacja nagrobka została zapisana.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Wystąpił nieznany błąd.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}