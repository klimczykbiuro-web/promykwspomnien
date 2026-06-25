import Link from "next/link";

export const metadata = {
  title: "Regulamin sklepu internetowego | Promyk Wspomnień",
  description:
    "Regulamin sklepu internetowego Promyk Wspomnień, sprzedaży tabliczek QR i świadczenia usług profilu pamięci.",
};

const company = {
  name: "Clima Patryk Klimczyk",
  address: "Jaskrów ul.Częstochowska 70 42-244",
  nip: "9492195438",
  regon: "243379681",
  email: "klimczykbiuro@gmail.com",
  phone: "533178176",
};

const lastUpdated = "25.06.2026";

const sections = [
  {
    title: "§ 1. Postanowienia ogólne",
    body: [
      `Niniejszy regulamin określa zasady składania zamówień, sprzedaży produktów oraz świadczenia usług drogą elektroniczną za pośrednictwem sklepu internetowego Promyk Wspomnień dostępnego pod adresem https://promykwspomnien.pl.`,
      `Sprzedawcą i usługodawcą jest ${company.name}, z siedzibą pod adresem: ${company.address}, NIP: ${company.nip}, REGON: ${company.regon}, adres e-mail: ${company.email}, telefon: ${company.phone}.`,
      `Kontakt ze Sprzedawcą jest możliwy pod adresem e-mail: ${company.email} oraz telefonicznie pod numerem: ${company.phone}.`,
      `Regulamin jest dostępny nieodpłatnie na stronie sklepu w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie.`,
      `Klient przed złożeniem zamówienia jest zobowiązany zapoznać się z Regulaminem oraz Polityką prywatności.`,
    ],
  },
  {
    title: "§ 2. Definicje",
    body: [
      `Sklep – sklep internetowy i serwis Promyk Wspomnień dostępny pod adresem https://promykwspomnien.pl.`,
      `Sprzedawca – podmiot wskazany w § 1 ust. 2 Regulaminu.`,
      `Klient – osoba fizyczna, osoba prawna albo jednostka organizacyjna składająca zamówienie lub korzystająca ze Sklepu.`,
      `Konsument – osoba fizyczna dokonująca ze Sprzedawcą czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.`,
      `Produkt – fizyczna tabliczka z kodem QR prowadzącym do profilu pamięci w serwisie Promyk Wspomnień.`,
      `Profil pamięci – cyfrowa strona pamięci dostępna online po zeskanowaniu kodu QR lub wejściu na odpowiedni adres internetowy.`,
      `Usługa cyfrowa – usługa polegająca na udostępnieniu, aktywacji, edycji, przechowywaniu i przedłużaniu profilu pamięci.`,
      `Właściciel profilu – osoba, która aktywowała profil pamięci i ustawiła hasło do zarządzania profilem.`,
    ],
  },
  {
    title: "§ 3. Produkty i usługi",
    body: [
      `Sklep umożliwia zakup tabliczki z kodem QR, która prowadzi do profilu pamięci osoby zmarłej.`,
      `Cena produktu obejmuje tabliczkę z kodem QR oraz dostęp do podstawowego profilu pamięci przez okres wskazany w opisie produktu.`,
      `Profil pamięci może zawierać w szczególności imię i nazwisko osoby upamiętnianej, zdjęcie, cytat, wspomnienie, galerię zdjęć, wirtualny znicz, księgę gości oraz lokalizację grobu, zależnie od aktualnie dostępnych funkcji.`,
      `Klient lub Właściciel profilu może uzupełniać i edytować treści profilu po jego aktywacji.`,
      `Dostęp do profilu pamięci może zostać przedłużony poprzez zakup przedłużenia ważności profilu na okres wskazany w ofercie.`,
    ],
  },
  {
    title: "§ 4. Składanie zamówień",
    body: [
      `Zamówienia można składać za pośrednictwem formularza dostępnego na stronie Sklepu.`,
      `W celu złożenia zamówienia Klient powinien podać dane wymagane w formularzu zamówienia, zaakceptować Regulamin oraz Politykę prywatności i dokonać płatności.`,
      `Przed złożeniem zamówienia Klient otrzymuje informację o głównych cechach produktu, cenie, kosztach dostawy, sposobie płatności oraz sposobie realizacji zamówienia.`,
      `Złożenie zamówienia oznacza obowiązek zapłaty.`,
      `Sprzedawca może skontaktować się z Klientem w celu doprecyzowania danych potrzebnych do realizacji zamówienia.`,
    ],
  },
  {
    title: "§ 5. Ceny i płatności",
    body: [
      `Wszystkie ceny podane w Sklepie są cenami brutto i są wyrażone w złotych polskich.`,
      `Dostępne metody płatności są prezentowane Klientowi podczas składania zamówienia.`,
      `Płatności elektroniczne w Sklepie obsługiwane są za pośrednictwem systemu Przelewy24.`,
      `Operatorem płatności jest PayPro S.A. z siedzibą w Poznaniu przy ul. Pastelowej 8, 60-198 Poznań, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS 0000347935, NIP 7792369887, REGON 301345068.`,
      `W przypadku aktywacji płatności kartami operatorem kart płatniczych jest PayPro S.A. Agent Rozliczeniowy, ul. Pastelowa 8, 60-198 Poznań, wpisany do Rejestru Przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy Poznań Nowe Miasto i Wilda w Poznaniu, VIII Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem KRS 0000347935, NIP 7792369887, REGON 301345068.`,
      `Zamówienie jest realizowane po otrzymaniu potwierdzenia płatności.`,
    ],
  },
  {
    title: "§ 6. Realizacja zamówienia i dostawa",
    body: [
      `Produkt fizyczny jest przygotowywany i wysyłany na adres podany przez Klienta w formularzu zamówienia.`,
      `Termin realizacji zamówienia wynosi do 7 dni roboczych od potwierdzenia płatności, chyba że w opisie produktu lub w kontakcie z Klientem wskazano inny termin.`,
      `Dostępne formy dostawy oraz ich koszty są prezentowane Klientowi przed złożeniem zamówienia.`,
      `W przypadku braku możliwości realizacji zamówienia Sprzedawca skontaktuje się z Klientem w celu ustalenia dalszego sposobu postępowania.`,
      `Sprzedawca nie ponosi odpowiedzialności za opóźnienia wynikające z podania przez Klienta nieprawidłowych lub niepełnych danych do wysyłki.`,
    ],
  },
  {
    title: "§ 7. Aktywacja profilu pamięci",
    body: [
      `Po otrzymaniu tabliczki z kodem QR Klient lub osoba uprawniona może aktywować profil pamięci poprzez zeskanowanie kodu QR.`,
      `Przy pierwszej aktywacji profilu użytkownik ustawia hasło właściciela profilu.`,
      `Osoba, która ustawi hasło właściciela profilu, odpowiada za zachowanie hasła w poufności.`,
      `Sprzedawca nie odpowiada za skutki udostępnienia hasła osobom trzecim przez Właściciela profilu.`,
      `Sprzedawca może usuwać, ukrywać lub blokować treści bezprawne, naruszające dobra osobiste, prawa osób trzecich, dobre obyczaje albo charakter serwisu.`,
    ],
  },
  {
    title: "§ 8. Przedłużenie ważności profilu",
    body: [
      `Profil pamięci jest aktywny przez okres wskazany przy zakupie lub przedłużeniu.`,
      `Każda osoba posiadająca link do profilu może opłacić przedłużenie ważności profilu.`,
      `Przedłużenie profilu jest usługą cyfrową i zostaje wykonane po potwierdzeniu płatności.`,
      `Ceny i okresy przedłużenia są wskazane na stronie przed dokonaniem płatności.`,
      `Po upływie okresu ważności profilu jego pełna zawartość może zostać ograniczona zgodnie z informacjami prezentowanymi w serwisie.`,
    ],
  },
  {
    title: "§ 9. Treści dodawane przez użytkowników",
    body: [
      `Właściciel profilu lub inny użytkownik dodający treści oświadcza, że posiada prawo do korzystania z zamieszczanych materiałów i ich publikacji w serwisie.`,
      `Zakazane jest dodawanie treści niezgodnych z prawem, naruszających dobra osobiste, prywatność, wizerunek, prawa autorskie, prawa osób trzecich, a także treści obraźliwych, wulgarnych, nawołujących do nienawiści lub przemocy.`,
      `Zakazane jest dodawanie treści pornograficznych, nielegalnych lub przedstawiających seksualne wykorzystywanie małoletnich oraz innych materiałów zabronionych przez prawo.`,
      `W przypadku zdjęć przedstawiających osoby żyjące użytkownik oświadcza, że posiada wymaganą zgodę na ich publikację, o ile taka zgoda jest wymagana.`,
      `Sprzedawca może usunąć, ukryć lub zablokować treści naruszające Regulamin, prawo lub prawa osób trzecich.`,
    ],
  },
  {
    title: "§ 10. Zgłaszanie naruszeń i moderacja",
    body: [
      `Każda osoba może zgłosić Sprzedawcy zdjęcie, opis lub inną treść, która narusza prawo, prawa osób trzecich, prywatność, wizerunek albo jest treścią nielegalną lub nieodpowiednią.`,
      `Zgłoszenie powinno zawierać możliwie dokładne wskazanie treści, opis naruszenia oraz dane kontaktowe zgłaszającego, jeśli oczekuje odpowiedzi.`,
      `Sprzedawca może tymczasowo ukryć treść do czasu wyjaśnienia sprawy, usunąć treść lub zablokować możliwość dalszego dodawania treści.`,
      `W przypadku uzasadnionego podejrzenia popełnienia przestępstwa Sprzedawca może zabezpieczyć niezbędne informacje i przekazać sprawę właściwym organom.`,
    ],
  },
  {
    title: "§ 11. Reklamacje",
    body: [
      `Klient ma prawo złożyć reklamację dotyczącą produktu, usługi lub działania Sklepu.`,
      `Reklamację można złożyć mailowo na adres: ${company.email}.`,
      `Reklamacja powinna zawierać dane umożliwiające identyfikację zamówienia, opis problemu oraz oczekiwany sposób rozwiązania sprawy.`,
      `Sprzedawca rozpatruje reklamację w terminie 14 dni od dnia jej otrzymania.`,
      `Jeśli reklamacja wymaga uzupełnienia informacji, Sprzedawca może poprosić Klienta o dodatkowe dane niezbędne do jej rozpatrzenia.`,
      `Reklamacje dotyczące działania płatności elektronicznych mogą być również rozpatrywane zgodnie z zasadami operatora płatności Przelewy24.`,
    ],
  },
  {
    title: "§ 12. Odstąpienie od umowy",
    body: [
      `Konsument ma co do zasady prawo odstąpić od umowy zawartej na odległość w terminie 14 dni od dnia otrzymania produktu.`,
      `Aby odstąpić od umowy, Klient powinien poinformować Sprzedawcę o swojej decyzji poprzez wiadomość e-mail wysłaną na adres: ${company.email}.`,
      `Prawo odstąpienia od umowy może nie przysługiwać w przypadkach określonych przez przepisy prawa, w szczególności gdy produkt jest rzeczą nieprefabrykowaną, wyprodukowaną według specyfikacji konsumenta lub służącą zaspokojeniu jego zindywidualizowanych potrzeb.`,
      `Prawo odstąpienia może również nie przysługiwać w odniesieniu do treści lub usług cyfrowych, jeżeli spełnianie świadczenia rozpoczęło się za wyraźną zgodą konsumenta przed upływem terminu do odstąpienia, a konsument został poinformowany o utracie prawa odstąpienia.`,
      `W przypadku skutecznego odstąpienia od umowy Sprzedawca zwraca Klientowi otrzymane płatności zgodnie z obowiązującymi przepisami prawa.`,
    ],
  },
  {
    title: "§ 13. Dane osobowe",
    body: [
      `Administratorem danych osobowych jest Sprzedawca wskazany w § 1 ust. 2 Regulaminu.`,
      `Dane osobowe są przetwarzane w celu obsługi zamówień, płatności, realizacji usług, kontaktu z Klientem oraz wykonania obowiązków prawnych.`,
      `Szczegółowe zasady przetwarzania danych osobowych opisuje Polityka prywatności dostępna na stronie https://promykwspomnien.pl/polityka-prywatnosci.`,
    ],
  },
  {
    title: "§ 14. Postanowienia końcowe",
    body: [
      `Regulamin jest dostępny nieodpłatnie na stronie internetowej Sklepu.`,
      `Sprzedawca może zmienić Regulamin z ważnych przyczyn, w szczególności w przypadku zmiany przepisów prawa, zmiany funkcjonalności serwisu lub zmiany sposobu świadczenia usług.`,
      `Do umów zawieranych za pośrednictwem Sklepu stosuje się prawo polskie.`,
      `W sprawach nieuregulowanych Regulaminem zastosowanie mają powszechnie obowiązujące przepisy prawa polskiego.`,
    ],
  },
];

