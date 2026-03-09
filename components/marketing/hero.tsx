import Link from "next/link";
import { branding } from "@/lib/domain/branding";

export function Hero() {
  return (
    <section className="hero">
      <span className="badge">Gotowe pod płatności i webhooki</span>
      <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.05, margin: "18px 0 0" }}>
        {branding.siteName} — cyfrowe profile pamięci dostępne po zeskanowaniu QR.
      </h1>
      <p style={{ maxWidth: 760, lineHeight: 1.9, color: "rgba(255,255,255,0.8)", fontSize: 18 }}>
        Rodzina i bliscy mogą oglądać wspomnienia, dodawać wpisy, zapalać znicze oraz wspólnie przedłużać ważność profilu.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link className="button secondary" href="/payment/demo-profile">Przejdź do płatności</Link>
        <Link className="button" href="/owner/profiles/demo-profile">Panel właściciela</Link>
      </div>
    </section>
  );
}
