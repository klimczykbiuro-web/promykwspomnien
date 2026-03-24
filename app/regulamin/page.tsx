export const metadata = {
  title: "Regulamin | Promyk Wspomnień",
  description: "Regulamin serwisu i sprzedaży tabliczek pamięci Promyk Wspomnień.",
};

const company = {
  name: "TU WPISZ PEŁNĄ NAZWĘ FIRMY",
  address: "TU WPISZ ADRES FIRMY",
  nip: "TU WPISZ NIP",
  email: "TU WPISZ E-MAIL",
  phone: "TU WPISZ TELEFON",
};

const sections = [
  {
    title: "§ 1. Postanowienia ogólne",
    body: [
      `Niniejszy Regulamin określa zasady korzystania z serwisu internetowego Promyk Wspomnień, dostępnego pod domeną promykwspomnien.pl, w tym zasady świadczenia usług drogą elektroniczną, składania zamówień, aktywacji profili pamięci, dodawania treści oraz składania reklamacji.`,
      `Właścicielem i administratorem serwisu jest ${company.name}, ${company.address}, NIP: ${company.nip}, e-mail: ${company.email}, telefon: ${company.phone}.`,
      `Regulamin jest udostępniany nieodpłatnie w Serwisie w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie.`,
    ],
  },
  {
    title: "§ 2. Definicje",
    body: [
      `Serwis – serwis internetowy Promyk Wspomnień dostępny pod adresem promykwspomnien.pl.`,
      `Administrator / Sprzedawca – ${company.name}.`,
      `Klient – osoba fizyczna, osoba prawna albo jednostka organizacyjna korzystająca z Serwisu lub składająca zamówienie.`,
      `Konsument – osoba fizyczna dokonująca z Administratorem czynności prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.`,
      `Profil pamięci – indywidualna strona poświęcona upamiętnieniu osoby zmarłej, prowadzona w ramach Serwisu.`,
      `Tabliczka – fizyczna tabliczka z kodem QR kierującym do profilu pamięci.`,
      `Właściciel profilu – osoba, która aktywowała dostęp do profilu i zarządza jego treścią.`,
      `Treści użytkownika – zdjęcia, opisy, cytaty, wpisy oraz inne materiały dodawane do profilu.`,
    ],
  },
  {
    title: "§ 3. Zakres usług",
    body: [
      `Administrator świadczy drogą elektroniczną usługi polegające w szczególności na: umożliwieniu przeglądania treści Serwisu, złożeniu zamówienia na tabliczkę, aktywacji profilu pamięci, prowadzeniu profilu pamięci, dodawaniu zdjęć i opisów oraz obsłudze kontaktu z Klientem.`,
      `Administrator może oferować zarówno produkt fizyczny w postaci tabliczki, jak i usługi cyfrowe związane z uruchomieniem oraz utrzymaniem profilu pamięci.`,
      `Szczegółowy zakres świadczenia, ceny, terminy realizacji i warunki zamówienia są wskazywane w Serwisie lub w indywidualnej ofercie przedstawionej Klientowi.`,
    ],
  },
  {
    title: "§ 4. Wymagania techniczne",
    body: [
      `Do korzystania z Serwisu niezbędne są: urządzenie z dostępem do internetu, aktualna przeglądarka internetowa oraz aktywny adres e-mail, jeżeli jest on wymagany do kontaktu.`,
      `Administrator dokłada starań, aby Serwis działał w sposób ciągły, jednak zastrzega możliwość przerw technicznych, aktualizacji i prac serwisowych.`,
      `Klient zobowiązany jest korzystać z Serwisu w sposób zgodny z prawem, Regulaminem i dobrymi obyczajami.`,
    ],
  },
  {
    title: "§ 5. Zamówienia i zawarcie umowy",
    body: [
      `Zamówienie może zostać złożone za pośrednictwem formularza, poczty elektronicznej, telefonu lub innego kanału wskazanego przez Administratora.`,
      `Zawarcie umowy następuje z chwilą potwierdzenia przyjęcia zamówienia przez Administratora lub z chwilą skutecznego opłacenia zamówienia – w zależności od przyjętego modelu sprzedaży.`,
      `Klient jest zobowiązany do podania prawdziwych i kompletnych danych niezbędnych do realizacji zamówienia.`,
      `Administrator może skontaktować się z Klientem w celu doprecyzowania danych lub zakresu zamówienia.`,
    ],
  },
  {
    title: "§ 6. Płatności i realizacja",
    body: [
      `Dostępne metody płatności są wskazywane w Serwisie lub podczas składania zamówienia.`,
      `Ceny podawane w Serwisie są cenami brutto, chyba że wyraźnie wskazano inaczej.`,
      `Termin realizacji zamówienia zależy od rodzaju zamówienia, zakresu personalizacji oraz dostępności materiałów. Konkretne informacje o terminie realizacji Administrator przekazuje Klientowi przed lub po złożeniu zamówienia.`,
      `W przypadku tabliczek przygotowywanych według indywidualnej specyfikacji Klienta czas realizacji może obejmować etap produkcji, przygotowania kodu QR oraz konfiguracji profilu.`,
    ],
  },
  {
    title: "§ 7. Aktywacja profilu i dostęp właściciela",
    body: [
      `Aktywacja profilu następuje przy pierwszym uruchomieniu dostępu właściciela lub w inny sposób wskazany przez Administratora.`,
      `Właściciel profilu ustawia własne hasło dostępu. Hasło powinno zostać zapisane w bezpiecznym miejscu.`,
      `Właściciel profilu ponosi odpowiedzialność za zachowanie poufności hasła oraz za działania podejmowane z użyciem jego dostępu.`,
      `Administrator nie ponosi odpowiedzialności za skutki udostępnienia hasła osobom trzecim przez Właściciela profilu.`,
    ],
  },
  {
    title: "§ 8. Treści użytkownika, zdjęcia i odpowiedzialność",
    body: [
      `Właściciel profilu lub inny użytkownik dodający treści oświadcza, że posiada prawo do korzystania z zamieszczanych materiałów i ich publikacji w Serwisie.`,
      `Zakazane jest dodawanie treści niezgodnych z prawem, naruszających dobra osobiste, prywatność, wizerunek, prawa autorskie, prawa osób trzecich, a także treści obraźliwych, wulgarnych, nawołujących do nienawiści lub przemocy.`,
      `Zakazane jest dodawanie treści pornograficznych, nielegalnych lub przedstawiających seksualne wykorzystywanie małoletnich oraz innych materiałów zabronionych przez prawo.`,
      `W przypadku zdjęć przedstawiających osoby żyjące użytkownik oświadcza, że posiada wymaganą zgodę na ich publikację, o ile jest ona wymagana.`,
      `Administrator może usunąć lub ukryć treści naruszające Regulamin, prawo lub prawa osób trzecich.`,
    ],
  },
  {
    title: "§ 9. Zgłaszanie naruszeń i moderacja",
    body: [
      `Każda osoba może zgłosić Administratorowi zdjęcie, opis lub inną treść, która narusza prawo, prawa osób trzecich, prywatność, wizerunek albo jest treścią nielegalną lub nieodpowiednią.`,
      `Zgłoszenie powinno zawierać możliwie dokładne wskazanie treści, opis naruszenia oraz dane kontaktowe zgłaszającego, jeśli oczekuje odpowiedzi.`,
      `Administrator może tymczasowo ukryć treść do czasu wyjaśnienia sprawy, usunąć treść lub zablokować możliwość dalszego dodawania treści.`,
      `W przypadku uzasadnionego podejrzenia popełnienia przestępstwa Administrator może zabezpieczyć niezbędne informacje i przekazać sprawę właściwym organom.`,
      `W przypadku powtarzających się zgłoszeń potwierdzających naruszenie Regulaminu lub w przypadku poważnego naruszenia prawa, praw osób trzecich, prywatności, wizerunku albo dobrych obyczajów, Administrator może: czasowo ukryć treści, czasowo zablokować możliwość edycji profilu, ograniczyć dostęp do wybranych funkcji, trwale usunąć treści, a także zablokować profil lub zakończyć jego dalsze utrzymywanie w Serwisie.`,
    ],
  },
  {
    title: "§ 10. Reklamacje",
    body: [
      `Reklamacje dotyczące działania Serwisu, realizacji zamówienia lub świadczonych usług można składać na adres e-mail: ${company.email}.`,
      `Reklamacja powinna zawierać dane umożliwiające identyfikację sprawy oraz opis zgłaszanych zastrzeżeń.`,
      `Administrator rozpatruje reklamację w terminie 14 dni od dnia jej otrzymania, chyba że do rozpatrzenia sprawy konieczne będzie uzyskanie dodatkowych informacji.`,
    ],
  },
  {
    title: "§ 11. Prawo odstąpienia od umowy",
    body: [
      `Konsument, który zawarł umowę na odległość, co do zasady ma prawo odstąpić od umowy w terminie 14 dni bez podawania przyczyny, z zastrzeżeniem wyjątków przewidzianych przez przepisy prawa.`,
      `Prawo odstąpienia może nie przysługiwać w przypadku rzeczy nieprefabrykowanych, wyprodukowanych według specyfikacji konsumenta lub służących zaspokojeniu jego zindywidualizowanych potrzeb, w szczególności w przypadku spersonalizowanej tabliczki przygotowanej dla konkretnego profilu pamięci.`,
      `Jeżeli przedmiotem świadczenia są również usługi cyfrowe lub usługi świadczone drogą elektroniczną, szczegółowe warunki rozpoczęcia świadczenia oraz ewentualnej utraty prawa odstąpienia są wskazywane Klientowi przed zawarciem umowy.`,
      `Szczegółowe informacje o sposobie wykonania prawa odstąpienia Klient otrzymuje przed zawarciem umowy lub wraz z potwierdzeniem zamówienia.`,
    ],
  },
  {
    title: "§ 12. Dane osobowe i prywatność",
    body: [
      `Zasady przetwarzania danych osobowych określa Polityka prywatności dostępna w Serwisie.`,
      `RODO co do zasady nie ma zastosowania do danych osób zmarłych, jednak Serwis może przetwarzać dane osób żyjących, w szczególności Właścicieli profili, osób kontaktujących się z Administratorem, płatników, zgłaszających oraz osób pojawiających się na zdjęciach lub w treściach dodawanych do Serwisu.`,
    ],
  },
  {
    title: "§ 13. Prawa własności intelektualnej",
    body: [
      `Treści, układ Serwisu, elementy graficzne, oznaczenia i materiały udostępniane przez Administratora są chronione prawem i nie mogą być wykorzystywane bez podstawy prawnej.`,
      `Użytkownik ponosi odpowiedzialność za naruszenie praw autorskich lub pokrewnych w związku z dodawanymi treściami.`,
    ],
  },
  {
    title: "§ 14. Postanowienia końcowe",
    body: [
      `Administrator może zmienić Regulamin z ważnych przyczyn, w szczególności w razie zmiany prawa, zmiany modelu działania Serwisu lub wprowadzenia nowych funkcjonalności.`,
      `Do umów zawieranych z Konsumentami stosuje się przepisy prawa polskiego, z uwzględnieniem bezwzględnie obowiązujących przepisów chroniących konsumentów.`,
      `W sprawach nieuregulowanych w Regulaminie zastosowanie mają odpowiednie przepisy prawa polskiego.`,
    ],
  },
];

export default function RegulaminPage() {
  return (
    <main className="bg-stone-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          <p className="text-sm text-stone-500">Dokument informacyjny</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Regulamin serwisu i sprzedaży
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-base">
            Poniższy dokument stanowi roboczą wersję regulaminu dla serwisu
            Promyk Wspomnień. Przed publikacją uzupełnij dane firmy, zasady
            dostawy, płatności i ewentualne szczegóły oferty.
          </p>

          <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Uzupełnij przed publikacją: nazwę firmy, adres, NIP, e-mail,
            telefon, zasady płatności, terminy realizacji oraz szczegóły
            dotyczące reklamacji i odstąpienia.
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
        </div>
      </div>
    </main>
  );
}