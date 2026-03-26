"use client";

import { useState } from "react";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się zalogować.");
      }

      window.location.href = "/admin";
    } catch (error) {
      setStatus("error");
      setErrorText(
        error instanceof Error ? error.message : "Nie udało się zalogować."
      );
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginCard}>
        <p className={styles.eyebrow}>Promyk Wspomnień</p>
        <h1 className={styles.loginTitle}>Panel administratora</h1>
        <p className={styles.loginText}>
          Zaloguj się, aby zobaczyć statystyki projektu, ruch na stronie oraz
          obsługiwać zgłoszenia zdjęć i treści z poziomu jednego miejsca.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Login</label>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Wpisz login administratora"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wpisz hasło"
              className={styles.input}
            />
          </div>

          {status === "error" ? (
            <div className={styles.errorBox}>{errorText}</div>
          ) : null}

          <button type="submit" className={styles.submitButton}>
            {status === "saving" ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
      </div>
    </main>
  );
}