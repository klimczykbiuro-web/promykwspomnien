"use client";

import { useMemo, useState } from "react";

type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export default function GuestbookSection({
  slug,
  initialEntries,
}: {
  slug: string;
  initialEntries: GuestbookEntry[];
}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const entryCountLabel = useMemo(() => {
    return `${entries.length} ${entries.length === 1 ? "wpis" : "wpisów"}`;
  }, [entries.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!authorName.trim() || !message.trim()) {
      setStatus("error");
      setErrorText("Wpisz imię oraz treść wspomnienia.");
      return;
    }

    setStatus("saving");
    setErrorText("");

    try {
      const res = await fetch(`/api/profiles/${slug}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Nie udało się zapisać wpisu.");
      }

      const data = await res.json();

      setEntries((prev) => [data.entry, ...prev]);
      setAuthorName("");
      setMessage("");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorText("Nie udało się dodać wpisu. Spróbuj ponownie.");
    }
  }

  return (
    <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">Księga gości</p>
          <h2 className="text-2xl font-semibold text-stone-900">{entryCountLabel}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-[28px] bg-stone-50 p-5">
        <div className="space-y-2">
          <label htmlFor="guestbook-name" className="block text-sm font-medium text-stone-700">
            Twoje imię
          </label>
          <input
            id="guestbook-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Np. Anna"
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none transition focus:border-stone-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="guestbook-message" className="block text-sm font-medium text-stone-700">
            Wspomnienie
          </label>
          <textarea
            id="guestbook-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Napisz kilka słów wspomnienia..."
            className="min-h-32 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-stone-400"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "saving"}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? "Zapisywanie..." : "Dodaj wpis"}
          </button>

          {status === "success" ? (
            <p className="text-sm text-emerald-700">Wpis został dodany.</p>
          ) : null}

          {status === "error" ? (
            <p className="text-sm text-red-600">{errorText}</p>
          ) : null}
        </div>
      </form>

      <div className="space-y-4 border-t border-stone-200 pt-6">
        {entries.length === 0 ? (
          <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
            Nie ma jeszcze wpisów w księdze gości.
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="rounded-2xl bg-stone-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-medium text-stone-900">{entry.author_name}</h3>
                <span className="text-xs text-stone-500">{formatDate(entry.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-stone-700">{entry.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