export default function RegulaminPage() {
  return (
    <main className="bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <p className="text-sm font-medium text-stone-500">
            Ostatnia aktualizacja: {lastUpdated}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Regulamin sklepu internetowego Promyk Wspomnień
          </h1>

          <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-base">
            Regulamin określa zasady sprzedaży tabliczek QR, korzystania z
            profili pamięci oraz dokonywania płatności w serwisie
            promykwspomnien.pl.
          </p>

          <div className="mt-6 grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700 sm:grid-cols-2">
            <div>
              <strong className="block text-stone-950">Sprzedawca</strong>
              {company.name}
            </div>
            <div>
              <strong className="block text-stone-950">Kontakt</strong>
              {company.email}
              <br />
              {company.phone}
            </div>
            <div>
              <strong className="block text-stone-950">Adres</strong>
              {company.address}
            </div>
            <div>
              <strong className="block text-stone-950">NIP / REGON</strong>
              {company.nip} / {company.regon}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
            Przed wysłaniem strony do ponownej weryfikacji Przelewy24 uzupełnij
            prawdziwe dane firmy w pliku regulaminu. Nie zostawiaj tekstów
            zaczynających się od „TU WPISZ”.
          </div>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph, index) => (
                    <p
                      key={`${section.title}-${index}`}
                      className="text-sm leading-7 text-stone-700 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-stone-100 p-4 text-sm leading-6 text-stone-700">
            <p>
              Polityka prywatności jest dostępna tutaj:{" "}
              <Link
                href="/polityka-prywatnosci"
                className="font-semibold text-stone-950 underline underline-offset-4"
              >
                Polityka prywatności
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
