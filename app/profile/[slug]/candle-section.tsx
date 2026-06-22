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
    <section
      className={styles.contentCard}
      style={{
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            background:
              "radial-gradient(circle at 50% 35%, #fff7ed 0%, #fed7aa 38%, #92400e 100%)",
            boxShadow: "0 8px 20px rgba(146, 64, 14, 0.18)",
            color: "#7c2d12",
            fontSize: 24,
            lineHeight: 1,
          }}
        >
          🕯️
        </div>

        <div
          style={{
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.2,
                color: "#2f241d",
              }}
            >
              {alreadyLit ? "Znicz płonie" : "Zapal znicz"}
            </h2>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                borderLeft: "1px solid #e7d8c7",
                paddingLeft: 10,
                color: "#7c4a1e",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              🔥 {count}
            </span>
          </div>

          <p
            style={{
              margin: "4px 0 0",
              color: "#6b625b",
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            {message || "Pozostaw symboliczny ślad pamięci na tym profilu."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLightCandle}
          disabled={alreadyLit || isLoading}
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 14,
            border: alreadyLit ? "1px solid #d6d3d1" : "1px solid #b8793d",
            background: alreadyLit ? "#f5f5f4" : "#ffffff",
            color: alreadyLit ? "#78716c" : "#7c2d12",
            fontSize: 15,
            fontWeight: 800,
            cursor: alreadyLit || isLoading ? "default" : "pointer",
            whiteSpace: "nowrap",
            boxShadow:
              alreadyLit || isLoading
                ? "none"
                : "0 6px 14px rgba(146, 64, 14, 0.12)",
          }}
        >
          {isLoading ? "Zapalanie..." : alreadyLit ? "Zapalono" : "Zapal znicz"}
        </button>
      </div>
    </section>
  );
}
