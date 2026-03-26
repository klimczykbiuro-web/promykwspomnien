import Link from "next/link";
import { branding } from "@/lib/domain/branding";
import styles from "./marketing.module.css";
import { recordPageView } from "@/lib/analytics/views";

await recordPageView({
  pageType: "home",
  path: "/",
});

const features = [
  {
    title: "Zdjęcia i wspomnienia",
    description:
      "Na stronie pamięci można umieścić fotografię, cytat i krótki opis życia bliskiej osoby.",
  },
  {
    title: "Wirtualny znicz",
    description:
      "Rodzina i bliscy mogą wracać do profilu w każdej chwili i zapalić symboliczny znicz online.",
  },
  {
    title: "Kod QR na tabliczce",
    description:
      "Po zeskanowaniu kodu telefonem strona pamięci otwiera się od razu w przeglądarce, bez instalowania aplikacji.",
  },
  {
    title: "Dostęp właściciela",
    description:
      "Właściciel uruchamia profil, ustawia hasło i może samodzielnie dodawać zdjęcia oraz treści.",
  },
];

const steps = [
  {
    number: "01",
    title: "Zamawiasz tabliczkę",
    description:
      "Otrzymujesz tabliczkę 60 × 60 mm ze stali nierdzewnej z indywidualnym kodem QR.",
  },
  {
    number: "02",
    title: "Aktywujesz profil",
    description:
      "Przy pierwszym uruchomieniu ustawiasz własne hasło, zapisujesz je i uzupełniasz podstawowe treści.",
  },
  {
    number: "03",
    title: "Bliscy wracają do wspomnień",
    description:
      "Każdy może zeskanować kod i wejść na stronę pamięci, aby zobaczyć zdjęcia, opis i zapalić wirtualny znicz.",
  },
];

const packageItems = [
  "tabliczka 60 × 60 mm ze stali nierdzewnej",
  "indywidualny kod QR",
  "strona pamięci dostępna na telefonie",
  "zdjęcie, cytat i biografia",
  "wirtualny znicz",
  "bezpieczny dostęp właściciela",
];

const faqs = [
  {
    question: "Czy trzeba instalować aplikację?",
    answer:
      "Nie. Wystarczy zwykły telefon z aparatem. Po zeskanowaniu kodu QR profil otwiera się w przeglądarce.",
  },
  {
    question: "Jak wygląda uruchomienie profilu?",
    answer:
      "To bardzo szybkie. Przy pierwszym wejściu ustawiasz hasło, zapisujesz je w bezpiecznym miejscu, a potem dodajesz zdjęcia i opis.",
  },
  {
    question: "Czy później mogę edytować treść?",
    answer:
      "Tak. Właściciel profilu może w każdej chwili wrócić do edycji, logując się swoim hasłem.",
  },
  {
    question: "Jak wygląda sama tabliczka?",
    answer:
      "Tabliczka ma wymiar 60 × 60 mm i jest wykonana ze stali nierdzewnej. Dzięki temu estetycznie komponuje się z nagrobkiem i jest wygodna do zeskanowania.",
  },
];

function telHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export default function HomePage() {
  return (
    <main className={styles.pageShell}>
      <div className="container page">
        <section className={styles.heroCard}>
          <div className={styles.heroText}>
            <span className={styles.badge}>Promyk Wspomnień</span>
            <h1 className={styles.heroTitle}>
              Zachowaj wspomnienia bliskiej osoby w miejscu, do którego rodzina może wracać.
            </h1>
            <p className={styles.heroLead}>
              Niewielka tabliczka z kodem QR prowadzi do strony pamięci, na której zostają
              zdjęcia, ważne słowa i historia życia. To spokojna forma zachowania pamięci
              dostępna dla bliskich dziś i w kolejnych latach.
            </p>

            <div className={styles.heroActions}>
              <a className="button" href={`mailto:${branding.supportEmail}`}>
                Zamów tabliczkę
              </a>
              <Link className="button secondary" href="/pamiec">
                Jak to działa
              </Link>
              <Link className="button outline" href="/profile/maria-kowalska">
                Zobacz przykład
              </Link>
            </div>

            <div className={styles.heroMeta}>
              <span>bez aplikacji</span>
              <span>telefon + kod QR</span>
              <span>zdjęcia, opis i znicz</span>
            </div>
          </div>

          <div className={styles.heroVisualWrap}>
            <div className={styles.phoneFrame}>
              <div className={styles.profilePreview}>
                <div className={styles.profilePhoto}>MK</div>
                <p className={styles.previewEyebrow}>Przykładowy profil pamięci</p>
                <h2 className={styles.previewName}>Maria Kowalska</h2>
                <p className={styles.previewYears}>1948 — 2024</p>
                <p className={styles.previewQuote}>
                  „Zostawiła po sobie ciepło, dobroć i wspomnienia, do których rodzina może wracać każdego dnia.”
                </p>
                <div className={styles.previewPills}>
                  <span>Zdjęcia</span>
                  <span>Cytat</span>
                  <span>Biografia</span>
                  <span className={styles.previewPillAccent}>Znicz</span>
                </div>
              </div>
            </div>
            <div className={styles.plaqueCard}>
              <div className={styles.plaqueStone}>
                <div className={styles.plaqueTile}>
                  <span>QR</span>
                </div>
              </div>
              <p className={styles.plaqueCaption}>Tabliczka 60 × 60 mm ze stali nierdzewnej</p>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Dlaczego to ważne</p>
            <h2 className={styles.sectionTitle}>
              Więcej niż tabliczka — miejsce, w którym zostaje czyjaś historia.
            </h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article key={feature.title} className="card card-pad">
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.twoColumnSection}>
          <div className="card card-pad">
            <p className={styles.sectionLabel}>Jak to działa</p>
            <h2 className={styles.sectionTitle}>Od zamówienia do gotowej strony pamięci w 3 prostych krokach.</h2>
            <div className={styles.stepList}>
              {steps.map((step) => (
                <div key={step.number} className={styles.stepItem}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <p className={styles.cardText}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.darkPanel}>
            <span className={styles.darkBadge}>Kompletny produkt</span>
            <h2 className={styles.darkTitle}>Co zawiera pakiet?</h2>
            <p className={styles.darkText}>
              Otrzymujesz gotową tabliczkę z kodem QR i stronę pamięci, którą można szybko uruchomić.
            </p>
            <ul className={styles.checkList}>
              {packageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className={styles.noticeBox}>
              Najważniejszy krok po aktywacji to ustawienie własnego hasła i zapisanie go w bezpiecznym miejscu.
            </div>
          </div>
        </section>

        <section className={styles.twoColumnSection}>
          <div className="card card-pad">
            <p className={styles.sectionLabel}>Przykładowy profil</p>
            <h2 className={styles.sectionTitle}>Zobacz, jak wygląda gotowa strona pamięci.</h2>
            <p className={styles.cardText}>
              Przygotowaliśmy działający przykład profilu, abyś mógł zobaczyć efekt końcowy jeszcze przed zamówieniem.
            </p>
            <div className={styles.ctaInlineRow}>
              <Link className="button" href="/profile/maria-kowalska">
                Otwórz profil Marii Kowalskiej
              </Link>
              <Link className="button outline" href="/pamiec">
                Zobacz instrukcję uruchomienia
              </Link>
            </div>
          </div>

          <div className="card card-pad">
            <p className={styles.sectionLabel}>Kontakt</p>
            <h2 className={styles.sectionTitle}>Chcesz zamówić tabliczkę?</h2>
            <p className={styles.cardText}>
              Skontaktuj się z nami mailowo lub telefonicznie. Przeprowadzimy Cię przez zamówienie i uruchomienie profilu.
            </p>
            <div className={styles.contactBlock}>
              <a href={`mailto:${branding.supportEmail}`}>{branding.supportEmail}</a>
              <a href={telHref(branding.supportPhone)}>{branding.supportPhone}</a>
            </div>
          </div>
        </section>

        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeadingCentered}>
            <p className={styles.sectionLabel}>Najczęstsze pytania</p>
            <h2 className={styles.sectionTitle}>Odpowiedzi przed zamówieniem</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <article key={faq.question} className="card card-pad">
                <h3 className={styles.cardTitle}>{faq.question}</h3>
                <p className={styles.cardText}>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.footerCta}>
          <div>
            <p className={styles.footerLabel}>Gotowe do zamówienia</p>
            <h2 className={styles.footerTitle}>
              Chcesz stworzyć miejsce pamięci, do którego bliscy będą mogli wracać?
            </h2>
            <p className={styles.footerText}>
              Zamów tabliczkę z kodem QR i zachowaj zdjęcia, słowa oraz wspomnienia w formie,
              która pozostanie blisko rodziny każdego dnia.
            </p>
          </div>
          <div className={styles.footerActions}>
            <a className="button secondary" href={`mailto:${branding.supportEmail}`}>
              Zamów teraz
            </a>
            <a className="button outline" href={telHref(branding.supportPhone)}>
              Zadzwoń
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
