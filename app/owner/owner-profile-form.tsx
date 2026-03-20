"use client";

import { useMemo, useState } from "react";
import styles from "./owner.module.css";

type Props = {
  initialHeroImageUrl: string | null;
  initialQuote: string | null;
  initialBiography: string | null;
  initialGalleryImages: string[];
};

function createGallerySlots(images: string[]) {
  return Array.from({ length: 10 }, (_, index) => images[index] ?? "");
}

export default function OwnerProfileForm({
  initialHeroImageUrl,
  initialQuote,
  initialBiography,
  initialGalleryImages,
}: Props) {
  const [heroImageUrl, setHeroImageUrl] = useState(initialHeroImageUrl ?? "");
  const [quote, setQuote] = useState(initialQuote ?? "");
  const [biography, setBiography] = useState(initialBiography ?? "");
  const [galleryImages, setGalleryImages] = useState(
    createGallerySlots(initialGalleryImages)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filledGalleryCount = useMemo(
    () => galleryImages.filter((item) => item.trim() !== "").length,
    [galleryImages]
  );

  function updateGalleryImage(index: number, value: string) {
    setGalleryImages((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

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
          galleryImages,
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
      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <h3 className={styles.editorSectionTitle}>Zdjęcie główne</h3>
            <p className={styles.editorSectionText}>
              To zdjęcie będzie widoczne na górze publicznego profilu.
            </p>
          </div>
        </div>

        <div className={styles.editorHeroGrid}>
          <div className={styles.editorField}>
            <label htmlFor="heroImageUrl" className={styles.editorLabel}>
              Adres zdjęcia
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
              Najlepiej sprawdzają się spokojne, pionowe fotografie.
            </p>
          </div>

          <div>
            {heroImageUrl.trim() ? (
              <div className={styles.heroPreviewWrap}>
                <img
                  src={heroImageUrl}
                  alt="Podgląd zdjęcia głównego"
                  className={styles.heroPreviewImage}
                />
              </div>
            ) : (
              <div className={styles.heroPreviewEmpty}>
                Tu pojawi się podgląd zdjęcia głównego.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <h3 className={styles.editorSectionTitle}>Cytat</h3>
            <p className={styles.editorSectionText}>
              Krótkie zdanie lub myśl widoczna pod imieniem i nazwiskiem.
            </p>
          </div>
        </div>

        <div className={styles.editorField}>
          <textarea
            id="quote"
            className={`textarea ${styles.editorTextareaShort}`}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Np. Pozostaje po nas dobro, które daliśmy innym."
          />
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <h3 className={styles.editorSectionTitle}>Wspomnienie</h3>
            <p className={styles.editorSectionText}>
              Najlepiej pisać krótszymi akapitami. Dzięki temu tekst będzie
              czytelniejszy na telefonie i komputerze.
            </p>
          </div>
        </div>

        <div className={styles.editorField}>
          <textarea
            id="biography"
            className={`textarea ${styles.editorTextareaLong}`}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder={`Maria była osobą ciepłą, spokojną i zawsze gotową nieść pomoc innym.

Bliscy zapamiętają ją jako osobę pełną dobroci, życzliwości i serdeczności.

Pozostawiła po sobie miłość, wdzięczność i wspomnienia, które zostaną z nami na zawsze.`}
          />
        </div>
      </section>

      <section className={styles.editorSection}>
        <div className={styles.editorSectionHeader}>
          <div>
            <h3 className={styles.editorSectionTitle}>Galeria zdjęć</h3>
            <p className={styles.editorSectionText}>
              Możesz dodać do 10 zdjęć, które pojawią się pod wspomnieniem na
              publicznym profilu.
            </p>
          </div>

          <div className={styles.galleryCountBadge}>
            {filledGalleryCount}/10 zdjęć
          </div>
        </div>

        <div className={styles.galleryEditorGrid}>
          {galleryImages.map((value, index) => (
            <div key={index} className={styles.galleryEditorCard}>
              <div className={styles.galleryEditorCardHeader}>
                <strong className={styles.galleryEditorCardTitle}>
                  Zdjęcie {index + 1}
                </strong>
                {value.trim() ? (
                  <span className={styles.galleryEditorCardStateFilled}>
                    Dodane
                  </span>
                ) : (
                  <span className={styles.galleryEditorCardStateEmpty}>
                    Puste
                  </span>
                )}
              </div>

              <input
                id={`gallery-${index}`}
                type="text"
                className={`input ${styles.editorInput}`}
                value={value}
                onChange={(e) => updateGalleryImage(index, e.target.value)}
                placeholder="https://..."
              />

              {value.trim() ? (
                <div className={styles.galleryPreviewWrap}>
                  <img
                    src={value}
                    alt={`Podgląd zdjęcia ${index + 1}`}
                    className={styles.galleryPreviewImage}
                  />
                </div>
              ) : (
                <div className={styles.galleryPreviewEmpty}>Brak zdjęcia</div>
              )}
            </div>
          ))}
        </div>
      </section>

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