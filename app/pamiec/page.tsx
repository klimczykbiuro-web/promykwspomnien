import Link from "next/link";
import { branding } from "@/lib/domain/branding";
import styles from "../marketing.module.css";

const steps = [
  {
    title: "Ustaw własne hasło",
    description:
      "Przy pierwszym uruchomieniu nadajesz hasło do profilu pamięci.",
  },
  {
    title: "Zapisz hasło",
    description:
      "Koniecznie zapisz je w bezpiecznym miejscu, bo będzie potrzebne przy każdej późniejszej edycji.",
  },
  {
    title: "Dodaj zdjęcia i opis",
    description:
      "Uzupełnij profil o fotografie, cytat i krótki opis bliskiej osoby. Po zapisaniu profil jest gotowy.",
  },
];

const notes = [
  "Uruchomienie profilu zajmuje tylko chwilę.",
  "Nie trzeba instalować żadnej aplikacji.",
  "Najważniejsze jest ustawienie i zapisanie hasła.",
  "Po dodaniu zdjęć i opisu profil jest gotowy dla bliskich.",
];

export default function PamiecPage() {
  return (
    <main className={styles.pageShell}>
      <div className="container page">
        <section className={styles.mobileHero}>
          <span className={styles.badgeLight}>Po zeskanowaniu kodu QR</span>
          <h1 className={styles.mobileTitle}>Profil pamięci uruchomisz w kilka chwil</h1>
          <p className={styles.mobileLead}>
            Wystarczy ustawić własne hasło, zapisać je w bezpiecznym miejscu,
            a potem dodać zdjęcia i opis. Poniżej zobaczysz, jak wygląda przykładowy profil.
          </p>
        </section>

        <section className={styles.stepsCompactGrid}>
          {steps.map((step, index) => (
            <article key={step.title} className="card card-pad">
              <div className={styles.kickerPill}>Krok {index + 1}</div>
              <h2 className={styles.cardTitle}>{step.title}</h2>
              <p className={styles.cardText}>{step.description}</p>
            </article>
          ))}
        </section>

        <section className={styles.twoColumnSection}>
          <div className="card card-pad">
            <div className={styles.exampleProfileCard}>
              <div className={styles.examplePhoto}>MK</div>
              <div className={styles.exampleUrl}>promykwspomnien.pl/profile/maria-kowalska</div>
              <p className={styles.sectionLabel}>Przykładowy profil pamięci</p>
              <h2 className={styles.sectionTitle}>Maria Kowalska</h2>
              <p className={styles.exampleYears}>1948 — 2024</p>
              <p className={styles.exampleQuote}>
                „Zostawiła po sobie ciepło, dobroć i wspomnienia, do których rodzina może wracać każdego dnia.”
              </p>
              <p className={styles.cardText}>
                Po aktywacji profilu można dodać zdjęcia, ważne słowa oraz krótki opis życia.
                To wystarczy, aby stworzyć spokojne miejsce pamięci dostępne dla bliskich po zeskanowaniu kodu QR.
              </p>
              <div className={styles.previewPills}>
                <span>Zdjęcia</span>
                <span>Cytat</span>
                <span>Biografia</span>
                <span className={styles.previewPillAccent}>Wirtualny znicz</span>
              </div>
              <div className={styles.ctaInlineRow}>
                <Link className="button" href="/profile/maria-kowalska">
                  Otwórz przykładowy profil
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>To naprawdę szybkie</p>
              <h2 className={styles.sectionTitle}>Co trzeba zrobić po pierwszym skanie</h2>
            </div>
            <div className={styles.noteList}>
              {notes.map((note) => (
                <div key={note} className={styles.noteItem}>
                  <span className={styles.noteCheck}>✓</span>
                  <p>{note}</p>
                </div>
              ))}
            </div>
            <div className={styles.passwordAlert}>
              <h3 className={styles.cardTitle}>Najważniejsze: zapisz hasło</h3>
              <p className={styles.cardText}>
                Dzięki temu w przyszłości bez problemu wrócisz do edycji profilu i wprowadzisz zmiany.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.footerCta}>
          <div>
            <p className={styles.footerLabel}>Gotowe do startu</p>
            <h2 className={styles.footerTitle}>Masz już tabliczkę lub chcesz zobaczyć więcej?</h2>
            <p className={styles.footerText}>
              Zobacz działający przykład albo wróć na stronę główną i skontaktuj się z nami,
              jeśli chcesz zamówić własną tabliczkę pamięci.
            </p>
          </div>
          <div className={styles.footerActions}>
            <Link className="button secondary" href="/profile/maria-kowalska">
              Zobacz przykład
            </Link>
            <a className="button outline" href={`mailto:${branding.supportEmail}`}>
              Zamów tabliczkę
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
