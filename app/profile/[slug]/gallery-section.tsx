"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

type GalleryImage = {
  id: string;
  url: string;
};

type Props = {
  fullName: string;
  profileSlug: string;
  images: GalleryImage[];
};

export default function GallerySection({
  fullName,
  profileSlug,
  images,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const hasActiveImage = activeIndex !== null;
  const activeImage = hasActiveImage ? images[activeIndex] : null;

  function closeLightbox() {
    setActiveIndex(null);
  }

  function goNext() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
  }

  function goPrev() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, images.length]);

  return (
    <>
      <section className={styles.galleryCard}>
        <div className={styles.contentInner}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <h2 className={styles.sectionTitle}>Zdjęcia</h2>

            <a
              href={`/report?slug=${profileSlug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "38px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#111827",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Zgłoś zdjęcie lub treść
            </a>
          </div>

          <div className={styles.galleryGrid}>
            {images.map((image, index) => (
              <div key={`${image.id}-${index}`} className={styles.galleryItem}>
                <button
                  type="button"
                  className={styles.galleryThumbButton}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Powiększ zdjęcie ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={`${fullName} – zdjęcie ${index + 1}`}
                    className={styles.galleryImage}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {hasActiveImage && activeImage ? (
        <div
          className={styles.galleryLightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Powiększone zdjęcie"
        >
          <div
            className={styles.galleryLightboxContent}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.galleryLightboxClose}
              onClick={closeLightbox}
              aria-label="Zamknij"
            >
              ×
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.galleryNavButton} ${styles.galleryNavPrev}`}
                  onClick={goPrev}
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`${styles.galleryNavButton} ${styles.galleryNavNext}`}
                  onClick={goNext}
                  aria-label="Następne zdjęcie"
                >
                  ›
                </button>
              </>
            ) : null}

            <img
              src={activeImage.url}
              alt={`${fullName} – zdjęcie ${activeIndex + 1}`}
              className={styles.galleryLightboxImage}
            />

            <div
              className={styles.galleryLightboxFooter}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span>
                Zdjęcie {activeIndex + 1} z {images.length}
              </span>

              <a
                href={`/report?slug=${profileSlug}&imageId=${activeImage.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "40px",
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.7)",
                }}
              >
                Zgłoś to zdjęcie
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}