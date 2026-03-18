"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

type Props = {
  fullName: string;
  images: string[];
};

export default function GallerySection({ fullName, images }: Props) {
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
          <h2 className={styles.sectionTitle}>Zdjęcia</h2>

          <div className={styles.galleryGrid}>
            {images.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className={styles.galleryItem}>
                <button
                  type="button"
                  className={styles.galleryThumbButton}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Powiększ zdjęcie ${index + 1}`}
                >
                  <img
                    src={imageUrl}
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
              src={activeImage}
              alt={`${fullName} – zdjęcie ${activeIndex + 1}`}
              className={styles.galleryLightboxImage}
            />

            <div className={styles.galleryLightboxFooter}>
              Zdjęcie {activeIndex + 1} z {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}