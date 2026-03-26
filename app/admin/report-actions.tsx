"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin.module.css";

type ActionType = "keep" | "hide" | "restore" | "remove";

const labels: Record<ActionType, string> = {
  keep: "Zostaw",
  hide: "Ukryj",
  restore: "Przywróć",
  remove: "Usuń",
};

export default function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<ActionType | null>(null);
  const [error, setError] = useState("");

  async function runAction(action: ActionType) {
    setPending(action);
    setError("");

    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się wykonać akcji.");
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Błąd akcji.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.actionsWrap}>
      <button
        type="button"
        onClick={() => runAction("keep")}
        disabled={pending !== null}
        className={`${styles.actionButton} ${styles.actionKeep}`}
      >
        {pending === "keep" ? "..." : labels.keep}
      </button>

      <button
        type="button"
        onClick={() => runAction("hide")}
        disabled={pending !== null}
        className={`${styles.actionButton} ${styles.actionHide}`}
      >
        {pending === "hide" ? "..." : labels.hide}
      </button>

      <button
        type="button"
        onClick={() => runAction("restore")}
        disabled={pending !== null}
        className={`${styles.actionButton} ${styles.actionRestore}`}
      >
        {pending === "restore" ? "..." : labels.restore}
      </button>

      <button
        type="button"
        onClick={() => runAction("remove")}
        disabled={pending !== null}
        className={`${styles.actionButton} ${styles.actionRemove}`}
      >
        {pending === "remove" ? "..." : labels.remove}
      </button>

      {error ? <div className={styles.inlineError}>{error}</div> : null}
    </div>
  );
}