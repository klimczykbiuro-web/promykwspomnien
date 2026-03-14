"use client";

import { useState } from "react";

export default function ClaimForm({
  slug,
  token,
  fullName,
}: {
  slug: string;
  token: string;
  fullName: string;
}) {
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setErrorText("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    if (password !== passwordRepeat) {
      setStatus("error");
      setErrorText("Hasła nie są takie same.");
      return;
    }

    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch("/api/owner/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się aktywować dostępu.");
      }

      window.location.href = "/owner";
    } catch (error) {
      setStatus("error");
      setErrorText(
        error instanceof Error
          ? error.message
          : "Nie udało się aktywować dostępu."
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-sm">
      <p className="text-sm text-stone-500">Aktywacja dostępu właściciela</p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">
        {fullName}
      </h1>

      <p className="mt-4 text-sm leading-7 text-stone-700">
        Ten link możesz otwierać wiele razy i na wielu urządzeniach.
        Właścicielem zostanie osoba, która jako pierwsza skutecznie ustawi hasło.
      </p>

      <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Ustaw hasło i zapisz je w bezpiecznym miejscu. Bez niego nie wejdziesz
        później do panelu właściciela.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Hasło
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4 outline-none focus:border-stone-400"
            placeholder="Minimum 8 znaków"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Powtórz hasło
          </label>
          <input
            type="password"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4 outline-none focus:border-stone-400"
            placeholder="Wpisz to samo hasło ponownie"
          />
        </div>

        {status === "error" ? (
          <p className="text-sm text-red-600">{errorText}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {status === "saving" ? "Zapisywanie..." : "Aktywuj dostęp właściciela"}
        </button>
      </form>
    </div>
  );
}