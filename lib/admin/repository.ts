import { pool } from "@/lib/db";

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
      where status = 'new'
    `),

    pool.query(`
      select count(*)::int as value
      from content_reports
      where priority in ('high', 'critical')
        and status in ('new', 'in_review')
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