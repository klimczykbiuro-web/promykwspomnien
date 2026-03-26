"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const reasons = [
  { value: "privacy", label: "Naruszenie prywatności lub wizerunku" },
  { value: "living_person", label: "Zdjęcie osoby żyjącej bez zgody" },
  { value: "offensive", label: "Treść obraźliwa lub niegodna" },
  { value: "illegal", label: "Podejrzenie treści nielegalnej" },
  { value: "other", label: "Inne" },
] as const;

export default function ReportForm() {
  const searchParams = useSearchParams();

  const profileSlug = useMemo(() => searchParams.get("slug") || "", [searchParams]);
  const profileImageId = useMemo(
    () => searchParams.get("imageId") || "",
    [searchParams]
  );

  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportedByEmail, setReportedByEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileSlug,
          profileImageId: profileImageId || null,
          reportedByEmail,
          reportReason,
          reportDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się wysłać zgłoszenia.");
      }

      setStatus("success");
      setReportReason("");
      setReportDescription("");
      setReportedByEmail("");
    } catch (error) {
      setStatus("error");
      setErrorText(
        error instanceof Error ? error.message : "Nie udało się wysłać zgłoszenia."
      );
    }
  }

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm text-stone-500">Formularz zgłoszenia</p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-950">
        Zgłoś zdjęcie lub treść
      </h1>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        Jeżeli uważasz, że zdjęcie lub treść narusza prawo, prywatność,
        wizerunek albo prawa osób trzecich, możesz przesłać zgłoszenie.
      </p>

      <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <div>
          <strong>Profil:</strong>{" "}
          {profileSlug ? profileSlug : "nie podano"}
        </div>
        <div className="mt-1">
          <strong>ID zdjęcia:</strong>{" "}
          {profileImageId ? profileImageId : "zgłoszenie ogólne"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Powód zgłoszenia
          </label>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4"
            required
          >
            <option value="">Wybierz powód</option>
            {reasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Opis
          </label>
          <textarea
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="min-h-[140px] w-full rounded-2xl border border-stone-200 p-4"
            placeholder="Opisz, czego dotyczy zgłoszenie"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            E-mail kontaktowy
          </label>
          <input
            type="email"
            value={reportedByEmail}
            onChange={(e) => setReportedByEmail(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4"
            placeholder="opcjonalnie"
          />
        </div>

        {status === "success" ? (
          <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Zgłoszenie zostało wysłane.
          </p>
        ) : null}

        {status === "error" ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorText}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white"
        >
          {status === "saving" ? "Wysyłanie..." : "Wyślij zgłoszenie"}
        </button>
      </form>
    </div>
  );
}