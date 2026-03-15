

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/profiles/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch profile");

  return res.json();
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
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-16 text-stone-900">
      <div className="mx-auto max-w-4xl rounded-[32px] bg-white p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div>
            <img
              src={
                profile.hero_image_url ||
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
              }
              alt={profile.full_name}
              className="h-72 w-full rounded-[28px] object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-stone-500">Profil pamięci</p>
            <h1 className="mt-2 text-4xl font-semibold">{profile.full_name}</h1>
            <p className="mt-2 text-stone-600">
              {profile.birth_year ?? "—"} — {profile.death_year ?? "—"}
            </p>

            {profile.quote ? (
              <p className="mt-6 text-lg italic text-stone-700">
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
    </div>
  );
}
