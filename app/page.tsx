import Link from "next/link";

export const metadata = {
  title: "Promyk Wspomnień",
  description:
    "Tabliczka QR z dostępem do strony pamięci. Zamów tabliczkę za 60 zł, w cenie 1 rok subskrypcji.",
};

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 64px" }}>
      <section
        style={{
          padding: "40px 0 24px",
          display: "grid",
          gap: 20,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "fit-content",
            padding: "8px 12px",
            borderRadius: 999,
            background: "#f3f4f6",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Tabliczka QR + strona pamięci
        </span>

        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 56px)",
            lineHeight: 1.05,
            margin: 0,
            fontWeight: 800,
          }}
        >
          Cyfrowa pamięć bliskich dostępna po zeskanowaniu tabliczki QR
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            maxWidth: 760,
            margin: 0,
            color: "#374151",
          }}
        >
          Zamów tabliczkę QR prowadzącą do indywidualnej strony pamięci. Dodaj zdjęcie,
          cytat, biografię, galerię i możliwość zapalenia znicza online.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <Link href="/zamow" style={primaryButton}>
            Zamów tabliczkę
          </Link>

          <Link href="/profile/maria-kowalska" style={secondaryButton}>
            Zobacz przykładowy profil
          </Link>
        </div>

        <div
          style={{
            marginTop: 8,
            padding: 16,
            borderRadius: 16,
            background: "#fafafa",
            border: "1px solid #e5e7eb",
            maxWidth: 760,
          }}
        >
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7 }}>
            <strong>Cena tabliczki: 60 zł</strong>
            <br />
            W cenie otrzymujesz także <strong>1 rok subskrypcji</strong> profilu pamięci.
          </p>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={sectionTitle}>Jak to działa</h2>

        <div style={grid3}>
          <div style={card}>
            <div style={stepBadge}>1</div>
            <h3 style={cardTitle}>Zamawiasz tabliczkę</h3>
            <p style={cardText}>
              Wypełniasz formularz, opłacasz zamówienie i przekazujesz dane potrzebne do realizacji.
            </p>
          </div>

          <div style={card}>
            <div style={stepBadge}>2</div>
            <h3 style={cardTitle}>Otrzymujesz tabliczkę QR</h3>
            <p style={cardText}>
              Tabliczka prowadzi do indywidualnej strony pamięci dostępnej po zeskanowaniu kodu.
            </p>
          </div>

          <div style={card}>
            <div style={stepBadge}>3</div>
            <h3 style={cardTitle}>Uzupełniasz wspomnienie</h3>
            <p style={cardText}>
              Dodajesz zdjęcie, cytat, biografię oraz galerię. Na profilu można też zapalić znicz.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={sectionTitle}>Co zawiera wersja basic</h2>

        <div style={grid2}>
          <div style={card}>
            <ul style={list}>
              <li>tabliczka QR</li>
              <li>1 rok aktywnego profilu pamięci</li>
              <li>zdjęcie główne</li>
              <li>cytat</li>
              <li>biografia</li>
            </ul>
          </div>

          <div style={card}>
            <ul style={list}>
              <li>galeria zdjęć</li>
              <li>funkcja „zapal znicz”</li>
              <li>edycja przez właściciela po aktywacji</li>
              <li>działanie na telefonie</li>
              <li>prosty dostęp po zeskanowaniu kodu</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={sectionTitle}>Dlaczego to ma sens</h2>

        <div style={grid3}>
          <div style={card}>
            <h3 style={cardTitle}>Proste dla rodziny</h3>
            <p style={cardText}>
              Bez aplikacji i bez skomplikowanej obsługi. Wystarczy zeskanować kod telefonem.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Piękna pamiątka</h3>
            <p style={cardText}>
              Na profilu można zachować zdjęcia, wspomnienie i najważniejsze informacje o bliskiej osobie.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>Bezpieczna edycja</h3>
            <p style={cardText}>
              Właściciel aktywuje dostęp i samodzielnie uzupełnia treść profilu.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "32px 0",
          display: "grid",
          gap: 16,
        }}
      >
        <h2 style={sectionTitle}>Najczęstsze pytania</h2>

        <div style={faqItem}>
          <strong>Czy trzeba instalować aplikację?</strong>
          <p style={faqText}>Nie. Profil otwiera się w zwykłej przeglądarce w telefonie.</p>
        </div>

        <div style={faqItem}>
          <strong>Czy działa na każdym telefonie?</strong>
          <p style={faqText}>
            Tak, jeśli telefon potrafi otwierać strony internetowe i skanować kody QR.
          </p>
        </div>

        <div style={faqItem}>
          <strong>Co zawiera cena 60 zł?</strong>
          <p style={faqText}>
            Cena obejmuje tabliczkę QR oraz 1 rok aktywnej strony pamięci.
          </p>
        </div>

        <div style={faqItem}>
          <strong>Co jeśli zapomnę hasła?</strong>
          <p style={faqText}>
            Dostęp właściciela można później obsłużyć przez pomoc operatora.
          </p>
        </div>
      </section>

      <section
        style={{
          marginTop: 24,
          padding: 24,
          borderRadius: 24,
          background: "#111827",
          color: "white",
          display: "grid",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 30 }}>Gotowe do zamówienia</h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "#e5e7eb" }}>
          Zamów tabliczkę QR za 60 zł. W tej cenie otrzymujesz również 1 rok subskrypcji profilu pamięci.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <Link href="/zamow" style={darkButton}>
            Przejdź do zamówienia
          </Link>

          <Link href="/pamiec" style={lightOutlineButton}>
            Zobacz jak wygląda aktywacja
          </Link>
        </div>
      </section>
    </main>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 28,
  margin: "0 0 20px",
  fontWeight: 800,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 20,
  background: "white",
};

const cardTitle: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 20,
  fontWeight: 700,
};

const cardText: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#4b5563",
};

const stepBadge: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  marginBottom: 12,
};

const list: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 2,
  fontSize: 16,
};

const faqItem: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fafafa",
};

const faqText: React.CSSProperties = {
  margin: "8px 0 0",
  lineHeight: 1.7,
  color: "#4b5563",
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  padding: "0 18px",
  borderRadius: 12,
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  padding: "0 18px",
  borderRadius: 12,
  background: "white",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid #d1d5db",
};

const darkButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  padding: "0 18px",
  borderRadius: 12,
  background: "white",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
};

const lightOutlineButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  padding: "0 18px",
  borderRadius: 12,
  background: "transparent",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.25)",
};