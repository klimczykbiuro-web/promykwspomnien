import { cookies } from "next/headers";
import Link from "next/link";
import CandleSection from "./candle-section";
import PhotoFlameBadge from "./photo-flame-badge";
import GallerySection from "./gallery-section";
import styles from "./profile.module.css";
import { getCandleCountBySlug } from "@/lib/profile/candles";

type Profile = {
  id: string;
  slug: string;
  full_name: string;
  birth_year: number | null;
  death_year: number | null;
  quote: string | null;
  biography: string | null;
  hero_image_url: string | null;
  expires_at: string | null;
  galleryImages: string[];
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

function getYearsLabel(profile: Profile) {
  const birth = profile.birth_year ?? "—";
  const death = profile.death_year ?? "—";
  return `${birth} — ${death}`;
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
      <main className={styles.wrapper}>
        <div className="container">
          <section className={styles.notFoundCard}>
            <p className={styles.notFoundLabel}>Profil pamięci</p>
            <h1 className={styles.notFoundTitle}>Profil nie został znaleziony</h1>
            <p className={styles.notFoundText}>
              Nie ma jeszcze profilu o adresie: {slug}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const yearsLabel = getYearsLabel(profile);
  const candleCount = (await getCandleCountBySlug(slug)) ?? 0;

  const cookieStore = await cookies();
  const initialAlreadyLit =
    cookieStore.get(`memorial_candle_${slug}`)?.value === "1";

  return (
    <main className={styles.wrapper}>
      <div className="container">
        <div className={styles.stack}>
          <section className={styles.heroCard}>
            <div className={styles.heroGrid}>
              <div className={styles.imageWrap}>
                {profile.hero_image_url ? (
                  <img
                    src={profile.hero_image_url}
                    alt={profile.full_name}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.imagePlaceholderText}>
                      Brak zdjęcia
                    </span>
                  </div>
                )}

                <PhotoFlameBadge initialAlreadyLit={initialAlreadyLit} />
              </div>

              <div className={styles.heroContent}>
                <p className={styles.eyebrow}>Profil pamięci</p>
                <h1 className={styles.name}>{profile.full_name}</h1>
                <p className={styles.years}>{yearsLabel}</p>

                {profile.quote ? (
                  <blockquote className={styles.quote}>
                    „{profile.quote}”
                  </blockquote>
                ) : null}
              </div>
            </div>
          </section>

          <CandleSection
            slug={profile.slug}
            initialCount={candleCount}
            initialAlreadyLit={initialAlreadyLit}
          />

          <section className={styles.contentCard}>
            <div className={styles.contentInner}>
              <h2 className={styles.sectionTitle}>Wspomnienie</h2>

              {profile.biography ? (
                <div className={styles.biography}>{profile.biography}</div>
              ) : (
                <p className={styles.emptyText}>
                  Wspomnienie nie zostało jeszcze uzupełnione.
                </p>
              )}
            </div>
          </section>

          {profile.galleryImages.length > 0 ? (
            <GallerySection
              fullName={profile.full_name}
              images={profile.galleryImages}
            />
          ) : null}

          <section className={styles.renewCard}>
            <div className={styles.renewInner}>
              <p className={styles.renewEyebrow}>Przedłużenie profilu</p>
              <h2 className={styles.renewTitle}>
                Chcesz zachować profil aktywny?
              </h2>
              <p className={styles.renewText}>
                Każda osoba może opłacić przedłużenie ważności tego profilu.
              </p>

              <Link
                href={`/przedluz/${profile.slug}`}
                className={styles.renewButton}
              >
                Przedłuż profil
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}