"use client";

import { useState } from "react";
import styles from "./profile.module.css";

type Props = {
  slug: string;
  initialCount: number;
  initialAlreadyLit: boolean;
};

export default function CandleSection({
  slug,
  initialCount,
  initialAlreadyLit,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [alreadyLit, setAlreadyLit] = useState(initialAlreadyLit);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(
    initialAlreadyLit ? "Znicz został już dziś zapalony z tego urządzenia." : ""
  );

  async function handleLightCandle() {
    if (alreadyLit || isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/profiles/${slug}/candles`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.status === 429) {
        setAlreadyLit(true);
        setCount(typeof data.count === "number" ? data.count : count);
        setMessage(
          data.message || "Znicz został już dziś zapalony z tego urządzenia."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się zapalić znicza.");
      }

      setAlreadyLit(true);
      setCount(typeof data.count === "number" ? data.count : count + 1);
      setMessage(data.message || "Dziękujemy. Znicz został zapalony.");

      window.dispatchEvent(new CustomEvent("memorial:candle-lit"));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się zapalić znicza."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className={styles.candleCard}>
      <div className={styles.candleHeader}>
        <div>
          <p className={styles.candleEyebrow}>Pamięć</p>
          <h2 className={styles.candleTitle}>Zapal znicz</h2>
          <p className={styles.candleDescription}>
            Kliknij przycisk, aby zapalić wirtualny znicz pamięci.
          </p>
        </div>

        <div className={styles.candleCountBox}>
          <span className={styles.candleCountLabel}>Zapalone znicze</span>
          <strong className={styles.candleCountValue}>{count}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLightCandle}
        disabled={alreadyLit || isLoading}
        className={`${styles.candleButton} ${
          alreadyLit ? styles.candleButtonDone : ""
        }`}
      >
        {isLoading
          ? "Trwa zapalanie..."
          : alreadyLit
          ? "Znicz płonie"
          : "🕯️ Zapal znicz"}
      </button>

      {message ? <p className={styles.candleMessage}>{message}</p> : null}
    </section>
  );
}