import { pool } from "@/lib/db";

export type AdminStats = {
  totalProfiles: number;
  newProfiles7d: number;
  newProfiles30d: number;
  claimedProfiles: number;
  expiredProfiles: number;
  renewals30d: number;
  revenue30dGross: number;
  reportsNew: number;
  reportsHigh: number;
  profileViewsToday: number;
  profileViews7d: number;
  profileViews30d: number;
  profileViewsAll: number;
  homeViewsToday: number;
  homeViews30d: number;
  homeViewsAll: number;
  pamiecViewsToday: number;
  pamiecViews30d: number;
  pamiecViewsAll: number;
};

export type ModerationReportRow = {
  id: string;
  created_at: string;
  updated_at: string;
  profile_id: string | null;
  profile_image_id: string | null;
  profile_slug: string | null;
  reported_by_email: string | null;
  report_reason: string;
  report_description: string | null;
  status: string;
  priority: string;
  resolution: string | null;
  resolution_note: string | null;
  reviewed_at: string | null;
  profile_full_name: string | null;
  image_url: string | null;
  moderation_status: string | null;
};

function valueOf(result: { rows: Array<{ value: number | string | null }> }) {
  return Number(result.rows[0]?.value ?? 0);
}

export async function getAdminStats(): Promise<AdminStats> {
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

    pool.query(`
      select count(*)::int as value
      from profiles
      where created_at >= now() - interval '7 days'
    `),

    pool.query(`
      select count(*)::int as value
      from profiles
      where created_at >= now() - interval '30 days'
    `),

    pool.query(`
      select count(*)::int as value
      from profiles
      where owner_access_enabled = true
    `),

    pool.query(`
      select count(*)::int as value
      from profiles
      where expires_at is not null
        and expires_at < now()
    `),

    pool.query(`
      select count(*)::int as value
      from extensions
      where created_at >= now() - interval '30 days'
    `),

    pool.query(`
      select coalesce(sum(amount), 0)::bigint as value
      from payments
      where status = 'paid'
        and coalesce(paid_at, created_at) >= now() - interval '30 days'
    `),

    pool.query(`
      select count(*)::int as value
      from content_reports
      where status in ('new', 'reported', 'in_review')
    `),

    pool.query(`
      select count(*)::int as value
      from content_reports
      where priority in ('high', 'critical')
        and status in ('new', 'reported', 'in_review')
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'profile'
        and created_at >= date_trunc('day', now())
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'profile'
        and created_at >= now() - interval '7 days'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'profile'
        and created_at >= now() - interval '30 days'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'profile'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'home'
        and created_at >= date_trunc('day', now())
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'home'
        and created_at >= now() - interval '30 days'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'home'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'pamiec'
        and created_at >= date_trunc('day', now())
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'pamiec'
        and created_at >= now() - interval '30 days'
    `),

    pool.query(`
      select count(*)::int as value
      from page_views
      where page_type = 'pamiec'
    `),
  ]);

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

export async function getModerationReports(
  limit = 100
): Promise<ModerationReportRow[]> {
  const result = await pool.query(
    `
    select
      cr.id,
      cr.created_at,
      cr.updated_at,
      cr.profile_id,
      cr.profile_image_id,
      cr.profile_slug,
      cr.reported_by_email,
      cr.report_reason,
      cr.report_description,
      cr.status,
      cr.priority,
      cr.resolution,
      cr.resolution_note,
      cr.reviewed_at,
      p.full_name as profile_full_name,
      pgi.image_url,
      pgi.moderation_status
    from content_reports cr
    left join profiles p
      on p.slug = cr.profile_slug
    left join profile_gallery_images pgi
      on pgi.id = cr.profile_image_id
    order by
      case
        when cr.priority = 'critical' then 1
        when cr.priority = 'high' then 2
        else 3
      end,
      case
        when cr.status in ('new', 'reported', 'in_review') then 1
        else 2
      end,
      cr.created_at desc
    limit $1
    `,
    [limit]
  );

  return result.rows as ModerationReportRow[];
}