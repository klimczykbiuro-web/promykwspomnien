import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_SESSION_COOKIE } from "@/lib/owner/auth";
import {
  getOwnerDashboard,
  getOwnerSessionByToken,
} from "@/lib/owner/repository";

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

  const dashboard = await getOwnerDashboard(session.profile_id);

  if (!dashboard) {
    redirect("/owner/login");
  }

  const expiresAtLabel = formatDate(dashboard.profile.expires_at);
  const claimedAtLabel = formatDate(dashboard.profile.owner_claimed_at);

  return (
    <main className="page">
      <div className="container">
        <div className="grid" style={{ gap: "24px" }}>
          <section
            className="card card-pad"
            style={{
              background: "#f6ead7",
              border: "1px solid #e7d5bb",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8a5a16",
              }}
            >
              Najważniejsze
            </p>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ maxWidth: 760 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 48,
                    lineHeight: 1.1,
                  }}
                >
                  Profil aktywny do {expiresAtLabel}
                </h1>

                <p
                  className="muted"
                  style={{
                    marginTop: 14,
                    fontSize: 20,
                    lineHeight: 1.6,
                  }}
                >
                  To najważniejsza informacja w panelu właściciela. Gdy termin
                  będzie się zbliżał, tutaj od razu będzie widać do kiedy profil
                  jest aktywny i gdzie kliknąć, żeby go przedłużyć.
                </p>
              </div>

              <Link href="#przedluzenia" className="button">
                Przedłuż profil
              </Link>
            </div>
          </section>

          <section className="card card-pad">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  className="muted"
                  style={{ margin: 0, fontSize: 14 }}
                >
                  Panel właściciela
                </p>

                <h2
                  style={{
                    marginTop: 12,
                    marginBottom: 0,
                    fontSize: 40,
                    lineHeight: 1.15,
                  }}
                >
                  {dashboard.profile.full_name}
                </h2>

                <p style={{ marginTop: 18, marginBottom: 0, fontSize: 18 }}>
                  Slug: {dashboard.profile.slug}
                </p>
                <p style={{ marginTop: 14, marginBottom: 0, fontSize: 18 }}>
                  Ważny do: {expiresAtLabel}
                </p>
                <p style={{ marginTop: 10, marginBottom: 0, fontSize: 18 }}>
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

          <div className="grid grid-2">
            <section id="przedluzenia" className="card card-pad">
              <p className="muted" style={{ marginTop: 0, marginBottom: 6 }}>
                Przedłużenia
              </p>
              <h2 style={{ marginTop: 0, fontSize: 36 }}>Ostatnie 10</h2>

              <div className="grid" style={{ gap: 14, marginTop: 22 }}>
                {dashboard.extensions.length === 0 ? (
                  <div className="kpi">
                    <span className="muted">Brak historii przedłużeń.</span>
                  </div>
                ) : (
                  dashboard.extensions.map((extension) => (
                    <article key={extension.id} className="kpi">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <strong style={{ fontSize: 18 }}>
                          +{extension.years_added} rok/lata
                        </strong>
                        <span className="muted" style={{ fontSize: 13 }}>
                          {formatDate(extension.created_at)}
                        </span>
                      </div>

                      <p style={{ marginTop: 14, marginBottom: 0 }}>
                        Poprzednio: {formatDate(extension.previous_expires_at)}
                      </p>
                      <p style={{ marginTop: 10, marginBottom: 0 }}>
                        Nowa data: {formatDate(extension.new_expires_at)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="card card-pad">
              <p className="muted" style={{ marginTop: 0, marginBottom: 6 }}>
                Płatności
              </p>
              <h2 style={{ marginTop: 0, fontSize: 36 }}>Ostatnie 10</h2>

              <div className="grid" style={{ gap: 14, marginTop: 22 }}>
                {dashboard.payments.length === 0 ? (
                  <div className="kpi">
                    <span className="muted">Brak płatności.</span>
                  </div>
                ) : (
                  dashboard.payments.map((payment) => (
                    <article key={payment.id} className="kpi">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          alignItems: "center",
                        }}
                      >
                        <strong style={{ fontSize: 18 }}>
                          {payment.status}
                        </strong>
                        <span className="muted" style={{ fontSize: 13 }}>
                          {formatDate(payment.created_at)}
                        </span>
                      </div>

                      <p style={{ marginTop: 14, marginBottom: 0 }}>
                        {payment.amount / 100}{" "}
                        {payment.currency.toUpperCase()} · {payment.years_to_add}{" "}
                        rok/lata
                      </p>
                      <p
                        className="muted"
                        style={{ marginTop: 10, marginBottom: 0, fontSize: 14 }}
                      >
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