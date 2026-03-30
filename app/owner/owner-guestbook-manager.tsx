"use client";

import { useState } from "react";

type GuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
};

type Props = {
  initialEnabled: boolean;
  initialEntries: GuestbookEntry[];
};

function formatDate(dateString: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export default function OwnerGuestbookManager({
  initialEnabled,
  initialEntries,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [entries, setEntries] = useState(initialEntries);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleToggleGuestbook(nextEnabled: boolean) {
    setMessage("");
    setError("");
    setIsSavingSettings(true);

    try {
      const response = await fetch("/api/owner/guestbook/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: nextEnabled,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się zmienić ustawienia.");
      }

      setEnabled(Boolean(data.guestbookEnabled));
      setMessage(data.message || "Zapisano ustawienia.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się zmienić ustawienia."
      );
    } finally {
      setIsSavingSettings(false);
    }
  }

  function updateLocalEntry(
    entryId: string,
    key: "author_name" | "message",
    value: string
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, [key]: value } : entry
      )
    );
  }

  async function handleSaveEntry(entry: GuestbookEntry) {
    setMessage("");
    setError("");
    setBusyEntryId(entry.id);

    try {
      const response = await fetch(`/api/owner/guestbook/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: entry.author_name,
          message: entry.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się zapisać wpisu.");
      }

      const updated = data.entry as GuestbookEntry;

      setEntries((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      setMessage("Wpis został zapisany.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać wpisu.");
    } finally {
      setBusyEntryId(null);
    }
  }

  async function handleDeleteEntry(entryId: string) {
    const confirmed = window.confirm("Czy na pewno chcesz usunąć ten wpis?");
    if (!confirmed) return;

    setMessage("");
    setError("");
    setBusyEntryId(entryId);

    try {
      const response = await fetch(`/api/owner/guestbook/${entryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Nie udało się usunąć wpisu.");
      }

      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      setMessage("Wpis został usunięty.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się usunąć wpisu.");
    } finally {
      setBusyEntryId(null);
    }
  }

  return (
    <div style={wrapStyle}>
      <div style={settingsCardStyle}>
        <div style={settingsTopStyle}>
          <div>
            <h3 style={boxTitleStyle}>Ustawienia księgi gości</h3>
            <p style={boxTextStyle}>
              Możesz całkowicie wyłączyć księgę gości na publicznym profilu albo
              włączyć ją ponownie.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggleGuestbook(!enabled)}
            disabled={isSavingSettings}
            style={enabled ? disableButtonStyle : enableButtonStyle}
          >
            {isSavingSettings
              ? "Zapisywanie..."
              : enabled
              ? "Wyłącz księgę gości"
              : "Włącz księgę gości"}
          </button>
        </div>

        <p style={statusStyle}>
          Aktualny stan:{" "}
          <strong>{enabled ? "księga gości jest włączona" : "księga gości jest wyłączona"}</strong>
        </p>
      </div>

      {message ? <p style={successStyle}>{message}</p> : null}
      {error ? <p style={errorStyle}>{error}</p> : null}

      <div style={entriesWrapStyle}>
        {entries.length === 0 ? (
          <div style={emptyStyle}>Brak wpisów w księdze gości.</div>
        ) : (
          entries.map((entry) => {
            const disabled = busyEntryId === entry.id;

            return (
              <article key={entry.id} style={entryCardStyle}>
                <div style={entryHeaderStyle}>
                  <strong style={entryDateStyle}>
                    Dodano: {formatDate(entry.created_at)}
                  </strong>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Imię lub podpis</label>
                  <input
                    type="text"
                    value={entry.author_name}
                    onChange={(e) =>
                      updateLocalEntry(entry.id, "author_name", e.target.value)
                    }
                    maxLength={80}
                    style={inputStyle}
                    disabled={disabled}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Treść wpisu</label>
                  <textarea
                    value={entry.message}
                    onChange={(e) =>
                      updateLocalEntry(entry.id, "message", e.target.value)
                    }
                    maxLength={800}
                    rows={5}
                    style={textareaStyle}
                    disabled={disabled}
                  />
                </div>

                <div style={actionsStyle}>
                  <button
                    type="button"
                    onClick={() => handleSaveEntry(entry)}
                    disabled={disabled}
                    style={saveButtonStyle}
                  >
                    {disabled ? "Zapisywanie..." : "Zapisz wpis"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    disabled={disabled}
                    style={deleteButtonStyle}
                  >
                    Usuń wpis
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const settingsCardStyle: React.CSSProperties = {
  borderRadius: 22,
  background: "#faf6f1",
  border: "1px solid #e7ddd1",
  padding: 18,
};

const settingsTopStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  justifyContent: "space-between",
  alignItems: "center",
};

const boxTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.2,
};

const boxTextStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 17,
  lineHeight: 1.7,
  color: "var(--muted)",
};

const statusStyle: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 16,
  lineHeight: 1.7,
};

const enableButtonStyle: React.CSSProperties = {
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "none",
  background: "#dcfce7",
  color: "#166534",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
};

const disableButtonStyle: React.CSSProperties = {
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 16,
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer",
};

const successStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#166534",
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#b42318",
  fontWeight: 700,
};

const entriesWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const emptyStyle: React.CSSProperties = {
  borderRadius: 20,
  background: "#faf6f1",
  padding: 16,
  color: "var(--muted)",
};

const entryCardStyle: React.CSSProperties = {
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e7ddd1",
  padding: 18,
  display: "grid",
  gap: 14,
};

const entryHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const entryDateStyle: React.CSSProperties = {
  fontSize: 14,
  color: "var(--muted)",
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  minHeight: 50,
  borderRadius: 14,
  border: "1px solid #d7cbbd",
  padding: "0 14px",
  fontSize: 16,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #d7cbbd",
  padding: "12px 14px",
  fontSize: 16,
  lineHeight: 1.6,
  resize: "vertical",
  outline: "none",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const saveButtonStyle: React.CSSProperties = {
  minHeight: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "none",
  background: "#2f241d",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  minHeight: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "1px solid #ef4444",
  background: "#ffffff",
  color: "#b91c1c",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
};