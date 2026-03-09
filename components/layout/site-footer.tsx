import { branding } from "@/lib/domain/branding";

const groups = [
  { title: "Produkt", items: ["Jak to działa", "Cennik", "Płatności", "Panel rodziny"] },
  { title: "Firma", items: ["O nas", "Kontakt", "Regulamin", "Polityka prywatności"] },
  { title: "Wsparcie", items: ["FAQ", "Pomoc techniczna", "E-mail", "Telefon"] },
];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="grid grid-2">
        <div>
          <p className="muted">{branding.siteName}</p>
          <h3 style={{ fontSize: 32, margin: "8px 0 0" }}>{branding.legalName}</h3>
          <p className="muted" style={{ maxWidth: 560, lineHeight: 1.8 }}>
            {branding.tagline} Produkt do tworzenia prywatnych profili pamięci z opcją wspólnego przedłużania ważności przez rodzinę i bliskich.
          </p>
          <p style={{ marginTop: 18 }}>{branding.supportEmail}<br />{branding.supportPhone}</p>
        </div>
        <div className="grid grid-3">
          {groups.map((group) => (
            <div key={group.title}>
              <strong>{group.title}</strong>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {group.items.map((item) => <span key={item} className="muted">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr className="sep" />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span className="muted">© 2026 {branding.siteName}. Wszystkie prawa zastrzeżone.</span>
        <span className="muted">Regulamin · Polityka prywatności · Cookies</span>
      </div>
    </footer>
  );
}
