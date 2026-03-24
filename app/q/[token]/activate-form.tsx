"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ActivateFormProps = {
  token: string;
};

export default function ActivateForm({ token }: ActivateFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedContentRights, setAcceptedContentRights] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      setSubmitting(false);
      return;
    }

    if (!acceptedRules) {
      setError(
        "Aby aktywować profil, zaakceptuj Regulamin i Politykę prywatności."
      );
      setSubmitting(false);
      return;
    }

    if (!acceptedContentRights) {
      setError(
        "Aby aktywować profil, potwierdź odpowiedzialność za dodawane zdjęcia i treści."
      );
      setSubmitting(false);
      return;
    }

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
        maxWidth: "520px",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          background: "#fff7ed",
          color: "#9a3412",
          border: "1px solid #fed7aa",
          borderRadius: "14px",
          padding: "14px 16px",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        Ustaw hasło i zapisz je w bezpiecznym miejscu. Będzie potrzebne przy
        kolejnych zmianach w profilu.
      </div>

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

      <div
        style={{
          display: "grid",
          gap: "12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "14px 16px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          <input
            type="checkbox"
            checked={acceptedRules}
            onChange={(event) => setAcceptedRules(event.target.checked)}
            style={{ marginTop: "4px" }}
          />
          <span>
            Oświadczam, że zapoznałem/am się z{" "}
            <Link href="/regulamin">Regulaminem</Link> i{" "}
            <Link href="/polityka-prywatnosci">Polityką prywatności</Link> oraz
            akceptuję ich treść.
          </span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "14px",
            lineHeight: 1.6,
            color: "#334155",
          }}
        >
          <input
            type="checkbox"
            checked={acceptedContentRights}
            onChange={(event) =>
              setAcceptedContentRights(event.target.checked)
            }
            style={{ marginTop: "4px" }}
          />
          <span>
            Oświadczam, że mam prawo do dodawania zdjęć i treści do profilu oraz
            że nie naruszają one praw osób trzecich, w tym prawa do wizerunku,
            prywatności i praw autorskich.
          </span>
        </label>
      </div>

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