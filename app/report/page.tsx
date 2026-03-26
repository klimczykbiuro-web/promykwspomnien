"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "../admin/admin.module.css";

const reasons = [
  { value: "privacy", label: "Naruszenie prywatności lub wizerunku" },
  { value: "living_person", label: "Zdjęcie osoby żyjącej bez zgody" },
  { value: "offensive", label: "Treść obraźliwa lub niegodna" },
  { value: "illegal", label: "Podejrzenie treści nielegalnej" },
  { value: "other", label: "Inne" },
];

export default function ReportPage() {
  const params = useSearchParams();
  const profileSlug = params.get("slug") || "";
  const profileImageId = params.get("imageId") || "";

  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportedByEmail, setReportedByEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileSlug,
          profileImageId: profileImageId || null,
          reportedByEmail,
          reportReason,
          reportDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się wysłać zgłoszenia.");

      setStatus("success");
      setReportReason("");
      setReportDescription("");
      setReportedByEmail("");
    } catch (error) {
      setStatus("error");
      setErrorText(error instanceof Error ? error.message : "Nie udało się wysłać zgłoszenia.");
    }
  }

  return (
    <main className={styles.reportPage}>
      <div className={styles.reportContainer}>
        <div className={styles.formCard}>
          <p className={styles.eyebrow}>Formularz zgłoszenia</p>
          <h1 className={styles.loginTitle}>Zgłoś zdjęcie lub treść</h1>
          <p className={styles.loginText}>
            Jeżeli uważasz, że zdjęcie lub treść narusza prawo, prywatność, wizerunek albo prawa osób trzecich,
            możesz przesłać zgłoszenie. Przy poważniejszych powodach zdjęcie może zostać tymczasowo ukryte do czasu weryfikacji.
          </p>

          <div className={styles.infoBox}>
            Profil: <strong>{profileSlug || "brak"}</strong>
            {profileImageId ? (
              <>
                <br />
                Zdjęcie: <span className={styles.mono}>{profileImageId}</span>
              </>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Powód zgłoszenia</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className={styles.select}
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

            <div className={styles.field}>
              <label className={styles.label}>Opis zgłoszenia</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Opisz, czego dotyczy zgłoszenie"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>E-mail kontaktowy</label>
              <input
                type="email"
                value={reportedByEmail}
                onChange={(e) => setReportedByEmail(e.target.value)}
                className={styles.input}
                placeholder="opcjonalnie"
              />
            </div>

            {status === "success" ? <div className={styles.successBox}>Zgłoszenie zostało wysłane.</div> : null}
            {status === "error" ? <div className={styles.errorBox}>{errorText}</div> : null}

            <div className={styles.formButtonRow}>
              <button type="submit" className={styles.primaryButton}>
                {status === "saving" ? "Wysyłanie..." : "Wyślij zgłoszenie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
