"use client";

import { useState } from "react";

type Props = {
  slug: string;
};

type PlanId = "plan_1y" | "plan_5y" | "plan_20y";

const planOptions: { id: PlanId; label: string }[] = [
  { id: "plan_1y", label: "1 rok" },
  { id: "plan_5y", label: "5 lat" },
  { id: "plan_20y", label: "20 lat" },
];

export default function ExtendProfileForm({ slug }: Props) {
  const [planId, setPlanId] = useState<PlanId>("plan_1y");
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
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 16 }}>
      <div>
        <label htmlFor="planId" style={{ display: "block", marginBottom: 8 }}>
          Wybierz okres przedłużenia
        </label>
        <select
          id="planId"
          className="select"
          value={planId}
          onChange={(e) => setPlanId(e.target.value as PlanId)}
        >
          {planOptions.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="buyerName" style={{ display: "block", marginBottom: 8 }}>
          Imię i nazwisko
        </label>
        <input
          id="buyerName"
          className="input"
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Np. Jan Kowalski"
          required
        />
      </div>

      <div>
        <label htmlFor="buyerEmail" style={{ display: "block", marginBottom: 8 }}>
          Adres e-mail
        </label>
        <input
          id="buyerEmail"
          className="input"
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Np. jan@example.com"
          required
        />
      </div>

      {error ? (
        <div
          style={{
            borderRadius: 18,
            padding: 14,
            background: "#fff1f1",
            border: "1px solid #f0caca",
            color: "#8a2d2d",
          }}
        >
          {error}
        </div>
      ) : null}

      <button type="submit" className="button" disabled={isLoading}>
        {isLoading ? "Przekierowanie..." : "Przejdź do płatności"}
      </button>
    </form>
  );
}