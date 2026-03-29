"use client";

import { useMemo, useState } from "react";

type Props = {
  slug: string;
  fullName: string;
  initialLatitude: number | null;
  initialLongitude: number | null;
};

function buildMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
}

export default function GraveLocationSection({
  slug,
  fullName,
  initialLatitude,
  initialLongitude,
}: Props) {
  const [latitude, setLatitude] = useState<number | null>(initialLatitude);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasLocation = latitude !== null && longitude !== null;

  const mapsUrl = useMemo(() => {
    if (latitude === null || longitude === null) return "";
    return buildMapsUrl(latitude, longitude);
  }, [latitude, longitude]);

  async function handleSetLocation() {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      "Jeśli teraz naciśniesz OK, oznacza to, że w tym miejscu znajduje się nagrobek i do niego będzie prowadził przycisk."
    );

    if (!confirmed) return;

    if (!navigator.geolocation) {
      setError("Ta przeglądarka nie obsługuje lokalizacji.");
      return;
    }

    try {
      setIsSaving(true);

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const response = await fetch(`/api/profiles/${slug}/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.data?.latitude && data?.data?.longitude) {
          setLatitude(data.data.latitude);
          setLongitude(data.data.longitude);
        }

        throw new Error(data?.error || "Nie udało się zapisać lokalizacji.");
      }

      setLatitude(data.data.latitude);
      setLongitude(data.data.longitude);
      setMessage("Lokalizacja nagrobka została zapisana.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się ustawić lokalizacji."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleShare() {
    if (!mapsUrl) return;

    setError("");
    setMessage("");

    const shareData = {
      title: `Lokalizacja nagrobka — ${fullName}`,
      text: `Lokalizacja nagrobka: ${fullName}`,
      url: mapsUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(mapsUrl);
      setMessage("Link do lokalizacji został skopiowany.");
    } catch {
      setError("Nie udało się udostępnić lokalizacji.");
    }
  }

  return (
    <section style={cardStyle}>
      <div style={topRowStyle}>
        <div style={iconWrapStyle}>📍</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={eyebrowStyle}>Lokalizacja nagrobka</p>
          <h2 style={titleStyle}>Ułatw rodzinie odnalezienie miejsca</h2>
          <p style={subtitleStyle}>
            Jedno kliknięcie wystarczy, aby zapisać miejsce nagrobka i później
            wygodnie udostępnić je bliskim.
          </p>
        </div>
      </div>

      <div style={contentBoxStyle}>
        {!hasLocation ? (
          <>
            <div style={infoBoxStyle}>
              <strong style={infoTitleStyle}>Jak to działa?</strong>
              <p style={infoTextStyle}>
                Jeśli jesteś teraz przy nagrobku, kliknij przycisk poniżej.
                Zapiszemy to miejsce jako lokalizację nagrobka.
              </p>
            </div>

            <div style={actionsStyle}>
              <button
                type="button"
                onClick={handleSetLocation}
                disabled={isSaving}
                style={greenButtonStyle}
              >
                {isSaving ? "Ustawianie lokalizacji..." : "Ustaw lokalizację nagrobka"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={successBoxStyle}>
              <strong style={successTitleStyle}>Lokalizacja została ustawiona</strong>
              <p style={successTextStyle}>
                Teraz możesz udostępnić rodzinie gotowy link. Po kliknięciu linku
                otworzy się Google Maps i poprowadzi do nagrobka.
              </p>
            </div>

            <div style={actionsStyle}>
              <button
                type="button"
                onClick={handleShare}
                style={greenButtonStyle}
              >
                Udostępnij lokalizację
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                style={secondaryButtonStyle}
              >
                Otwórz w Google Maps
              </a>
            </div>

            <p style={hintStyle}>
              Na telefonie zwykle pojawi się wybór aplikacji, np. SMS, WhatsApp
              albo Messenger.
            </p>
          </>
        )}

        {message ? <p style={messageStyle}>{message}</p> : null}
        {error ? <p style={errorStyle}>{error}</p> : null}
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #f7fff4 0%, #f3fbef 100%)",
  border: "1px solid #d8ebd0",
  borderRadius: 28,
  padding: 24,
  boxShadow: "0 10px 30px rgba(53, 93, 45, 0.08)",
  display: "grid",
  gap: 20,
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const iconWrapStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 18,
  background: "#39d353",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  boxShadow: "0 10px 24px rgba(57, 211, 83, 0.22)",
  flexShrink: 0,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#3d6e36",
};

const titleStyle: React.CSSProperties = {
  margin: "6px 0 8px",
  fontSize: 42,
  lineHeight: 1.08,
  color: "#1e1e1e",
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 19,
  lineHeight: 1.7,
  color: "#4e5c4a",
  maxWidth: 760,
};

const contentBoxStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e3eddc",
  borderRadius: 24,
  padding: 22,
  display: "grid",
  gap: 16,
};

const infoBoxStyle: React.CSSProperties = {
  background: "#f8fbf6",
  border: "1px solid #e5efe0",
  borderRadius: 18,
  padding: 16,
};

const infoTitleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 18,
  marginBottom: 6,
  color: "#214121",
};

const infoTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.7,
  color: "#4a5546",
};

const successBoxStyle: React.CSSProperties = {
  background: "#effbea",
  border: "1px solid #cdeac1",
  borderRadius: 18,
  padding: 16,
};

const successTitleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 18,
  marginBottom: 6,
  color: "#1f6b2b",
};

const successTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.7,
  color: "#40523e",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};

const greenButtonStyle: React.CSSProperties = {
  appearance: "none",
  border: "none",
  borderRadius: 18,
  background: "#39d353",
  color: "#08380f",
  minHeight: 60,
  padding: "0 22px",
  fontSize: 19,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(57, 211, 83, 0.24)",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 60,
  padding: "0 22px",
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #bfd8b6",
  color: "#214121",
  fontSize: 18,
  fontWeight: 700,
  textDecoration: "none",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#61715d",
};

const messageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#1f6b2b",
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#b42318",
  fontWeight: 600,
};