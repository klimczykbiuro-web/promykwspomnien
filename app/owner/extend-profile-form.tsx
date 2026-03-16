"use client";

import { useState } from "react";
import styles from "./owner.module.css";

type Props = {
  slug: string;
};

type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

const planOptions: {
  id: PlanId;
  period: string;
  subtitle: string;
  price: string;
  badge?: string;
}[] = [
  {
    id: "plan_1y",
    period: "1 rok",
    subtitle: "Na teraz",
    price: "10 zł",
  },
  {
    id: "plan_5y",
    period: "5 lat",
    subtitle: "Najczęściej wybierane",
    price: "45 zł",
    badge: "Polecane",
  },
  {
    id: "plan_20y",
    period: "20 lat",
    subtitle: "Spokój na wiele lat",
    price: "150 zł",
  },
];

function getPlanThemeClass(planId: PlanId, stylesObj: typeof styles) {
  if (planId === "plan_1y") return stylesObj.planCard1Y;
  if (planId === "plan_5y") return stylesObj.planCard5Y;
  return stylesObj.planCard20Y;
}

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
        <legend className={styles.formLegend}>Wybierz plan</legend>

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
                  className={styles.planInput}
                />

                <label
                  htmlFor={inputId}
                  className={[
                    styles.planCard,
                    getPlanThemeClass(plan.id, styles),
                    isActive ? styles.planCardActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.planTopRow}>
                    <span className={styles.planPeriod}>{plan.period}</span>

                    {plan.badge ? (
                      <span className={styles.planBadge}>{plan.badge}</span>
                    ) : null}
                  </div>

                  <p className={styles.planSubtitle}>{plan.subtitle}</p>
                  <p className={styles.planPrice}>{plan.price}</p>

                  {isActive ? (
                    <span className={styles.planSelected}>Wybrano</span>
                  ) : null}
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