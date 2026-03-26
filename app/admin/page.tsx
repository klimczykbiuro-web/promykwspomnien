import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getAdminStats } from "@/lib/admin/repository";

function formatMoney(gross: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(gross / 100);
}

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const stats = await getAdminStats();

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Panel administratora</p>
            <h1 className="text-3xl font-semibold text-stone-950">
              Statystyki systemu
            </h1>
          </div>

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-900"
            >
              Wyloguj
            </button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card label="Wszystkie profile" value={stats.totalProfiles} />
          <Card label="Nowe profile 7 dni" value={stats.newProfiles7d} />
          <Card label="Nowe profile 30 dni" value={stats.newProfiles30d} />
          <Card label="Profile z aktywnym właścicielem" value={stats.claimedProfiles} />

          <Card label="Profile wygasłe" value={stats.expiredProfiles} />
          <Card label="Przedłużenia 30 dni" value={stats.renewals30d} />
          <Card label="Przychód 30 dni" value={formatMoney(stats.revenue30dGross)} />
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
    </main>
  );
}