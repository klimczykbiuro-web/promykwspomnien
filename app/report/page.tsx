import { Suspense } from "react";
import ReportForm from "./report-form";

export const metadata = {
  title: "Zgłoś zdjęcie lub treść | Promyk Wspomnień",
  description: "Formularz zgłoszenia zdjęcia lub treści.",
};

function LoadingCard() {
  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm text-stone-500">Formularz zgłoszenia</p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-950">
        Zgłoś zdjęcie lub treść
      </h1>
      <p className="mt-4 text-sm leading-7 text-stone-700">
        Ładowanie formularza…
      </p>
    </div>
  );
}

export default function ReportPage() {
  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <Suspense fallback={<LoadingCard />}>
          <ReportForm />
        </Suspense>
      </div>
    </main>
  );
}