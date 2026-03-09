import { pool } from "@/lib/db";
import GuestbookSection from "@/components/profile/guestbook-section";

type Profile = {
  id: string;
  slug: string;
  full_name: string;
  birth_year: number | null;
  death_year: number | null;
  quote: string | null;
  biography: string | null;
  hero_image_url: string | null;
  expires_at: string;
  qr_token: string;
};

async function getProfile(slug: string): Promise<Profile | null> {
  const result = await pool.query<Profile>(
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
      qr_token
    FROM profiles
    WHERE slug = $1
    LIMIT 1
    `,
    [slug],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f7f2ec] px-6 py-16 text-stone-900">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Profil nie został znaleziony</h1>
          <p className="mt-3 text-stone-600">
            Nie ma jeszcze profilu o adresie: {slug}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-10 text-stone-900 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[36px] bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 md:grid-cols-[280px_1fr] md:items-start">
            <div>
              <img
                src={
                  profile.hero_image_url ||
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
                }
                alt={profile.full_name}
                className="h-80 w-full rounded-[28px] object-cover"
              />
            </div>

            <div>
              <p className="text-sm text-stone-500">Profil pamięci</p>
              <h1 className="mt-2 text-4xl font-semibold">{profile.full_name}</h1>
              <p className="mt-2 text-lg text-stone-600">
                {profile.birth_year ?? "—"} — {profile.death_year ?? "—"}
              </p>

              {profile.quote ? (
                <p className="mt-6 text-xl italic text-stone-700">
                  „{profile.quote}”
                </p>
              ) : null}

              {profile.biography ? (
                <p className="mt-6 whitespace-pre-line leading-8 text-stone-700">
                  {profile.biography}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <GuestbookSection slug={profile.slug} />
      </div>
    </div>
  );
}
