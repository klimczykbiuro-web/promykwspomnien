"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateBatchButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setIsPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders/generate-batch", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się wygenerować batcha.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wygenerować batcha.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          minHeight: 50,
          padding: "0 18px",
          borderRadius: 16,
          border: "none",
          background: "#111827",
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Generowanie batcha..." : "Utwórz batch dnia i pobierz etykiety"}
      </button>

      {error ? (
        <div style={{ color: "#b91c1c", fontSize: 13, lineHeight: 1.6 }}>{error}</div>
      ) : null}
    </div>
  );
}
