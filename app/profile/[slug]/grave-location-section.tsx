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
      <div style={headerRowStyle}>
        <div style={iconWrapStyle}>📍</div>
        <div>
          <p style={eyebrowStyle}>Lokalizacja nagrobka</p>
          <p style={subtitleStyle}>Lokalizacja jest dostępna na mapie.</p>
        </div>
      </div>

      {!hasLocation ? (
        <p style={mutedTextStyle}>Lokalizacja nie została jeszcze ustawiona.</p>
      ) : (
        <div style={actionsStyle}>
          <button type="button" onClick={handleShareProfile} style={greenButtonStyle}>
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
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={secondaryButtonStyle}>
              Otwórz w Google Maps
            </a>
          )}
        </div>
      )}

      {message ? <p style={messageStyle}>{message}</p> : null}
      {error ? <p style={errorStyle}>{error}</p> : null}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: "24px",
  background: "#eef6ea",
  border: "1px solid #dbead3",
  display: "grid",
  gap: "16px",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const iconWrapStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "#3fd14f",
  color: "#0f172a",
  fontSize: 24,
  boxShadow: "0 10px 24px rgba(63, 209, 79, 0.22)",
  flexShrink: 0,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#25643a",
  fontSize: 14,
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#44524a",
  fontSize: 18,
  lineHeight: 1.5,
};

const mutedTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#44524a",
  fontSize: 16,
  lineHeight: 1.6,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
};

const greenButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 18,
  background: "#37d04a",
  color: "#072b0f",
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  minHeight: 52,
};

const secondaryButtonStyleButton: React.CSSProperties = {
  border: "1px solid #b8ccb1",
  borderRadius: 18,
  background: "#ffffff",
  color: "#173326",
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 52,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #b8ccb1",
  borderRadius: 18,
  background: "#ffffff",
  color: "#173326",
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  minHeight: 52,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const messageStyle: React.CSSProperties = {
  margin: 0,
  color: "#25643a",
  fontSize: 14,
  lineHeight: 1.6,
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: "#b42318",
  fontSize: 14,
  lineHeight: 1.6,
};
