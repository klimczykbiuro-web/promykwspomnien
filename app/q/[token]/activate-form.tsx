"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ActivateFormProps = {
  token: string;
};

export default function ActivateForm({ token }: ActivateFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/qr/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          fullName,
          password,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Nie udało się aktywować tabliczki.");
        setSubmitting(false);
        return;
      }

      router.push("/owner");
      router.refresh();
    } catch {
      setError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "14px",
        maxWidth: "420px",
        marginTop: "20px",
      }}
    >
      <label style={{ display: "grid", gap: "6px" }}>
        <span>Imię i nazwisko osoby upamiętnionej</span>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="np. Maria Kowalska"
          required
          minLength={2}
          maxLength={120}
          style={{
            border: "1px solid #d0d7de",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "16px",
          }}
        />
      </label>

      <label style={{ display: "grid", gap: "6px" }}>
        <span>Ustaw hasło właściciela</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="minimum 8 znaków"
          required
          minLength={8}
          maxLength={200}
          style={{
            border: "1px solid #d0d7de",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "16px",
          }}
        />
      </label>

      {error ? (
        <div
          style={{
            background: "#fff1f2",
            color: "#b42318",
            border: "1px solid #fecdca",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        style={{
          border: "none",
          borderRadius: "10px",
          padding: "14px 16px",
          fontSize: "16px",
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Aktywuję..." : "Aktywuj tabliczkę"}
      </button>
    </form>
  );
}