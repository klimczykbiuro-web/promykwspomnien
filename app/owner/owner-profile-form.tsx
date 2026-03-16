"use client";

import { useState } from "react";
import styles from "./owner.module.css";

type Props = {
  initialHeroImageUrl: string | null;
  initialQuote: string | null;
  initialBiography: string | null;
};

export default function OwnerProfileForm({
  initialHeroImageUrl,
  initialQuote,
  initialBiography,
}: Props) {
  const [heroImageUrl, setHeroImageUrl] = useState(initialHeroImageUrl ?? "");
  const [quote, setQuote] = useState(initialQuote ?? "");
  const [biography, setBiography] = useState(initialBiography ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/owner/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heroImageUrl,
          quote,
          biography,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się zapisać zmian.");
      }

      setMessage(data?.message || "Zapisano zmiany.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się zapisać zmian."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.editorForm}>
      <div className={styles.editorField}>
        <label htmlFor="heroImageUrl" className={styles.editorLabel}>
          Zdjęcie profilowe
        </label>
        <input
          id="heroImageUrl"
          type="text"
          className={`input ${styles.editorInput}`}
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className={styles.editorHint}>
          Wklej pełny adres zdjęcia. Najlepiej sprawdzają się spokojne, pionowe
          fotografie.
        </p>
        {heroImageUrl.trim() ? (
          <a
            href={heroImageUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.editorLink}
          >
            Otwórz zdjęcie w nowej karcie
          </a>
        ) : null}
      </div>

      <div className={styles.editorField}>
        <label htmlFor="quote" className={styles.editorLabel}>
          Cytat
        </label>
        <textarea
          id="quote"
          className={`textarea ${styles.editorTextareaShort}`}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Np. Pozostaje po nas dobro, które daliśmy innym."
        />
        <p className={styles.editorHint}>
          Krótkie zdanie lub myśl, która będzie widoczna pod imieniem i nazwiskiem.
        </p>
      </div>

      <div className={styles.editorField}>
        <label htmlFor="biography" className={styles.editorLabel}>
          Wspomnienie
        </label>
        <textarea
          id="biography"
          className={`textarea ${styles.editorTextareaLong}`}
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          placeholder={`Maria była osobą ciepłą, spokojną i zawsze gotową nieść pomoc innym.

Bliscy zapamiętają ją jako osobę pełną dobroci, życzliwości i serdeczności.

Pozostawiła po sobie miłość, wdzięczność i wspomnienia, które zostaną z nami na zawsze.`}
        />
        <p className={styles.editorHint}>
          Najlepiej pisać krótszymi akapitami. Dzięki temu wspomnienie będzie
          czytelniejsze na telefonie i komputerze.
        </p>
      </div>

      {message ? <p className={styles.editorSuccess}>{message}</p> : null}
      {error ? <p className={styles.editorError}>{error}</p> : null}

      <div className={styles.editorActions}>
        <button
          type="submit"
          className={styles.editorSubmit}
          disabled={isSaving}
        >
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}