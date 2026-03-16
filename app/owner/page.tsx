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
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-16 text-stone-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-800">
            Najważniejsze
          </p>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Profil aktywny do {expiresAtLabel}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
                To najważniejsza informacja w panelu właściciela. Gdy termin będzie
                się zbliżał, tutaj od razu będzie widać do kiedy profil jest aktywny
                i gdzie kliknąć, żeby go przedłużyć.
              </p>
            </div>

            <Link
              href="#przedluzenia"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Przedłuż profil
            </Link>
          </div>
        </section>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-stone-500">Panel właściciela</p>
              <h2 className="mt-2 text-3xl font-semibold">
                {dashboard.profile.full_name}
              </h2>
              <p className="mt-2 text-stone-600">Slug: {dashboard.profile.slug}</p>
              <p className="mt-2 text-stone-600">Ważny do: {expiresAtLabel}</p>
              <p className="mt-1 text-stone-600">
                Dostęp aktywowany: {claimedAtLabel}
              </p>
            </div>

            <form action="/api/owner/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-stone-300 px-4 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
              >
                Wyloguj się
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section
            id="przedluzenia"
            className="rounded-[32px] bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-stone-500">Przedłużenia</p>
            <h2 className="mt-1 text-2xl font-semibold">Ostatnie 10</h2>

            <div className="mt-6 space-y-3">
              {dashboard.extensions.length === 0 ? (
                <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Brak historii przedłużeń.
                </div>
              ) : (
                dashboard.extensions.map((extension) => (
                  <article key={extension.id} className="rounded-2xl bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-stone-900">
                        +{extension.years_added} rok/lata
                      </strong>
                      <span className="text-xs text-stone-500">
                        {formatDate(extension.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">
                      Poprzednio: {formatDate(extension.previous_expires_at)}
                    </p>
                    <p className="mt-1 text-sm text-stone-700">
                      Nowa data: {formatDate(extension.new_expires_at)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">Płatności</p>
            <h2 className="mt-1 text-2xl font-semibold">Ostatnie 10</h2>

            <div className="mt-6 space-y-3">
              {dashboard.payments.length === 0 ? (
                <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Brak płatności.
                </div>
              ) : (
                dashboard.payments.map((payment) => (
                  <article key={payment.id} className="rounded-2xl bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <strong className="text-stone-900">{payment.status}</strong>
                      <span className="text-xs text-stone-500">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700">
                      {payment.amount / 100} {payment.currency.toUpperCase()} ·{" "}
                      {payment.years_to_add} rok/lata
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
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
  );
}