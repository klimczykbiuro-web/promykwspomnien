"use client";

import { useEffect, useState } from "react";
import styles from "./profile.module.css";

type Props = {
  fullName: string;
  images: string[];
};

export default function GallerySection({ fullName, images }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

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

      {activeIndex !== null ? (
        <div
          className={styles.galleryLightbox}
          onClick={() => setActiveIndex(null)}
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
              onClick={() => setActiveIndex(null)}
              aria-label="Zamknij"
            >
              ×
            </button>

            <img
              src={images[activeIndex]}
              alt={`${fullName} – zdjęcie ${activeIndex + 1}`}
              className={styles.galleryLightboxImage}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}