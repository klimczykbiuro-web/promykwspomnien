"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

function formatDatePL(dateString: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function GuestbookSection({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      try {
        setIsLoading(true);
        setErrorText("");

        const res = await fetch(`/api/profiles/${slug}/guestbook`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Nie udało się pobrać wpisów.");
        }

        const data = (await res.json()) as { entries: GuestbookEntry[] };

        if (isMounted) {
          setEntries(data.entries ?? []);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorText("Nie udało się pobrać księgi gości.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEntries();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const entriesCount = useMemo(() => entries.length, [entries]);

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setErrorText("");
      setSuccessText("");

      const res = await fetch(`/api/profiles/${slug}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName,
          message,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        entry?: GuestbookEntry;
      };

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się dodać wpisu.");
      }

      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev]);
      }

      setAuthorName("");
      setMessage("");
      setSuccessText("Wpis został dodany.");
    } catch (error) {
      console.error(error);
      setErrorText(
        error instanceof Error ? error.message : "Nie udało się dodać wpisu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-stone-500">Księga gości</p>
          <h2 className="mt-1 text-3xl font-semibold text-stone-900">
            Wspomnienia i wpisy bliskich
          </h2>
        </div>
        <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">
          Liczba wpisów: <span className="font-medium">{entriesCount}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Twoje imię
            </label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Np. Anna"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700">
              Treść wpisu
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Napisz kilka słów pamięci..."
              className="min-h-32 rounded-2xl"
            />
          </div>

          <Button
            className="h-11 rounded-2xl"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Zapisywanie..." : "Dodaj wpis"}
          </Button>

          {successText ? (
            <p className="text-sm text-emerald-700">{successText}</p>
          ) : null}

          {errorText ? (
            <p className="text-sm text-red-600">{errorText}</p>
          ) : null}
        </div>

        <div>
          {isLoading ? (
            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              Ładowanie wpisów...
            </div>
          ) : null}

          {!isLoading && entries.length === 0 ? (
            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              Nie ma jeszcze żadnych wpisów.
            </div>
          ) : null}

          {!isLoading && entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-medium text-stone-900">
                        {entry.author_name}
                      </span>
                      <span className="text-xs text-stone-500">
                        {formatDatePL(entry.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-7 text-stone-700">
                      {entry.message}
                    </p>
                  </div>
                  {index < entries.length - 1 ? (
                    <Separator className="my-4" />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
