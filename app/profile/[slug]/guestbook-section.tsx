"use client";

import { useEffect, useMemo, useState } from "react";

type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

type Props = {
  slug: string;
};

function formatDatePl(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function GuestbookSection({ slug }: Props) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/profiles/${slug}/guestbook`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Nie udało się pobrać wpisów.");
        }

        if (!cancelled) {
          setEnabled(Boolean(data.enabled));
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Nie udało się pobrać wpisów."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedAuthor = authorName.trim();
    const normalizedMessage = message.trim();

    if (!normalizedAuthor) {
      setError("Podaj imię lub podpis.");
      return;
    }

    if (!normalizedMessage) {
      setError("Wpis nie może być pusty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/profiles/${slug}/guestbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: normalizedAuthor,
          message: normalizedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się dodać wpisu.");
      }

      const newEntry = data.entry as GuestbookEntry;

      setEntries((current) => [newEntry, ...current]);
      setAuthorName("");
      setMessage("");
      setSuccess("Dziękujemy. Wpis został dodany.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się dodać wpisu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const countLabel = useMemo(() => {
    const count = entries.length;
    if (count === 1) return "1 wpis";
    if (count >= 2 && count <= 4) return `${count} wpisy`;
    return `${count} wpisów`;
  }, [entries]);

  if (!isLoading && enabled === false) {
    return null;
  }

  return (
    <section style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Księga gości</p>
          <h2 style={titleStyle}>Pozostaw wspomnienie lub kilka ciepłych słów</h2>
          <p style={subtitleStyle}>
            Rodzina i bliscy mogą zostawić tutaj krótki wpis pamięci.
          </p>
        </div>

        <div style={countBadgeStyle}>{countLabel}</div>
      </div>

      <div style={formCardStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label htmlFor="guestbook-author" style={labelStyle}>
              Imię lub podpis
            </label>
            <input
              id="guestbook-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={80}
              placeholder="np. córka Anna"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="guestbook-message" style={labelStyle}>
              Treść wpisu
            </label>
            <textarea
              id="guestbook-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={800}
              rows={5}
              placeholder="Napisz kilka słów wspomnienia..."
              style={textareaStyle}
            />
          </div>

          {error ? <p style={errorStyle}>{error}</p> : null}
          {success ? <p style={successStyle}>{success}</p> : null}

          <div style={actionsStyle}>
            <button
              type="submit"
              disabled={isSubmitting || enabled === false}
              style={buttonStyle}
            >
              {isSubmitting ? "Dodawanie wpisu..." : "Dodaj wpis do księgi gości"}
            </button>
          </div>
        </form>
      </div>

      <div style={entriesWrapStyle}>
        {isLoading ? (
          <div style={emptyCardStyle}>Ładowanie wpisów...</div>
        ) : entries.length === 0 ? (
          <div style={emptyCardStyle}>
            Księga gości jest jeszcze pusta. Możesz dodać pierwszy wpis.
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} style={entryCardStyle}>
              <div style={entryTopStyle}>
                <strong style={entryAuthorStyle}>{entry.author_name}</strong>
                <span style={entryDateStyle}>{formatDatePl(entry.created_at)}</span>
              </div>

              <p style={entryMessageStyle}>{entry.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "#fffdf9",
  border: "1px solid #ece5dc",
  borderRadius: 28,
  padding: 24,
  display: "grid",
  gap: 18,
  boxShadow: "0 10px 28px rgba(44, 34, 23, 0.05)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#7a6a5d",
};

const titleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: 36,
  lineHeight: 1.12,
  color: "#1f1a17",
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.7,
  color: "#5f564f",
  maxWidth: 760,
};

const countBadgeStyle: React.CSSProperties = {
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 999,
  background: "#f4ede5",
  color: "#5d4d41",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 15,
};

const formCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #ece5dc",
  borderRadius: 24,
  padding: 20,
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#2b231e",
};

const inputStyle: React.CSSProperties = {
  minHeight: 54,
  borderRadius: 16,
  border: "1px solid #d9cec2",
  padding: "0 16px",
  fontSize: 17,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid #d9cec2",
  padding: "14px 16px",
  fontSize: 17,
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const buttonStyle: React.CSSProperties = {
  appearance: "none",
  border: "none",
  borderRadius: 18,
  background: "#2f241d",
  color: "#ffffff",
  minHeight: 58,
  padding: "0 22px",
  fontSize: 18,
  fontWeight: 800,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#b42318",
  fontWeight: 600,
};

const successStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#166534",
  fontWeight: 600,
};

const entriesWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const emptyCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px dashed #d9cec2",
  borderRadius: 20,
  padding: 18,
  fontSize: 17,
  lineHeight: 1.7,
  color: "#6a5f56",
};

const entryCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #ece5dc",
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 8px 20px rgba(44, 34, 23, 0.04)",
};

const entryTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: 10,
};

const entryAuthorStyle: React.CSSProperties = {
  fontSize: 18,
  color: "#2b231e",
};

const entryDateStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#7a6a5d",
};

const entryMessageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  lineHeight: 1.8,
  color: "#4e4540",
  whiteSpace: "pre-wrap",
};