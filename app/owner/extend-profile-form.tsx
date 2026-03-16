"use client";

import { useState } from "react";
import styles from "./owner.module.css";

type Props = {
  slug: string;
};

type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

const planOptions: {
  id: PlanId;
  title: string;
  badge?: string;
  description: string;
  hint: string;
}[] = [
  {
    id: "plan_1y",
    title: "1 rok",
    description: "Najprostsza opcja, jeśli chcesz przedłużyć profil na najbliższy czas.",
    hint: "Dobra, gdy chcesz odnowić profil teraz i wrócić do tematu później.",
  },
  {
    id: "plan_5y",
    title: "5 lat",
    badge: "Najczęściej wybierane",
    description: "Wygodna opcja na dłużej, bez potrzeby szybkiego ponownego przedłużania.",
    hint: "Najlepszy wybór, jeśli chcesz mieć spokój na kilka lat.",
  },
  {
    id: "plan_20y",
    title: "20 lat",
    description: "Opcja na bardzo długi czas, żeby nie zajmować się tym ponownie przez wiele lat.",
    hint: "Dobra, jeśli chcesz załatwić temat raz i na długo.",
  },
];

export default function ExtendProfileForm({ slug }: Props) {
  const [planId, setPlanId] = useState<PlanId>("plan_5y");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          planId,
          buyerName,
          buyerEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się utworzyć płatności.");
      }

      if (!data?.redirectUrl) {
        throw new Error("Brak adresu przekierowania do płatności.");
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formStack}>
      <fieldset className={styles.formGroup}>
        <legend className={styles.formLegend}>Wybierz okres przedłużenia</legend>

        <div className={styles.planGrid}>
          {planOptions.map((plan) => {
            const inputId = `plan-${plan.id}`;
            const isActive = planId === plan.id;

            return (
              <div key={plan.id}>
                <input
                  id={inputId}
                  name="planId"
                  type="radio"
                  value={plan.id}
                  checked={isActive}
                  onChange={() => setPlanId(plan.id)}
                  className={styles.visuallyHidden}
                />

                <label
                  htmlFor={inputId}
                  className={`${styles.planCard} ${
                    isActive ? styles.planCardActive : ""
                  }`}
                >
                  <div className={styles.planTitleRow}>
                    <span className={styles.planTitle}>{plan.title}</span>
                    {plan.badge ? (
                      <span className={styles.planBadge}>{plan.badge}</span>
                    ) : null}
                  </div>

                  <p className={styles.planDescription}>{plan.description}</p>
                  <p className={styles.planHint}>{plan.hint}</p>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.formField}>
        <label htmlFor="buyerName" className={styles.formLabel}>
          Imię i nazwisko
        </label>
        <input
          id="buyerName"
          className={`input ${styles.formInput}`}
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Np. Jan Kowalski"
          required
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="buyerEmail" className={styles.formLabel}>
          Adres e-mail
        </label>
        <input
          id="buyerEmail"
          className={`input ${styles.formInput}`}
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Np. jan@example.com"
          required
        />
      </div>

      {error ? (
        <div className={styles.formError} aria-live="polite">
          {error}
        </div>
      ) : null}

      <button type="submit" className={styles.formSubmit} disabled={isLoading}>
        {isLoading ? "Przekierowanie..." : "Przejdź do płatności"}
      </button>
    </form>
  );
}