import { pool } from "@/lib/db";

export type ReportRow = {
  id: string;
  created_at: string;
  profile_slug: string | null;
  profile_image_id: string | null;
  reported_by_email: string | null;
  report_reason: string;
  report_description: string | null;
  status: string;
  priority: string;
  resolution: string | null;
  moderation_status: string | null;
};

export async function getAdminStats() {
  const [
    profilesTotal,
    profiles7d,
    profiles30d,
    claimedProfiles,
    expiredProfiles,
    renewals30d,
    revenue30d,
    reportsNew,
    reportsHigh,
    profileViewsToday,
    profileViews7d,
    profileViews30d,
    profileViewsAll,
    homeViewsToday,
    homeViews30d,
    homeViewsAll,
    pamiecViewsToday,
    pamiecViews30d,
    pamiecViewsAll,
  ] = await Promise.all([
    pool.query(`select count(*)::int as value from profiles`),
    pool.query(`select count(*)::int as value from profiles where created_at >= now() - interval '7 days'`),
    pool.query(`select count(*)::int as value from profiles where created_at >= now() - interval '30 days'`),
    pool.query(`select count(*)::int as value from profiles where owner_access_enabled = true`),
    pool.query(`select count(*)::int as value from profiles where expires_at is not null and expires_at < now()`),
    pool.query(`select count(*)::int as value from extensions where created_at >= now() - interval '30 days'`),
    pool.query(`select coalesce(sum(amount), 0)::bigint as value from payments where status = 'paid' and coalesce(paid_at, created_at) >= now() - interval '30 days'`),
    pool.query(`select count(*)::int as value from content_reports where status = 'new'`),
    pool.query(`select count(*)::int as value from content_reports where priority in ('high', 'critical') and status in ('new', 'in_review')`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'profile' and created_at >= date_trunc('day', now())`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'profile' and created_at >= now() - interval '7 days'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'profile' and created_at >= now() - interval '30 days'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'profile'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'home' and created_at >= date_trunc('day', now())`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'home' and created_at >= now() - interval '30 days'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'home'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'pamiec' and created_at >= date_trunc('day', now())`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'pamiec' and created_at >= now() - interval '30 days'`),
    pool.query(`select count(*)::int as value from page_views where page_type = 'pamiec'`),
  ]);

  function valueOf(result: any) {
    return Number(result.rows[0]?.value ?? 0);
  }

  return {
    totalProfiles: valueOf(profilesTotal),
    newProfiles7d: valueOf(profiles7d),
    newProfiles30d: valueOf(profiles30d),
    claimedProfiles: valueOf(claimedProfiles),
    expiredProfiles: valueOf(expiredProfiles),
    renewals30d: valueOf(renewals30d),
    revenue30dGross: valueOf(revenue30d),
    reportsNew: valueOf(reportsNew),
    reportsHigh: valueOf(reportsHigh),
    profileViewsToday: valueOf(profileViewsToday),
    profileViews7d: valueOf(profileViews7d),
    profileViews30d: valueOf(profileViews30d),
    profileViewsAll: valueOf(profileViewsAll),
    homeViewsToday: valueOf(homeViewsToday),
    homeViews30d: valueOf(homeViews30d),
    homeViewsAll: valueOf(homeViewsAll),
    pamiecViewsToday: valueOf(pamiecViewsToday),
    pamiecViews30d: valueOf(pamiecViews30d),
    pamiecViewsAll: valueOf(pamiecViewsAll),
  };
}

export async function getLatestReports(limit = 50): Promise<ReportRow[]> {
  const result = await pool.query(
    `
    select
      cr.id,
      cr.created_at,
      cr.profile_slug,
      cr.profile_image_id,
      cr.reported_by_email,
      cr.report_reason,
      cr.report_description,
      cr.status,
      cr.priority,
      cr.resolution,
      pgi.moderation_status
    from content_reports cr
    left join profile_gallery_images pgi on pgi.id = cr.profile_image_id
    order by cr.created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows;
}

export async function applyReportAction(input: {
  reportId: string;
  action: "keep" | "hide" | "remove" | "restore";
}) {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const reportResult = await client.query(
      `
      select id, profile_image_id, profile_slug
      from content_reports
      where id = $1
      for update
      `,
      [input.reportId]
    );

    const report = reportResult.rows[0];

    if (!report) {
      throw new Error("Nie znaleziono zgłoszenia.");
    }

    const imageId = report.profile_image_id as string | null;

    if (imageId) {
      if (input.action === "keep" || input.action === "restore") {
        await client.query(
          `
          update profile_gallery_images
          set moderation_status = 'active',
              moderation_reason = null,
              hidden_at = null,
              removed_at = null
          where id = $1
          `,
          [imageId]
        );
      }

      if (input.action === "hide") {
        await client.query(
          `
          update profile_gallery_images
          set moderation_status = 'hidden_pending_review',
              hidden_at = now()
          where id = $1
          `,
          [imageId]
        );
      }

      if (input.action === "remove") {
        await client.query(
          `
          update profile_gallery_images
          set moderation_status = 'removed',
              removed_at = now()
          where id = $1
          `,
          [imageId]
        );
      }
    }

    const resolutionMap: Record<string, string> = {
      keep: "resolved_keep",
      hide: "resolved_hide",
      remove: "resolved_remove",
      restore: "resolved_restore",
    };

    await client.query(
      `
      update content_reports
      set status = 'resolved',
          resolution = $2,
          reviewed_at = now(),
          updated_at = now()
      where id = $1
      `,
      [input.reportId, resolutionMap[input.action]]
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
