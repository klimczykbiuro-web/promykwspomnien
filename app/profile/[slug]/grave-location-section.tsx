"use client";

import { useMemo, useState } from "react";
import styles from "./profile.module.css";

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
      "Jeśli teraz naciśniesz OK, oznacza to, że w tym miejscu znajduje się nagrobek i do niego będzie prowadził przycisk lokalizacji."
    );

    if (!confirmed) {
      return;
    }

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

    const shareText = `Lokalizacja nagrobka: ${fullName}`;
    const shareData = {
      title: `Lokalizacja nagrobka — ${fullName}`,
      text: shareText,
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
    <section className={styles.locationCard}>
      <div className={styles.locationInner}>
        <p className={styles.locationEyebrow}>Lokalizacja nagrobka</p>
        <h2 className={styles.locationTitle}>Ułatw rodzinie odnalezienie miejsca</h2>

        {!hasLocation ? (
          <>
            <p className={styles.locationText}>
              Jeśli jesteś teraz przy nagrobku, możesz zapisać jego dokładną
              lokalizację. Po zapisaniu przycisk zmieni się na udostępnianie.
            </p>

            <div className={styles.locationActions}>
              <button
                type="button"
                onClick={handleSetLocation}
                disabled={isSaving}
                className={styles.locationButton}
              >
                {isSaving ? "Ustawianie lokalizacji..." : "Ustaw lokalizację nagrobka"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.locationText}>
              Lokalizacja została już ustawiona. Możesz ją teraz udostępnić
              rodzinie lub bliskim.
            </p>

            <div className={styles.locationActions}>
              <button
                type="button"
                onClick={handleShare}
                className={styles.locationButton}
              >
                Udostępnij lokalizację
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.locationButtonSecondary}
              >
                Otwórz w Google Maps
              </a>
            </div>

            <p className={styles.locationHint}>
              Na telefonie otworzy się systemowe udostępnianie — tam można wybrać
              np. SMS, WhatsApp, Messenger i inne dostępne aplikacje.
            </p>
          </>
        )}

        {message ? <p className={styles.locationMessage}>{message}</p> : null}
        {error ? <p className={styles.locationError}>{error}</p> : null}
      </div>
    </section>
  );
}