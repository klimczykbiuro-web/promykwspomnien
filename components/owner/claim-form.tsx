"use client";

import Link from "next/link";
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
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedContentRights, setAcceptedContentRights] = useState(false);
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

    if (!acceptedRules) {
      setStatus("error");
      setErrorText(
        "Aby aktywować profil, zaakceptuj Regulamin i Politykę prywatności."
      );
      return;
    }

    if (!acceptedContentRights) {
      setStatus("error");
      setErrorText(
        "Aby aktywować profil, potwierdź odpowiedzialność za dodawane zdjęcia i treści."
      );
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
        To pierwszy krok do zarządzania profilem pamięci. Ustaw własne hasło,
        zapisz je w bezpiecznym miejscu i potwierdź akceptację zasad korzystania
        z serwisu.
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

        <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <label className="flex items-start gap-3 text-sm leading-6 text-stone-700">
            <input
              type="checkbox"
              checked={acceptedRules}
              onChange={(e) => setAcceptedRules(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300"
            />
            <span>
              Oświadczam, że zapoznałem/am się z{" "}
              <Link href="/regulamin" className="underline">
                Regulaminem
              </Link>{" "}
              i{" "}
              <Link href="/polityka-prywatnosci" className="underline">
                Polityką prywatności
              </Link>{" "}
              oraz akceptuję ich treść.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-stone-700">
            <input
              type="checkbox"
              checked={acceptedContentRights}
              onChange={(e) => setAcceptedContentRights(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300"
            />
            <span>
              Oświadczam, że mam prawo do dodawania zdjęć i treści do profilu
              oraz że nie naruszają one praw osób trzecich, w tym prawa do
              wizerunku, prywatności i praw autorskich.
            </span>
          </label>
        </div>

        {status === "error" ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorText}
          </p>
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