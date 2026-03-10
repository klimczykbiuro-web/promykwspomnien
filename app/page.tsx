import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f2ec] px-6 py-16 text-stone-900">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm text-stone-500">promykwspomnien.pl</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Cyfrowe profile pamięci dostępne po zeskanowaniu kodu QR.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 md:text-lg">
            Profil publiczny i księga gości działają już na żywo. Ta strona główna
            jest teraz uproszczona, żeby build produkcyjny nie zależał od
            usuniętych komponentów demo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/profile/maria-kowalska"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-6 text-white transition hover:bg-stone-800"
            >
              Zobacz działający profil
            </Link>

            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-stone-300 bg-white px-6 text-stone-900 transition hover:bg-stone-50"
            >
              Otwórz demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
