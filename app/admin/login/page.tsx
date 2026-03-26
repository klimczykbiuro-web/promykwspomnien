"use client";

import { useState } from "react";

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
      setErrorText(
        error instanceof Error ? error.message : "Nie udało się zalogować."
      );
    }
  }

  return (
    <main className="bg-stone-50 min-h-screen">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm text-stone-500">Panel administratora</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">
            Zaloguj się
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Login"
              className="h-12 w-full rounded-2xl border border-stone-200 px-4"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              className="h-12 w-full rounded-2xl border border-stone-200 px-4"
            />

            {status === "error" ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorText}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white"
            >
              {status === "saving" ? "Logowanie..." : "Zaloguj"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}