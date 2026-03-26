import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getAdminStats,
  getModerationReports,
  type ModerationReportRow,
} from "@/lib/admin/repository";
import ReportActions from "./report-actions";
import styles from "./admin.module.css";

function formatMoney(gross: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(gross / 100);
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>{value}</p>
      {hint ? <p className={styles.cardHint}>{hint}</p> : null}
    </div>
  );
}

function reasonLabel(reason: string) {
  switch (reason) {
    case "privacy":
      return "Prywatność / wizerunek";
    case "living_person":
      return "Osoba żyjąca bez zgody";
    case "offensive":
      return "Treść obraźliwa";
    case "illegal":
      return "Podejrzenie treści nielegalnej";
    default:
      return "Inne";
  }
}

function statusBadgeClass(status: string) {
  if (status === "new" || status === "reported" || status === "in_review") {
    return styles.badgeNew;
  }

  return styles.badgeResolved;
}

function priorityBadgeClass(priority: string) {
  if (priority === "high" || priority === "critical") {
    return styles.badgeHigh;
  }

  return styles.badgeNormal;
}

function statusLabel(status: string) {
  switch (status) {
    case "new":
      return "Nowe";
    case "reported":
      return "Zgłoszone";
    case "in_review":
      return "W trakcie";
    case "resolved_keep":
      return "Zostawiono";
    case "resolved_restore":
      return "Przywrócono";
    case "resolved_remove":
      return "Usunięto";
    default:
      return status;
  }
}

function moderationLabel(value: string | null) {
  switch (value) {
    case "active":
      return "Aktywne";
    case "hidden_pending_review":
      return "Ukryte";
    case "removed":
      return "Usunięte";
    case "reported":
      return "Zgłoszone";
    default:
      return value ?? "—";
  }
}

function ModerationRow({ report }: { report: ModerationReportRow }) {
  return (
    <tr>
      <td>
        <div className={styles.reportMain}>
          <span className={styles.reportTitle}>
            {report.profile_full_name || report.profile_slug || "Nieznany profil"}
          </span>
          <span className={styles.reportMeta}>
            slug: {report.profile_slug || "—"}
          </span>
          <span className={styles.reportMeta}>{formatDate(report.created_at)}</span>
        </div>
      </td>

      <td>
        <span className={styles.reasonText}>{reasonLabel(report.report_reason)}</span>
      </td>

      <td>
        <span className={`${styles.badge} ${priorityBadgeClass(report.priority)}`}>
          {report.priority === "high" || report.priority === "critical"
            ? "Pilne"
            : "Standard"}
        </span>
      </td>

      <td>
        <span className={`${styles.badge} ${statusBadgeClass(report.status)}`}>
          {statusLabel(report.status)}
        </span>
      </td>

      <td>
        {report.image_url ? (
          <img
            src={report.image_url}
            alt="Zgłoszone zdjęcie"
            className={styles.imagePreview}
          />
        ) : (
          <div className={styles.imagePlaceholder}>Brak zdjęcia</div>
        )}
      </td>

      <td>
        <div className={styles.reportMeta}>
          <div>{report.profile_image_id || "zgłoszenie ogólne"}</div>
          <div className={styles.reportMeta}>
            status zdjęcia: {moderationLabel(report.moderation_status)}
          </div>
        </div>
      </td>

      <td>
        <div className={styles.descriptionBox}>
          {report.report_description || "Brak dodatkowego opisu."}
        </div>
      </td>

      <td>
        <div className={styles.email}>{report.reported_by_email || "brak"}</div>
      </td>

      <td>
        <ReportActions reportId={report.id} />
      </td>
    </tr>
  );
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const [stats, reports] = await Promise.all([
    getAdminStats(),
    getModerationReports(100),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerShell}>
          <div className={styles.headerBar} />

          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Panel administratora</p>
              <h1 className={styles.title}>Statystyki i moderacja</h1>
              <p className={styles.subtitle}>
                W tym miejscu masz szybki podgląd wzrostu projektu, płatności,
                przedłużeń, ruchu w serwisie oraz zgłoszeń zdjęć i treści.
              </p>

              <div className={styles.headerStats}>
                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Wszystkie profile</span>
                  <span className={styles.headerStatValue}>{stats.totalProfiles}</span>
                </div>

                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Nowe zgłoszenia</span>
                  <span className={styles.headerStatValue}>{stats.reportsNew}</span>
                </div>

                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Przychód 30 dni</span>
                  <span className={styles.headerStatValue}>
                    {formatMoney(stats.revenue30dGross)}
                  </span>
                </div>
              </div>
            </div>

            <form action="/api/admin/logout" method="post">
              <button type="submit" className={styles.logoutButton}>
                Wyloguj
              </button>
            </form>
          </header>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Najważniejsze liczby</h2>
                <p className={styles.sectionDescription}>
                  Tu widzisz najważniejsze wskaźniki: profile, przedłużenia,
                  przychód i ruch w serwisie.
                </p>
              </div>
            </div>

            <div className={styles.cardsGrid}>
              <Card label="Wszystkie profile" value={stats.totalProfiles} />
              <Card label="Nowe profile 7 dni" value={stats.newProfiles7d} />
              <Card label="Nowe profile 30 dni" value={stats.newProfiles30d} />
              <Card
                label="Profile z aktywnym właścicielem"
                value={stats.claimedProfiles}
              />

              <Card label="Profile wygasłe" value={stats.expiredProfiles} />
              <Card label="Przedłużenia 30 dni" value={stats.renewals30d} />
              <Card
                label="Przychód 30 dni"
                value={formatMoney(stats.revenue30dGross)}
              />
              <Card label="Nowe zgłoszenia" value={stats.reportsNew} />

              <Card label="Zgłoszenia pilne" value={stats.reportsHigh} />
              <Card label="Otwarcia profili dziś" value={stats.profileViewsToday} />
              <Card label="Otwarcia profili 7 dni" value={stats.profileViews7d} />
              <Card label="Otwarcia profili 30 dni" value={stats.profileViews30d} />

              <Card label="Otwarcia profili łącznie" value={stats.profileViewsAll} />
              <Card label="Strona główna dziś" value={stats.homeViewsToday} />
              <Card label="Strona główna 30 dni" value={stats.homeViews30d} />
              <Card label="Strona główna łącznie" value={stats.homeViewsAll} />

              <Card label="/pamiec dziś" value={stats.pamiecViewsToday} />
              <Card label="/pamiec 30 dni" value={stats.pamiecViews30d} />
              <Card label="/pamiec łącznie" value={stats.pamiecViewsAll} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Moderacja zgłoszeń</h2>
                <p className={styles.sectionDescription}>
                  W tej tabeli możesz szybko ocenić zgłoszenie i od razu podjąć
                  decyzję: zostawić, ukryć, przywrócić albo usunąć zdjęcie.
                </p>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Profil</th>
                      <th>Powód</th>
                      <th>Priorytet</th>
                      <th>Status zgłoszenia</th>
                      <th>Zdjęcie</th>
                      <th>ID / status zdjęcia</th>
                      <th>Opis</th>
                      <th>E-mail</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <ModerationRow key={report.id} report={report} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className={styles.emptyState}>
                          Brak zgłoszeń.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}