import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Promyk Wspomnień",
  description:
    "Tabliczka QR prowadząca do strony pamięci. Zobacz, jak wygląda produkt i jak działa po zeskanowaniu kodu.",
};

const gallery = [
  {
    src: "/mockups/mockup-1.png",
    alt: "Zbliżenie tabliczki QR Promyk Wspomnień zamocowanej na granitowym nagrobku.",
  },
  {
    src: "/mockups/mockup-2.png",
    alt: "Tabliczka QR Promyk Wspomnień na nagrobku obok zapalonego znicza.",
  },
  {
    src: "/mockups/mockup-3.png",
    alt: "Ujęcie pod kątem pokazujące stalową tabliczkę QR na pomniku.",
  },
  {
    src: "/mockups/mockup-4.png",
    alt: "Telefon skanujący tabliczkę QR Promyk Wspomnień.",
  },
  {
    src: "/mockups/mockup-5.png",
    alt: "Widok tabliczki QR i telefonu z otwartym profilem pamięci.",
  },
];

export default function HomePage() {
  return (
    <main style={page}>
      <section style={heroSection}>
        <div style={heroTextCol}>
          <span style={badge}>Tabliczka QR + strona pamięci</span>

          <h1 style={heroTitle}>
            Zachowaj wspomnienie bliskiej osoby w prosty i piękny sposób
          </h1>

          <p style={heroText}>
            Niewielka stalowa tabliczka z kodem QR prowadzi do indywidualnej strony
            pamięci. Po zeskanowaniu można zobaczyć zdjęcia, biografię, cytat i
            zapalić znicz online.
          </p>

          <div style={buttonRow}>
            <Link href="/zamow" style={primaryButton}>
              Zamów tabliczkę
            </Link>
            <Link href="/profile/maria-kowalska" style={secondaryButton}>
              Zobacz przykładowy profil
            </Link>
          </div>

          <div style={priceBox}>
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              <strong>Cena tabliczki: 60 zł</strong>
              <br />
              W cenie otrzymujesz także <strong>1 rok aktywnego profilu pamięci</strong>.
            </p>
          </div>

          <div style={trustRow}>
            <div style={trustItem}>bez aplikacji</div>
            <div style={trustItem}>działa na telefonie</div>
            <div style={trustItem}>prosta aktywacja</div>
          </div>
        </div>

        <div style={heroImageCol}>
          <div style={heroImageWrap}>
            <Image
              src="/mockups/mockup-5.png"
              alt="Tabliczka QR Promyk Wspomnień na nagrobku oraz telefon z otwartym profilem pamięci."
              fill
              sizes="(max-width: 980px) 100vw, 48vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <p style={visualNote}>Poglądowe wizualizacje produktu. Zdjęcia realnej tabliczki pojawią się wkrótce.</p>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <span style={eyebrow}>Jak wygląda produkt</span>
          <h2 style={sectionTitle}>Mała tabliczka, szybki dostęp do wspomnień</h2>
          <p style={sectionLead}>
            Tabliczka ma format około <strong>60 mm × 60 mm</strong>. Na środku znajduje się
            kod QR, a pod nim adres <strong>promykwspomnien.pl</strong>.
          </p>
        </div>

        <div style={featureGrid}>
          <div style={featureCard}>
            <div style={featureNumber}>01</div>
            <h3 style={cardTitle}>Stalowa, estetyczna forma</h3>
            <p style={cardText}>
              Prosty, nowoczesny wygląd pasuje do granitu i nie przytłacza pomnika.
            </p>
          </div>

          <div style={featureCard}>
            <div style={featureNumber}>02</div>
            <h3 style={cardTitle}>Kod QR na środku</h3>
            <p style={cardText}>
              Wystarczy skierować aparat telefonu na kod, aby otworzyć profil pamięci.
            </p>
          </div>

          <div style={featureCard}>
            <div style={featureNumber}>03</div>
            <h3 style={cardTitle}>Adres pod kodem</h3>
            <p style={cardText}>
              Nawet bez skanowania od razu widać, dokąd prowadzi tabliczka.
            </p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <span style={eyebrow}>Wizualizacje produktu</span>
          <h2 style={sectionTitle}>Tak może wyglądać tabliczka na nagrobku</h2>
          <p style={sectionLead}>
            Poniżej przykładowe ujęcia pokazujące tabliczkę z bliska, na pomniku i podczas skanowania telefonem.
          </p>
        </div>

        <div style={galleryGrid}>
          <div style={galleryMain}>
            <Image
              src={gallery[0].src}
              alt={gallery[0].alt}
              fill
              sizes="(max-width: 980px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div style={gallerySide}>
            {gallery.slice(1).map((image) => (
              <div key={image.src} style={gallerySmall}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 980px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <span style={eyebrow}>Jak to działa</span>
          <h2 style={sectionTitle}>Od tabliczki do gotowego profilu w 3 krokach</h2>
        </div>

        <div style={stepsGrid}>
          <div style={stepCard}>
            <div style={stepBadge}>1</div>
            <h3 style={cardTitle}>Zamawiasz tabliczkę</h3>
            <p style={cardText}>
              Podajesz podstawowe dane i zamawiasz gotową tabliczkę QR dla bliskiej osoby.
            </p>
          </div>
          <div style={stepCard}>
            <div style={stepBadge}>2</div>
            <h3 style={cardTitle}>Aktywujesz dostęp</h3>
            <p style={cardText}>
              Po otrzymaniu tabliczki ustawiasz hasło i przejmujesz edycję profilu.
            </p>
          </div>
          <div style={stepCard}>
            <div style={stepBadge}>3</div>
            <h3 style={cardTitle}>Dodajesz wspomnienie</h3>
            <p style={cardText}>
              Uzupełniasz zdjęcie, cytat, biografię i galerię. Rodzina może wejść po zeskanowaniu kodu.
            </p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={sectionHeader}>
          <span style={eyebrow}>Co zawiera</span>
          <h2 style={sectionTitle}>Wersja basic gotowa na start</h2>
        </div>

        <div style={benefitGrid}>
          <div style={benefitCard}>
            <h3 style={cardTitle}>Na stronie pamięci</h3>
            <ul style={list}>
              <li>zdjęcie główne</li>
              <li>cytat</li>
              <li>biografia</li>
              <li>galeria zdjęć</li>
              <li>zapal znicz</li>
            </ul>
          </div>

          <div style={benefitCard}>
            <h3 style={cardTitle}>W praktyce</h3>
            <ul style={list}>
              <li>działa na telefonie</li>
              <li>prosta edycja dla właściciela</li>
              <li>otwieranie po skanie QR</li>
              <li>1 rok aktywacji w cenie</li>
              <li>estetyczna forma przy nagrobku</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <div>
          <span style={ctaEyebrow}>Gotowe do zamówienia</span>
          <h2 style={ctaTitle}>Chcesz zobaczyć, jak to będzie wyglądało u Ciebie?</h2>
          <p style={ctaText}>
            Zamów tabliczkę QR albo zobacz przykładowy profil. W przyszłym tygodniu pojawią się też zdjęcia realnego produktu.
          </p>
        </div>

        <div style={buttonRow}>
          <Link href="/zamow" style={ctaPrimaryButton}>
            Przejdź do zamówienia
          </Link>
          <Link href="/pamiec" style={ctaSecondaryButton}>
            Zobacz aktywację właściciela
          </Link>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "32px 16px 72px",
  display: "grid",
  gap: 40,
};

const heroSection: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 28,
  alignItems: "center",
  paddingTop: 12,
};

const heroTextCol: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const heroImageCol: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "#f1ede6",
  color: "#5b4632",
  fontSize: 14,
  fontWeight: 700,
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(34px, 6vw, 60px)",
  lineHeight: 1.03,
  fontWeight: 800,
  color: "#1f2937",
};

const heroText: React.CSSProperties = {
  margin: 0,
  maxWidth: 700,
  fontSize: 18,
  lineHeight: 1.75,
  color: "#4b5563",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 14,
  background: "#1f2937",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(31,41,55,0.14)",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 14,
  background: "#ffffff",
  color: "#1f2937",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid #d6d3d1",
};

const priceBox: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid #e7e5e4",
  background: "#fcfbf8",
  padding: 18,
  maxWidth: 560,
  color: "#374151",
};

const trustRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const trustItem: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#ffffff",
  border: "1px solid #e7e5e4",
  color: "#57534e",
  fontSize: 14,
  fontWeight: 600,
};

