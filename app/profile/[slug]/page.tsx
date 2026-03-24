import { cookies } from "next/headers";
import Link from "next/link";
import CandleSection from "./candle-section";
import PhotoFlameBadge from "./photo-flame-badge";
import GallerySection from "./gallery-section";
import styles from "./profile.module.css";
import { getCandleCountBySlug } from "@/lib/profile/candles";

type ProfileVisibilityState = "active" | "expired" | "deleted";

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
  grace_until: string | null;
  visibility_state: ProfileVisibilityState;
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

function formatDatePl(dateValue: string | null) {
  if (!dateValue) {
    return "termin nieustalony";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "termin nieustalony";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function pluralizeMonths(count: number) {
  if (count === 1) return "miesiąc";
  if (count >= 2 && count <= 4) return "miesiące";
  return "miesięcy";
}

function getRenewBadge(expiresAt: string | null) {
  if (!expiresAt) {
    return {
      text: "termin nieustalony",
      detail: "skontaktuj się z obsługą",
      tone: "neutral" as const,
    };
  }

  const expiry = new Date(expiresAt);

  if (Number.isNaN(expiry.getTime())) {
    return {
      text: "termin nieustalony",
      detail: "skontaktuj się z obsługą",
      tone: "neutral" as const,
    };
  }

  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = formatDatePl(expiresAt);

  if (diffDays < 0) {
    return {
      text: "profil wygasł",
      detail: `ważność minęła ${formatted}`,
      tone: "expired" as const,
    };
  }

  if (diffDays <= 30) {
    if (diffDays === 0) {
      return {
        text: "wygasa dzisiaj",
        detail: `ważny do ${formatted}`,
        tone: "warning" as const,
      };
    }

    return {
      text: `wygasa za ${diffDays} dni`,
      detail: `ważny do ${formatted}`,
      tone: "warning" as const,
    };
  }

  return {
    text: `ważny do ${formatted}`,
    detail: "profil jest aktywny",
    tone: "ok" as const,
  };
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
  const renewBadge = getRenewBadge(profile.expires_at);

  const renewButtonClassName = [
    styles.renewButton,
    renewBadge.tone === "warning" ? styles.renewButtonWarning : "",
    renewBadge.tone === "expired" ? styles.renewButtonExpired : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cookieStore = await cookies();
  const initialAlreadyLit =
    cookieStore.get(`memorial_candle_${slug}`)?.value === "1";

  const candleCount =
    profile.visibility_state === "active"
      ? (await getCandleCountBySlug(slug)) ?? 0
      : 0;

  if (profile.visibility_state === "deleted") {
    return (
      <main className={styles.wrapper}>
        <div className="container">
          <div className={styles.stack}>
            <section className={styles.heroCard}>
              <div className={styles.heroGrid}>
                <div className={styles.imageWrap}>
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.imagePlaceholderText}>
                      Profil usunięty
                    </span>
                  </div>
                </div>

                <div className={styles.heroContent}>
                  <p className={styles.eyebrow}>Profil pamięci</p>
                  <h1 className={styles.name}>{profile.full_name}</h1>
                  <p className={styles.years}>{yearsLabel}</p>
                </div>
              </div>
            </section>

            <section className={styles.expiredCard}>
              <div className={styles.expiredInner}>
                <p className={styles.expiredEyebrow}>Profil został usunięty</p>
                <h2 className={styles.expiredTitle}>
                  Minął okres przechowywania danych
                </h2>
                <p className={styles.expiredText}>
                  Ten profil został usunięty po upływie 3 miesięcy od daty
                  wygaśnięcia. Jego zawartość nie jest już dostępna.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (profile.visibility_state === "expired") {
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

                  <PhotoFlameBadge initialAlreadyLit={false} />
                </div>

                <div className={styles.heroContent}>
                  <p className={styles.eyebrow}>Profil pamięci</p>
                  <h1 className={styles.name}>{profile.full_name}</h1>
                  <p className={styles.years}>{yearsLabel}</p>
                </div>
              </div>
            </section>

            <section className={styles.expiredCard}>
              <div className={styles.expiredInner}>
                <p className={styles.expiredEyebrow}>Profil wygasł</p>
                <h2 className={styles.expiredTitle}>
                  Pełna zawartość profilu jest obecnie wyłączona
                </h2>
                <p className={styles.expiredText}>
                  Dane tego profilu przechowujemy jeszcze przez{" "}
                  <strong>3 {pluralizeMonths(3)}</strong> od daty wygaśnięcia.
                  Aby przywrócić pełną zawartość profilu, opłać przedłużenie
                  przed terminem <strong>{formatDatePl(profile.grace_until)}</strong>.
                </p>

                <div className={styles.expiredMetaGrid}>
                  <div className={styles.expiredMetaBox}>
                    <span className={styles.expiredMetaLabel}>
                      Profil wygasł
                    </span>
                    <span className={styles.expiredMetaValue}>
                      {formatDatePl(profile.expires_at)}
                    </span>
                  </div>

                  <div className={styles.expiredMetaBox}>
                    <span className={styles.expiredMetaLabel}>
                      Dane przechowujemy do
                    </span>
                    <span className={styles.expiredMetaValue}>
                      {formatDatePl(profile.grace_until)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/przedluz/${profile.slug}`}
                  className={`${styles.renewButton} ${styles.renewButtonExpired} ${styles.expiredRenewButton}`}
                >
                  <span className={styles.renewButtonMain}>Przedłuż profil</span>
                  <span className={styles.renewButtonMeta}>profil wygasł</span>
                  <span className={styles.renewButtonSubMeta}>
                    przywróć pełną zawartość przed {formatDatePl(profile.grace_until)}
                  </span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

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
                className={renewButtonClassName}
              >
                <span className={styles.renewButtonMain}>Przedłuż profil</span>
                <span className={styles.renewButtonMeta}>
                  {renewBadge.text}
                </span>
                <span className={styles.renewButtonSubMeta}>
                  {renewBadge.detail}
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}