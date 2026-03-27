"use client";

import { FormEvent, useState } from "react";

type FormState = {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  memorialName: string;
  street: string;
  postalCode: string;
  city: string;
  notes: string;
  acceptedTerms: boolean;
};

const initialState: FormState = {
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  memorialName: "",
  street: "",
  postalCode: "",
  city: "",
  notes: "",
  acceptedTerms: false,
};

export default function OrderForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.acceptedTerms) {
      setError("Musisz zaakceptować regulamin i politykę prywatności.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się utworzyć płatności.");
      }

      if (!data.redirectUrl) {
        throw new Error("Brakuje adresu przekierowania do płatności.");
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <div>
        <label htmlFor="buyerName">Imię i nazwisko zamawiającego</label>
        <input
          id="buyerName"
          required
          value={form.buyerName}
          onChange={(e) => update("buyerName", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="buyerEmail">Adres e-mail</label>
        <input
          id="buyerEmail"
          type="email"
          required
          value={form.buyerEmail}
          onChange={(e) => update("buyerEmail", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="buyerPhone">Telefon</label>
        <input
          id="buyerPhone"
          required
          value={form.buyerPhone}
          onChange={(e) => update("buyerPhone", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="memorialName">Imię i nazwisko osoby upamiętnianej</label>
        <input
          id="memorialName"
          required
          value={form.memorialName}
          onChange={(e) => update("memorialName", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="street">Ulica i numer</label>
        <input
          id="street"
          required
          value={form.street}
          onChange={(e) => update("street", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label htmlFor="postalCode">Kod pocztowy</label>
          <input
            id="postalCode"
            required
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="city">Miasto</label>
          <input
            id="city"
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes">Uwagi do zamówienia</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <input
          type="checkbox"
          checked={form.acceptedTerms}
          onChange={(e) => update("acceptedTerms", e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <span>
          Akceptuję regulamin i politykę prywatności oraz potwierdzam, że mogę
          przekazać dane potrzebne do realizacji zamówienia.
        </span>
      </label>

      {error ? (
        <div
          style={{
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: 12,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          height: 52,
          borderRadius: 12,
          border: "none",
          fontSize: 16,
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? "Przekierowuję do płatności..." : "Zamawiam i płacę 60 zł"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
};