import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import { getOwnerSessionByToken } from "@/lib/owner/repository";

export const runtime = "nodejs";

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(10000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(OWNER_SESSION_COOKIE)?.value ?? "";

    if (!rawSessionToken) {
      return NextResponse.json({ error: "Brak sesji." }, { status: 401 });
    }

    const session = await getOwnerSessionByToken(rawSessionToken);

    if (!session) {
      return NextResponse.json(
        { error: "Sesja wygasła. Zaloguj się ponownie." },
        { status: 401 }
      );
    }

    const payload = schema.parse(await request.json());

    const updateResult = await pool.query(
      `
      UPDATE profiles
      SET
        grave_latitude = $2,
        grave_longitude = $3,
        grave_location_accuracy_meters = $4,
        grave_location_set_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING grave_latitude, grave_longitude
      `,
      [
        session.profile_id,
        payload.latitude,
        payload.longitude,
        payload.accuracy ? Math.round(payload.accuracy) : null,
      ]
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ error: "Nie znaleziono profilu." }, { status: 404 });
    }

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
