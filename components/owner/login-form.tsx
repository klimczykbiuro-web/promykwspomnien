"use client";

import { useState } from "react";

export default function OwnerLoginForm() {
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch("/api/owner/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się zalogować.");
      }

      window.location.href = "/owner";
    } catch (error) {
      setStatus("error");
      setErrorText(
        error instanceof Error ? error.message : "Nie udało się zalogować."
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-sm">
      <p className="text-sm text-stone-500">Panel właściciela</p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">
        Zaloguj się
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Adres profilu / slug
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4 outline-none focus:border-stone-400"
            placeholder="np. maria-kowalska"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700">
            Hasło
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-stone-200 px-4 outline-none focus:border-stone-400"
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
          {status === "saving" ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </div>
  );
}