const heroImageWrap: React.CSSProperties = {
  position: "relative",
  minHeight: 520,
  borderRadius: 28,
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
  background: "#f5f5f4",
};

const visualNote: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.6,
  color: "#78716c",
};

const section: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const sectionHeader: React.CSSProperties = {
  display: "grid",
  gap: 10,
  maxWidth: 760,
};

const eyebrow: React.CSSProperties = {
  color: "#8b5e34",
  fontWeight: 700,
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.15,
  fontWeight: 800,
  color: "#1f2937",
};

const sectionLead: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  lineHeight: 1.75,
  color: "#4b5563",
};

const featureGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const featureCard: React.CSSProperties = {
  background: "#fcfbf8",
  border: "1px solid #ece7de",
  borderRadius: 22,
  padding: 22,
  display: "grid",
  gap: 12,
};

const featureNumber: React.CSSProperties = {
  color: "#9a6b3d",
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: 1,
};

const galleryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
  gap: 16,
};

const galleryMain: React.CSSProperties = {
  position: "relative",
  minHeight: 640,
  borderRadius: 26,
  overflow: "hidden",
  background: "#f5f5f4",
};

const gallerySide: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const gallerySmall: React.CSSProperties = {
  position: "relative",
  minHeight: 312,
  borderRadius: 22,
  overflow: "hidden",
  background: "#f5f5f4",
};

const stepsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 16,
};

const stepCard: React.CSSProperties = {
  borderRadius: 24,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  padding: 22,
  display: "grid",
  gap: 12,
};

const stepBadge: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "#1f2937",
  color: "#ffffff",
  fontWeight: 800,
};

const benefitGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const benefitCard: React.CSSProperties = {
  borderRadius: 24,
  border: "1px solid #ece7de",
  background: "#fcfbf8",
  padding: 22,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.3,
  color: "#1f2937",
  fontWeight: 750,
};

const cardText: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.75,
  color: "#4b5563",
};

const list: React.CSSProperties = {
  margin: "14px 0 0",
  paddingLeft: 20,
  lineHeight: 2,
  color: "#374151",
};

const ctaSection: React.CSSProperties = {
  marginTop: 6,
  borderRadius: 32,
  padding: 28,
  background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
  color: "#ffffff",
  display: "grid",
  gap: 18,
};

const ctaEyebrow: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 10,
  color: "#d6c0a8",
  fontWeight: 700,
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const ctaTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.15,
  fontWeight: 800,
};

const ctaText: React.CSSProperties = {
  margin: "10px 0 0",
  maxWidth: 760,
  fontSize: 17,
  lineHeight: 1.75,
  color: "#e5e7eb",
};

const ctaPrimaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 14,
  background: "#ffffff",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
};

const ctaSecondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  padding: "0 18px",
  borderRadius: 14,
  background: "transparent",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.25)",
};
