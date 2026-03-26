import { pool } from "@/lib/db";

type RecordPageViewInput = {
  pageType: "home" | "pamiec" | "profile";
  path: string;
  profileId?: string | null;
  profileSlug?: string | null;
};

export async function recordPageView(input: RecordPageViewInput) {
  try {
    await pool.query(
      `
      insert into page_views (
        page_type,
        path,
        profile_id,
        profile_slug,
        created_at
      )
      values ($1, $2, $3, $4, now())
      `,
      [
        input.pageType,
        input.path,
        input.profileId ?? null,
        input.profileSlug ?? null,
      ]
    );
  } catch (error) {
    console.error("recordPageView failed", error);
  }
}