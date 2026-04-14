import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import {
  getOwnerDashboard,
  getOwnerSessionByToken,
} from "@/lib/owner/repository";
import { getOwnerGuestbookDashboard } from "@/lib/owner/guestbook";
import ExtendProfileForm from "./extend-profile-form";
import OwnerProfileForm from "./owner-profile-form";
import OwnerGuestbookManager from "./owner-guestbook-manager";
import styles from "./owner.module.css";

function formatDate(dateString: string | null) {
  if (!dateString) return "—";

  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export default async function OwnerDashboardPage() {
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(OWNER_SESSION_COOKIE)?.value;

  if (!rawSessionToken) {
    redirect("/owner/login");
  }

  const session = await getOwnerSessionByToken(rawSessionToken);

  if (!session) {
    redirect("/owner/login");
  }

  const [dashboard, guestbookDashboard] = await Promise.all([
    getOwnerDashboard(session.profile_id),
    getOwnerGuestbookDashboard(session.profile_id),
  ]);

  if (!dashboard || !guestbookDashboard) {
    redirect("/owner/login");
  }

  const expiresAtLabel = formatDate(dashboard.profile.expires_at);
  const claimedAtLabel = formatDate(dashboard.profile.owner_claimed_at);

  const gallerySlots = Array.from({ length: 10 }, (_, index) => {
    const found = dashboard.galleryImages.find(
      (image) => image.sort_order === index + 1
    );
    return found?.image_url ?? "";
  });

  return (
    <main className={styles.wrapper}>
      <div className="container">
        <div className={styles.stack}>
          <section className={styles.heroCard}>
            <p className={styles.heroLabel}>Najważniejsze</p>

            <div className={styles.heroRow}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  Profil aktywny do {expiresAtLabel}
                </h1>

                <p className={styles.heroDescription}>
                  Tutaj możesz szybko sprawdzić do kiedy profil jest aktywny i w
                  razie potrzeby przedłużyć go na kolejny okres.
                </p>
              </div>

              <Link href="#przedluzenia" className="button">
                Przedłuż profil
              </Link>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.topRow}>
              <div>
                <p className={styles.eyebrow}>Panel właściciela</p>
                <h2 className={styles.name}>{dashboard.profile.full_name}</h2>

                <p className={styles.meta}>Slug: {dashboard.profile.slug}</p>
                <p className={styles.meta}>Ważny do: {expiresAtLabel}</p>
                <p className={styles.metaCompact}>
                  Dostęp aktywowany: {claimedAtLabel}
                </p>
              </div>

              <form action="/api/owner/logout" method="post">
                <button type="submit" className="button outline">
                  Wyloguj się
                </button>
              </form>
            </div>
          </section>

          <section className={styles.card}>
            <p className={styles.sectionLabel}>Edycja</p>
            <h2 className={styles.sectionTitle}>Edytuj profil</h2>
            <p className={styles.sectionIntro}>
              Tutaj zmienisz zdjęcie główne, cytat, wspomnienie i galerię zdjęć
              widoczną na publicznym profilu.
            </p>

            <div className={styles.formWrap}>
              <OwnerProfileForm
                initialHeroImageUrl={dashboard.profile.hero_image_url}
                initialQuote={dashboard.profile.quote}
                initialBiography={dashboard.profile.biography}
                initialGalleryImages={gallerySlots}
                initialBirthDate={dashboard.profile.birth_date}
                initialDeathDate={dashboard.profile.death_date}
              />
            </div>
          </section>

          <section className={styles.card}>
            <p className={styles.sectionLabel}>Księga gości</p>
            <h2 className={styles.sectionTitle}>Zarządzaj wpisami</h2>
            <p className={styles.sectionIntro}>
              Tutaj możesz wyłączyć całą księgę gości, ponownie ją włączyć,
              poprawiać wpisy albo je usuwać.
            </p>

            <div className={styles.formWrap}>
              <OwnerGuestbookManager
                initialEnabled={guestbookDashboard.guestbookEnabled}
                initialEntries={guestbookDashboard.entries}
              />
            </div>
          </section>

          <section id="przedluzenia" className={styles.card}>
            <p className={styles.sectionLabel}>Przedłużenie</p>
            <h2 className={styles.sectionTitle}>Przedłuż profil</h2>

            <div className={styles.formWrap}>
              <ExtendProfileForm slug={dashboard.profile.slug} />
            </div>
          </section>

          <div className={styles.historyGrid}>
            <section className={styles.card}>
              <p className={styles.sectionLabel}>Historia przedłużeń</p>
              <h2 className={styles.sectionTitle}>Ostatnie 10</h2>

              <div className={styles.list}>
                {dashboard.extensions.length === 0 ? (
                  <div className={styles.empty}>Brak historii przedłużeń.</div>
                ) : (
                  dashboard.extensions.map((extension) => (
                    <article key={extension.id} className={styles.item}>
                      <div className={styles.itemHeader}>
                        <strong className={styles.itemStrong}>
                          +{extension.years_added} rok/lata
                        </strong>
                        <span className={styles.itemDate}>
                          {formatDate(extension.created_at)}
                        </span>
                      </div>

                      <p className={styles.itemText}>
                        Poprzednio:{" "}
                        {formatDate(extension.previous_expires_at)}
                      </p>
                      <p className={styles.itemText}>
                        Nowa data: {formatDate(extension.new_expires_at)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className={styles.card}>
              <p className={styles.sectionLabel}>Płatności</p>
              <h2 className={styles.sectionTitle}>Ostatnie 10</h2>

              <div className={styles.list}>
                {dashboard.payments.length === 0 ? (
                  <div className={styles.empty}>Brak płatności.</div>
                ) : (
                  dashboard.payments.map((payment) => (
                    <article key={payment.id} className={styles.item}>
                      <div className={styles.itemHeader}>
                        <strong className={styles.itemStrong}>
                          {payment.status}
                        </strong>
                        <span className={styles.itemDate}>
                          {formatDate(payment.created_at)}
                        </span>
                      </div>

                      <p className={styles.itemText}>
                        {payment.amount / 100}{" "}
                        {payment.currency.toUpperCase()} · {payment.years_to_add}{" "}
                        rok/lata
                      </p>
                      <p className={styles.itemMuted}>
                        Provider: {payment.provider}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}