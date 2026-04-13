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
  const [isLocationVisible, setIsLocationVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasLocation =
    initialLatitude !== null &&
    initialLongitude !== null &&
    Number.isFinite(initialLatitude) &&
    Number.isFinite(initialLongitude);

  const mapsUrl = useMemo(() => {
    if (!hasLocation || initialLatitude === null || initialLongitude === null) {
      return "";
    }

    return buildMapsUrl(initialLatitude, initialLongitude);
  }, [hasLocation, initialLatitude, initialLongitude]);

  async function handleShareProfile() {
    setError("");
    setMessage("");

    const profileUrl = `${window.location.origin}/profile/${slug}`;

    const shareData = {
      title: `Profil pamięci — ${fullName}`,
      text: `Profil pamięci: ${fullName}`,
      url: profileUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(profileUrl);
      setMessage("Link do profilu został skopiowany.");
    } catch {
      setError("Nie udało się udostępnić profilu.");
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
            Udostępnij najpierw profil pamięci. Osoba, która otworzy profil,
            będzie mogła przejść do lokalizacji nagrobka z tego miejsca.
          </p>
        </div>
      </div>

      <div style={contentBoxStyle}>
        {!hasLocation ? (
          <div style={infoBoxStyle}>
            <strong style={infoTitleStyle}>Lokalizacja nie została jeszcze ustawiona</strong>
            <p style={infoTextStyle}>
              Właściciel profilu może dodać lokalizację nagrobka po zalogowaniu
              się do panelu właściciela.
            </p>
          </div>
        ) : (
          <>
            <div style={successBoxStyle}>
              <strong style={successTitleStyle}>Lokalizacja jest dostępna</strong>
              <p style={successTextStyle}>
                Najpierw możesz udostępnić link do profilu. Po wejściu na profil
                druga osoba kliknie przycisk i otworzy trasę w Google Maps.
              </p>
            </div>

            <div style={actionsStyle}>
              <button
                type="button"
                onClick={handleShareProfile}
                style={greenButtonStyle}
              >
                Udostępnij profil
              </button>

              {!isLocationVisible ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setIsLocationVisible(true);
                  }}
                  style={secondaryButtonStyleButton}
                >
                  Pokaż lokalizację
                </button>
              ) : (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={secondaryButtonStyle}
                >
                  Otwórz w Google Maps
                </a>
              )}
            </div>

            <p style={hintStyle}>
              Dzięki temu lokalizacja nie jest wysyłana osobno — najpierw trzeba
              wejść na profil pamięci.
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
  boxShadow: "0 12px 28px rgba(57, 211, 83, 0.24)",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 60,
  padding: "0 22px",
  borderRadius: 18,
  background: "#ffffff",
  border: "1px solid #bed7b4",
  color: "#214121",
  fontSize: 18,
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryButtonStyleButton: React.CSSProperties = {
  ...secondaryButtonStyle,
  cursor: "pointer",
};

const hintStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.7,
  color: "#61705c",
};

const messageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#146c2e",
  fontWeight: 700,
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#c62828",
  fontWeight: 700,
};
