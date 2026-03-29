import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Promyk Wspomnień",
  description:
    "Tabliczka QR prowadząca do strony pamięci bliskiej osoby. Proste rozwiązanie, które działa na telefonie po zeskanowaniu kodu.",
};

export default function HomePage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <div style={styles.badge}>Tabliczka QR pamięci</div>

          <h1 style={styles.h1}>
            Zachowaj pamięć o bliskiej osobie w prosty i godny sposób
          </h1>

          <p style={styles.lead}>
            Po zeskanowaniu kodu QR otwiera się strona pamięci z fotografią,
            wspomnieniem, galerią zdjęć, księgą gości i lokalizacją nagrobka.
            Wszystko działa zwyczajnie w telefonie, bez instalowania aplikacji.
          </p>

          <div style={styles.ctaRow}>
            <Link href="/profile/maria-kowalska" style={styles.primaryButton}>
              Zobacz przykładowy profil
            </Link>

            <Link href="/zamow" style={styles.secondaryButton}>
              Zamów tabliczkę
            </Link>
          </div>

          <div style={styles.priceBox}>
            <strong>Cena tabliczki: 60 zł</strong>
            <br />
            W cenie jest tabliczka oraz <strong>1 rok subskrypcji</strong>.
            <br />
            Każdy kolejny rok kosztuje <strong>maksymalnie 10 zł</strong>.
          </div>

          <p style={styles.smallInfo}>
            Profil może przedłużyć także każda osoba, która zeskanuje kod QR.
            Dzięki temu pamięć może pozostać aktywna również wtedy, gdy chce o
            nią zadbać ktoś z rodziny lub bliskich.
          </p>
        </div>

        <div style={styles.heroImageWrap}>
          <Image
            src="/mockups/mockup-1.png"
            alt="Tabliczka QR pamięci zamontowana na nagrobku"
            width={900}
            height={900}
            style={styles.heroImage}
            priority
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>To działa bardzo prosto</h2>

        <div style={styles.cards3}>
          <article style={styles.card}>
            <div style={styles.step}>1</div>
            <h3 style={styles.h3}>Zamawiasz tabliczkę</h3>
            <p style={styles.text}>
              Otrzymujesz estetyczną tabliczkę z kodem QR gotową do użycia.
            </p>
          </article>

          <article style={styles.card}>
            <div style={styles.step}>2</div>
            <h3 style={styles.h3}>Skanujesz kod telefonem</h3>
            <p style={styles.text}>
              Kod otwiera stronę pamięci w zwykłej przeglądarce.
            </p>
          </article>

          <article style={styles.card}>
            <div style={styles.step}>3</div>
            <h3 style={styles.h3}>Tworzysz pamięć</h3>
            <p style={styles.text}>
              Dodajesz zdjęcia, opis, księgę gości i lokalizację nagrobka.
            </p>
          </article>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.twoCol}>
          <div>
            <h2 style={styles.h2}>Co zawiera tabliczka</h2>

            <ul style={styles.list}>
              <li>kod QR prowadzący do strony pamięci</li>
              <li>fotografię główną</li>
              <li>wspomnienie lub cytat</li>
              <li>biografię bliskiej osoby</li>
              <li>galerię zdjęć</li>
              <li>możliwość zapalenia znicza online</li>
              <li>księgę gości</li>
              <li>lokalizację nagrobka</li>
              <li>prostą obsługę na telefonie</li>
            </ul>

            <p style={styles.text}>
              To rozwiązanie zostało pomyślane tak, aby było czytelne i wygodne
              także dla osób starszych.
            </p>
          </div>

          <div style={styles.sideImageBox}>
            <Image
              src="/mockups/mockup-4.png"
              alt="Skanowanie tabliczki QR telefonem"
              width={900}
              height={900}
              style={styles.sideImage}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Jak wygląda gotowy produkt</h2>

        <div style={styles.gallery}>
          <div style={styles.galleryItem}>
            <Image
              src="/mockups/mockup-1.png"
              alt="Tabliczka QR na nagrobku"
              width={900}
              height={900}
              style={styles.galleryImage}
            />
          </div>

          <div style={styles.galleryItem}>
            <Image
              src="/mockups/mockup-4.png"
              alt="Telefon skanujący tabliczkę QR"
              width={900}
              height={900}
              style={styles.galleryImage}
            />
          </div>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <h2 style={styles.h2}>Dlaczego to ma sens</h2>

        <div style={styles.cards3}>
          <article style={styles.card}>
            <h3 style={styles.h3}>Piękna pamiątka</h3>
            <p style={styles.text}>
              Wspomnienie nie kończy się na samym napisie na nagrobku.
            </p>
          </article>

          <article style={styles.card}>
            <h3 style={styles.h3}>Proste dla rodziny</h3>
            <p style={styles.text}>
              Nie trzeba instalować żadnej aplikacji ani zakładać konta do
              przeglądania.
            </p>
          </article>

          <article style={styles.card}>
            <h3 style={styles.h3}>Wszystko w telefonie</h3>
            <p style={styles.text}>
              Po zeskanowaniu kodu od razu otwiera się strona pamięci.
            </p>
          </article>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Najczęstsze pytania</h2>

        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <strong>Czy trzeba instalować aplikację?</strong>
            <p style={styles.faqText}>
              Nie. Strona otwiera się bezpośrednio w telefonie.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy działa na każdym smartfonie?</strong>
            <p style={styles.faqText}>
              Tak, jeśli telefon obsługuje internet i skanowanie kodów QR.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Co zawiera cena 60 zł?</strong>
            <p style={styles.faqText}>
              Cena obejmuje tabliczkę QR oraz 1 rok aktywnej strony pamięci.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Ile kosztuje przedłużenie?</strong>
            <p style={styles.faqText}>
              Każdy kolejny rok kosztuje maksymalnie 10 zł.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Kto może przedłużyć profil?</strong>
            <p style={styles.faqText}>
              Profil może przedłużyć każda osoba, która zeskanuje kod QR i
              wejdzie na stronę pamięci.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy profil ma księgę gości?</strong>
            <p style={styles.faqText}>
              Tak. Bliscy mogą zostawiać wpisy i wspomnienia na stronie pamięci.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy można dodać lokalizację nagrobka?</strong>
            <p style={styles.faqText}>
              Tak. Na profilu można umieścić lokalizację nagrobka, aby ułatwić
              odnalezienie miejsca.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy później można dodać zdjęcia i opis?</strong>
            <p style={styles.faqText}>
              Tak. Profil można uzupełniać po aktywacji.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.finalCta}>
        <h2 style={styles.finalTitle}>
          Prosty sposób, aby zachować pamięć o bliskiej osobie
        </h2>

        <p style={styles.finalText}>
          Zobacz, jak wygląda przykładowy profil albo przejdź do zamówienia.
        </p>

        <div style={styles.ctaRowCenter}>
          <Link href="/profile/maria-kowalska" style={styles.primaryButton}>
            Zobacz profil
          </Link>

          <Link href="/zamow" style={styles.secondaryButtonDark}>
            Zamów tabliczkę
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "20px 16px 56px",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 28,
    alignItems: "center",
    padding: "18px 0 40px",
  },

  heroText: {
    display: "grid",
    gap: 18,
  },

  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#efe7dd",
    color: "#5c4330",
    fontSize: 14,
    fontWeight: 700,
  },

  h1: {
    margin: 0,
    fontSize: "clamp(34px, 5vw, 56px)",
    lineHeight: 1.08,
    fontWeight: 800,
    color: "#1f1f1f",
  },

  lead: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.7,
    color: "#4a4a4a",
    maxWidth: 680,
  },

  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },

  ctaRowCenter: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    padding: "0 20px",
    borderRadius: 14,
    background: "#2f241d",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    padding: "0 20px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#2f241d",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
    border: "1px solid #d7c8ba",
  },

  secondaryButtonDark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    padding: "0 20px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#2f241d",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.45)",
  },

  priceBox: {
    marginTop: 4,
    padding: 16,
    borderRadius: 16,
    background: "#faf7f2",
    border: "1px solid #eadfce",
    fontSize: 18,
    lineHeight: 1.7,
    color: "#2f241d",
    width: "fit-content",
    maxWidth: "100%",
  },

  smallInfo: {
    margin: "4px 0 0",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#5a524b",
    maxWidth: 680,
  },

  heroImageWrap: {
    width: "100%",
  },

  heroImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 24,
    border: "1px solid #e7dfd5",
  },

  section: {
    padding: "42px 0",
  },

  sectionAlt: {
    padding: "42px 18px",
    background: "#faf7f2",
    borderRadius: 28,
  },

  h2: {
    margin: "0 0 20px",
    fontSize: "clamp(28px, 4vw, 40px)",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1f1f1f",
  },

  h3: {
    margin: "0 0 10px",
    fontSize: 24,
    lineHeight: 1.3,
    fontWeight: 700,
    color: "#1f1f1f",
  },

  text: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.7,
    color: "#4a4a4a",
  },

  cards3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #ebe3da",
    borderRadius: 22,
    padding: 22,
  },

  step: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#2f241d",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 18,
    marginBottom: 14,
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    alignItems: "center",
  },

  list: {
    margin: "0 0 18px",
    paddingLeft: 22,
    fontSize: 18,
    lineHeight: 1.9,
    color: "#2f241d",
  },

  sideImageBox: {
    width: "100%",
  },

  sideImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 24,
    border: "1px solid #e7dfd5",
  },

  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },

  galleryItem: {
    width: "100%",
  },

  galleryImage: {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 22,
    border: "1px solid #e7dfd5",
  },

  faqList: {
    display: "grid",
    gap: 14,
  },

  faqItem: {
    background: "#ffffff",
    border: "1px solid #ebe3da",
    borderRadius: 18,
    padding: 18,
    fontSize: 20,
    lineHeight: 1.5,
    color: "#1f1f1f",
  },

  faqText: {
    margin: "8px 0 0",
    fontSize: 17,
    lineHeight: 1.7,
    color: "#4a4a4a",
  },

  finalCta: {
    marginTop: 24,
    padding: "34px 20px",
    borderRadius: 28,
    background: "#2f241d",
    color: "#ffffff",
    textAlign: "center",
  },

  finalTitle: {
    margin: "0 0 12px",
    fontSize: "clamp(28px, 4vw, 40px)",
    lineHeight: 1.2,
    fontWeight: 800,
  },

  finalText: {
    margin: "0 0 20px",
    fontSize: 19,
    lineHeight: 1.7,
    color: "#f3ece5",
  },
};