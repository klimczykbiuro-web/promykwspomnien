import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Pamięć | Promyk Wspomnień",
  description:
    "Zobacz, jak działa profil pamięci po zeskanowaniu tabliczki QR i co można na nim dodać.",
};

export default function MemoryPage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div style={styles.heroText}>
          <div style={styles.badge}>Jak działa pamięć</div>

          <h1 style={styles.h1}>
            Po zeskanowaniu kodu QR otwiera się strona pamięci bliskiej osoby
          </h1>

          <p style={styles.lead}>
            To proste rozwiązanie, które działa w telefonie bez instalowania
            aplikacji. Po aktywacji można dodać zdjęcia, wspomnienie, księgę
            gości oraz lokalizację nagrobka.
          </p>

          <div style={styles.ctaRow}>
            <Link href="/profile/maria-kowalska" style={styles.primaryButton}>
              Zobacz przykładowy profil
            </Link>

            <Link href="/zamow" style={styles.secondaryButton}>
              Zamów tabliczkę
            </Link>
          </div>
        </div>

        <div style={styles.heroImageWrap}>
          <Image
            src="/mockups/mockup-4.png"
            alt="Skanowanie tabliczki QR telefonem"
            width={900}
            height={900}
            style={styles.heroImage}
            priority
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Jak uruchomić profil pamięci</h2>

        <div style={styles.cards4}>
          <article style={styles.card}>
            <div style={styles.step}>1</div>
            <h3 style={styles.h3}>Skanujesz kod QR</h3>
            <p style={styles.text}>
              Kod z tabliczki otwiera stronę pamięci w zwykłej przeglądarce.
            </p>
          </article>

          <article style={styles.card}>
            <div style={styles.step}>2</div>
            <h3 style={styles.h3}>Ustawiasz hasło</h3>
            <p style={styles.text}>
              Przy pierwszym uruchomieniu ustawiasz hasło do zarządzania
              profilem.
            </p>
          </article>

          <article style={styles.card}>
            <div style={styles.step}>3</div>
            <h3 style={styles.h3}>Dodajesz treść</h3>
            <p style={styles.text}>
              Uzupełniasz zdjęcie, opis, księgę gości i lokalizację nagrobka.
            </p>
          </article>

          <article style={styles.card}>
            <div style={styles.step}>4</div>
            <h3 style={styles.h3}>Profil jest gotowy</h3>
            <p style={styles.text}>
              Od tej chwili każda osoba po zeskanowaniu kodu zobaczy stronę
              pamięci.
            </p>
          </article>
        </div>
      </section>

      <section style={styles.sectionAlt}>
        <div style={styles.twoCol}>
          <div>
            <h2 style={styles.h2}>Co można dodać na profilu</h2>

            <ul style={styles.list}>
              <li>fotografię główną</li>
              <li>cytat lub krótkie wspomnienie</li>
              <li>biografię bliskiej osoby</li>
              <li>galerię zdjęć</li>
              <li>możliwość zapalenia znicza online</li>
              <li>księgę gości</li>
              <li>lokalizację nagrobka</li>
            </ul>

            <p style={styles.text}>
              Profil został zaprojektowany tak, aby był czytelny i prosty w
              obsłudze także dla osób starszych.
            </p>
          </div>

          <div style={styles.sideImageBox}>
            <Image
              src="/mockups/mockup-1.png"
              alt="Tabliczka QR pamięci na nagrobku"
              width={900}
              height={900}
              style={styles.sideImage}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Ważne informacje</h2>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <strong style={styles.infoTitle}>Cena tabliczki: 60 zł</strong>
            <p style={styles.infoText}>
              W cenie jest tabliczka oraz 1 rok subskrypcji profilu pamięci.
            </p>
          </div>

          <div style={styles.infoBox}>
            <strong style={styles.infoTitle}>Przedłużenie maksymalnie 10 zł</strong>
            <p style={styles.infoText}>
              Każdy kolejny rok kosztuje maksymalnie 10 zł.
            </p>
          </div>

          <div style={styles.infoBox}>
            <strong style={styles.infoTitle}>
              Profil może przedłużyć także inna osoba
            </strong>
            <p style={styles.infoText}>
              Każda osoba, która zeskanuje kod QR i wejdzie na stronę pamięci,
              może później przedłużyć profil.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Najczęstsze pytania</h2>

        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <strong>Czy trzeba instalować aplikację?</strong>
            <p style={styles.faqText}>
              Nie. Strona pamięci działa w zwykłej przeglądarce telefonu.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy mogę później edytować profil?</strong>
            <p style={styles.faqText}>
              Tak. Po aktywacji możesz dodawać i zmieniać treści na profilu.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy można dodać księgę gości?</strong>
            <p style={styles.faqText}>
              Tak. Bliscy mogą zostawiać wpisy i wspomnienia.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy można dodać lokalizację nagrobka?</strong>
            <p style={styles.faqText}>
              Tak. Na profilu można pokazać lokalizację miejsca.
            </p>
          </div>

          <div style={styles.faqItem}>
            <strong>Czy trzeba zapisać hasło?</strong>
            <p style={styles.faqText}>
              Tak. Warto zapisać hasło od razu po pierwszej aktywacji.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.finalCta}>
        <h2 style={styles.finalTitle}>
          Gotowe do uruchomienia w kilka prostych kroków
        </h2>

        <p style={styles.finalText}>
          Zobacz przykładowy profil albo przejdź do zamówienia tabliczki.
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
    fontSize: "clamp(34px, 5vw, 54px)",
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

  cards4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },

  infoBox: {
    background: "#faf7f2",
    border: "1px solid #eadfce",
    borderRadius: 20,
    padding: 20,
  },

  infoTitle: {
    display: "block",
    fontSize: 20,
    lineHeight: 1.4,
    color: "#2f241d",
    marginBottom: 8,
  },

  infoText: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.7,
    color: "#5a524b",
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