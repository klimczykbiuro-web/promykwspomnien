import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminStats, getLatestReports, type ReportRow } from "@/lib/admin/repository";
import styles from "./admin.module.css";

function formatMoney(gross: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(gross / 100);
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
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
    case "other":
      return "Inne";
    default:
      return reason;
  }
}

function priorityClass(priority: string) {
  if (priority === "high" || priority === "critical") return styles.badgeRed;
  return styles.badgeBlue;
}

function moderationBadge(status: string | null) {
  if (!status) return { className: styles.badge, label: "Brak" };
  if (status === "active") return { className: styles.badgeGreen, label: "Aktywne" };
  if (status === "hidden_pending_review") return { className: styles.badgeAmber, label: "Ukryte" };
  if (status === "removed") return { className: styles.badgeRed, label: "Usunięte" };
  if (status === "reported") return { className: styles.badgeBlue, label: "Zgłoszone" };
  return { className: styles.badge, label: status };
}

function StatCard({ label, value, meta }: { label: string; value: string | number; meta?: string }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {meta ? <p className={styles.statMeta}>{meta}</p> : null}
    </div>
  );
}

function ReportActions({ report }: { report: ReportRow }) {
  return (
    <div className={styles.actionGroup}>
      <form className={styles.inlineForm} action={`/api/admin/reports/${report.id}`} method="post">
        <input type="hidden" name="json" value="1" />
        <button className={styles.secondaryButton} formAction={`/api/admin/reports/${report.id}`} formMethod="post" name="action" value="keep" type="submit">Zostaw</button>
      </form>
      <form className={styles.inlineForm} action={`/api/admin/reports/${report.id}`} method="post">
        <button className={styles.mutedButton} formAction={`/api/admin/reports/${report.id}`} formMethod="post" name="action" value="hide" type="submit">Ukryj</button>
      </form>
      <form className={styles.inlineForm} action={`/api/admin/reports/${report.id}`} method="post">
        <button className={styles.primaryButton} formAction={`/api/admin/reports/${report.id}`} formMethod="post" name="action" value="restore" type="submit">Przywróć</button>
      </form>
      <form className={styles.inlineForm} action={`/api/admin/reports/${report.id}`} method="post">
        <button className={styles.dangerButton} formAction={`/api/admin/reports/${report.id}`} formMethod="post" name="action" value="remove" type="submit">Usuń</button>
      </form>
    </div>
  );
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin/login");

  const [stats, reports] = await Promise.all([getAdminStats(), getLatestReports(50)]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administratora</p>
            <h1 className={styles.title}>Statystyki i moderacja</h1>
            <p className={styles.subtitle}>
              Jedno miejsce do pilnowania ruchu, nowych profili, przedłużeń i zgłoszonych zdjęć.
              Najważniejsze liczby są na górze, a niżej masz czytelną tabelę do ukrywania i usuwania treści.
            </p>
          </div>

          <div className={styles.headerActions}>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className={styles.logoutButton}>Wyloguj</button>
            </form>
          </div>
        </div>

        <div className={styles.summaryPanel}>
          <section className={styles.heroCard}>
            <p className={styles.eyebrow}>Przegląd systemu</p>
            <h2 className={styles.noticeTitle} style={{ color: "#fff" }}>Najważniejsze liczby na dziś</h2>
            <div className={styles.heroGrid}>
              <div className={styles.heroStat}>
                <p className={styles.heroLabel}>Otwarcia profili dziś</p>
                <p className={styles.heroValue}>{stats.profileViewsToday}</p>
                <p className={styles.heroHint}>Ruch na profilach pamięci</p>
              </div>
              <div className={styles.heroStat}>
                <p className={styles.heroLabel}>Nowe profile 30 dni</p>
                <p className={styles.heroValue}>{stats.newProfiles30d}</p>
                <p className={styles.heroHint}>Nowo utworzone profile</p>
              </div>
              <div className={styles.heroStat}>
                <p className={styles.heroLabel}>Przychód 30 dni</p>
                <p className={styles.heroValue}>{formatMoney(stats.revenue30dGross)}</p>
                <p className={styles.heroHint}>Opłacone płatności</p>
              </div>
            </div>
          </section>

          <div className={styles.sidePanel}>
            <section className={styles.noticeCard}>
              <h2 className={styles.noticeTitle}>Moderacja zdjęć</h2>
              <p className={styles.noticeText}>
                Gdy zgłoszenie wygląda poważnie, zdjęcie możesz od razu ukryć. Przy zwykłym sporze zostawiasz ślad,
                a decyzję podejmujesz z poziomu tabeli niżej.
              </p>
              <div className={styles.badgeRow}>
                <span className={styles.badgeGreen}>Aktywne {reports.filter((r) => r.moderation_status === "active").length}</span>
                <span className={styles.badgeAmber}>Ukryte {reports.filter((r) => r.moderation_status === "hidden_pending_review").length}</span>
                <span className={styles.badgeRed}>Pilne {stats.reportsHigh}</span>
              </div>
            </section>

            <section className={styles.quickCard}>
              <h2 className={styles.quickTitle}>Szybki obraz sytuacji</h2>
              <p className={styles.quickText}>Właściciele aktywowali już {stats.claimedProfiles} profili, a wygasłych jest {stats.expiredProfiles}.</p>
              <div className={styles.badgeRow}>
                <span className={styles.badgeBlue}>Nowe zgłoszenia {stats.reportsNew}</span>
                <span className={styles.badge}>Przedłużenia 30 dni {stats.renewals30d}</span>
              </div>
            </section>
          </div>
        </div>

        <section className={styles.cardsGrid}>
          <StatCard label="Wszystkie profile" value={stats.totalProfiles} />
          <StatCard label="Nowe profile 7 dni" value={stats.newProfiles7d} />
          <StatCard label="Nowe profile 30 dni" value={stats.newProfiles30d} />
          <StatCard label="Profile z aktywnym właścicielem" value={stats.claimedProfiles} />
          <StatCard label="Profile wygasłe" value={stats.expiredProfiles} />
          <StatCard label="Przedłużenia 30 dni" value={stats.renewals30d} />
          <StatCard label="Przychód 30 dni" value={formatMoney(stats.revenue30dGross)} />
          <StatCard label="Nowe zgłoszenia" value={stats.reportsNew} />
          <StatCard label="Zgłoszenia pilne" value={stats.reportsHigh} />
          <StatCard label="Otwarcia profili dziś" value={stats.profileViewsToday} />
          <StatCard label="Otwarcia profili 7 dni" value={stats.profileViews7d} />
          <StatCard label="Otwarcia profili 30 dni" value={stats.profileViews30d} />
          <StatCard label="Otwarcia profili łącznie" value={stats.profileViewsAll} />
          <StatCard label="Strona główna dziś" value={stats.homeViewsToday} />
          <StatCard label="Strona główna 30 dni" value={stats.homeViews30d} />
          <StatCard label="Strona główna łącznie" value={stats.homeViewsAll} />
          <StatCard label="/pamiec dziś" value={stats.pamiecViewsToday} />
          <StatCard label="/pamiec 30 dni" value={stats.pamiecViews30d} />
          <StatCard label="/pamiec łącznie" value={stats.pamiecViewsAll} />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Moderacja</p>
              <h2 className={styles.sectionTitle}>Zgłoszone zdjęcia i treści</h2>
              <p className={styles.sectionText}>
                Tu masz wszystkie zgłoszenia w jednej tabeli. Możesz szybko zobaczyć powód, status zdjęcia i od razu wykonać akcję.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.quickTitle}>Brak zgłoszeń</h3>
              <p className={styles.emptyText}>Na ten moment nie ma żadnych zgłoszonych zdjęć ani treści. Gdy pojawią się nowe, zobaczysz je tutaj.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Profil</th>
                    <th>Powód</th>
                    <th>Status</th>
                    <th>Priorytet</th>
                    <th>E-mail</th>
                    <th>Opis</th>
                    <th>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const badge = moderationBadge(report.moderation_status);
                    return (
                      <tr key={report.id}>
                        <td className={styles.mono}>{formatDate(report.created_at)}</td>
                        <td>
                          <div className={styles.mono}>{report.profile_slug || "—"}</div>
                          <div className={styles.smallMuted}>{report.profile_image_id ? `Zdjęcie: ${report.profile_image_id}` : "Zgłoszenie ogólne"}</div>
                        </td>
                        <td>{reasonLabel(report.report_reason)}</td>
                        <td>
                          <span className={badge.className}>{badge.label}</span>
                        </td>
                        <td>
                          <span className={priorityClass(report.priority)}>{report.priority === "high" || report.priority === "critical" ? "Wysoki" : "Normalny"}</span>
                        </td>
                        <td>{report.reported_by_email ? <span className={styles.email}>{report.reported_by_email}</span> : "—"}</td>
                        <td>{report.report_description || "—"}</td>
                        <td>
                          <ReportActions report={report} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
