"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./owner.module.css";

type Props = {
  initialHeroImageUrl: string | null;
  initialQuote: string | null;
  initialBiography: string | null;
  initialGalleryImages: string[];
};

type UploadKind = "hero" | "gallery";

function createGallerySlots(images: string[]) {
  return Array.from({ length: 10 }, (_, index) => images[index] ?? "");
}

function isAllowedFile(file: File) {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  );
}

async function uploadFileToR2(input: {
  kind: UploadKind;
  file: File;
}) {
  const signResponse = await fetch("/api/uploads/r2/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: input.kind,
      fileName: input.file.name,
      contentType: input.file.type,
      fileSize: input.file.size,
    }),
  });

  const signData = (await signResponse.json()) as {
    ok?: boolean;
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
  };

  if (!signResponse.ok || !signData.uploadUrl || !signData.publicUrl) {
    throw new Error(signData.error || "Nie udało się przygotować uploadu.");
  }

  const uploadResponse = await fetch(signData.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": input.file.type,
    },
    body: input.file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Nie udało się wgrać pliku do storage.");
  }

  return signData.publicUrl;
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
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<
    number | null
  >(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRefs = useRef<Array<HTMLInputElement | null>>([]);

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

  function clearGalleryImage(index: number) {
    updateGalleryImage(index, "");
  }

  async function handleHeroFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (!isAllowedFile(file)) {
      setError("Dozwolone są tylko pliki JPG, PNG i WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Maksymalny rozmiar zdjęcia to 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploadingHero(true);
      const publicUrl = await uploadFileToR2({
        kind: "hero",
        file,
      });

      setHeroImageUrl(publicUrl);
      setMessage("Zdjęcie główne zostało wgrane. Kliknij „Zapisz zmiany”.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia."
      );
    } finally {
      setIsUploadingHero(false);
      event.target.value = "";
    }
  }

  async function handleGalleryFileChange(
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (!isAllowedFile(file)) {
      setError("Dozwolone są tylko pliki JPG, PNG i WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Maksymalny rozmiar zdjęcia to 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingGalleryIndex(index);

      const publicUrl = await uploadFileToR2({
        kind: "gallery",
        file,
      });

      updateGalleryImage(index, publicUrl);
      setMessage("Zdjęcie galerii zostało wgrane. Kliknij „Zapisz zmiany”.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia."
      );
    } finally {
      setUploadingGalleryIndex(null);
      event.target.value = "";
    }
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
              Wybierz zdjęcie z telefonu lub komputera. Obsługiwane formaty:
              JPG, PNG, WEBP. Maksymalnie 10 MB.
            </p>
          </div>
        </div>

        <div className={styles.editorHeroGrid}>
          <div className={styles.editorField}>
            <label className={styles.editorLabel}>Plik zdjęcia</label>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={isUploadingHero || isSaving}
              >
                {isUploadingHero ? "Wgrywanie..." : "Wybierz zdjęcie"}
              </button>

              <button
                type="button"
                className="button outline"
                onClick={() => setHeroImageUrl("")}
                disabled={isUploadingHero || isSaving || !heroImageUrl.trim()}
              >
                Usuń zdjęcie
              </button>
            </div>

            <input
              ref={heroInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleHeroFileChange}
              style={{ display: "none" }}
            />

            <p className={styles.editorHint}>
              Po wgraniu kliknij „Zapisz zmiany”, aby zapisać zdjęcie w profilu.
            </p>

            {heroImageUrl.trim() ? (
              <div
                style={{
                  marginTop: 8,
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: "#fff",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "var(--muted)",
                  wordBreak: "break-all",
                }}
              >
                URL w storage: {heroImageUrl}
              </div>
            ) : null}
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
          {galleryImages.map((value, index) => {
            const isUploading = uploadingGalleryIndex === index;

            return (
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

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    className="button"
                    disabled={isUploading || isSaving}
                    onClick={() => galleryInputRefs.current[index]?.click()}
                  >
                    {isUploading ? "Wgrywanie..." : "Wybierz plik"}
                  </button>

                  <button
                    type="button"
                    className="button outline"
                    disabled={isUploading || isSaving || !value.trim()}
                    onClick={() => clearGalleryImage(index)}
                  >
                    Usuń
                  </button>
                </div>

                <input
                  ref={(element) => {
                    galleryInputRefs.current[index] = element;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleGalleryFileChange(index, event)}
                  style={{ display: "none" }}
                />

                {value.trim() ? (
                  <>
                    <div className={styles.galleryPreviewWrap}>
                      <img
                        src={value}
                        alt={`Podgląd zdjęcia ${index + 1}`}
                        className={styles.galleryPreviewImage}
                      />
                    </div>

                    <div
                      style={{
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "#fff",
                        padding: "8px 10px",
                        fontSize: 12,
                        color: "var(--muted)",
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </div>
                  </>
                ) : (
                  <div className={styles.galleryPreviewEmpty}>Brak zdjęcia</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {message ? <p className={styles.editorSuccess}>{message}</p> : null}
      {error ? <p className={styles.editorError}>{error}</p> : null}

      <div className={styles.editorActions}>
        <button
          type="submit"
          className={styles.editorSubmit}
          disabled={isSaving || isUploadingHero || uploadingGalleryIndex !== null}
        >
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  );
}