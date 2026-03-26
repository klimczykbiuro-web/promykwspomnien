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
      setErrorText(error instanceof Error ? error.message : "Nie udało się zalogować.");
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <p className={styles.eyebrow}>Panel administratora</p>
          <h1 className={styles.loginTitle}>Zaloguj się do zaplecza</h1>
          <p className={styles.loginText}>
            Tu sprawdzisz statystyki systemu, liczbę aktywnych profili, ruch na stronie i zgłoszone zdjęcia.
            Po zalogowaniu od razu zobaczysz przejrzysty dashboard oraz tabelę moderacji.
          </p>

          <div className={styles.badgeRow}>
            <span className={styles.badge}>Statystyki</span>
            <span className={styles.badgeBlue}>Moderacja</span>
            <span className={styles.badgeAmber}>Ruch i odsłony</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Login administratora</label>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Login"
                className={styles.input}
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hasło"
                className={styles.input}
                autoComplete="current-password"
              />
            </div>

            {status === "error" ? (
              <div className={styles.errorBox}>{errorText}</div>
            ) : null}

            <div className={styles.loginButtonRow}>
              <button type="submit" className={styles.primaryButton}>
                {status === "saving" ? "Logowanie..." : "Zaloguj"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
