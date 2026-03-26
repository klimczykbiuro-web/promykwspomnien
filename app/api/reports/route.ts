import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const HIGH_PRIORITY_REASONS = new Set(["privacy", "living_person", "illegal"]);

export const runtime = "nodejs";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const profileSlug = String(body.profileSlug || "").trim();
    const profileImageId = body.profileImageId ? String(body.profileImageId) : null;
    const reportedByEmail = String(body.reportedByEmail || "").trim() || null;
    const reportReason = String(body.reportReason || "").trim();
    const reportDescription = String(body.reportDescription || "").trim() || null;

    if (!profileSlug) {
      return NextResponse.json({ error: "Brak identyfikatora profilu." }, { status: 400 });
    }

    if (!reportReason) {
      return NextResponse.json({ error: "Wybierz powód zgłoszenia." }, { status: 400 });
    }

    const priority = HIGH_PRIORITY_REASONS.has(reportReason) ? "high" : "normal";
    const nextModerationStatus = priority === "high" ? "hidden_pending_review" : "reported";

    await client.query("begin");

    await client.query(
      `
      insert into content_reports (
        profile_image_id,
        profile_slug,
        reported_by_email,
        report_reason,
        report_description,
        status,
        priority,
        updated_at
      )
      values ($1, $2, $3, $4, $5, 'new', $6, now())
      `,
      [profileImageId, profileSlug, reportedByEmail, reportReason, reportDescription, priority]
    );

    if (profileImageId) {
      await client.query(
        `
        update profile_gallery_images
        set moderation_status = $2,
            moderation_reason = $3,
            hidden_at = case when $2 = 'hidden_pending_review' then now() else hidden_at end
        where id = $1
        `,
        [profileImageId, nextModerationStatus, reportReason]
      );
    }

    await client.query("commit");

    return NextResponse.json({ ok: true });
  } catch (error) {
    await client.query("rollback").catch(() => {});
    console.error(error);
    return NextResponse.json({ error: "Nie udało się wysłać zgłoszenia." }, { status: 500 });
  } finally {
    client.release();
  }
}
