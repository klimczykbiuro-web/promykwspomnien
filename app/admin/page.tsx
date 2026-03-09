import { plans } from "@/lib/payments/plans";

export default function AdminPage() {
  return (
    <main className="page">
      <div className="container grid grid-2">
        <section className="card card-pad">
          <h1 style={{ marginTop: 0 }}>Panel administratora</h1>
          <p className="muted">Szybki podgląd konfiguracji pakietów</p>
          <div className="grid">
            {Object.entries(plans).map(([id, plan]) => (
              <div className="kpi" key={id}>
                <strong>{plan.label}</strong>
                <div className="muted">{plan.amount} zł · {plan.years} lat</div>
              </div>
            ))}
          </div>
        </section>
        <section className="card card-pad">
          <h2 style={{ marginTop: 0 }}>Logika wdrożenia</h2>
          <ol className="muted" style={{ lineHeight: 1.9, paddingLeft: 20 }}>
            <li>Frontend tworzy checkout session.</li>
            <li>Płatność trafia do bazy jako pending.</li>
            <li>Webhook zmienia status na paid.</li>
            <li>System dopisuje lata do expiresAt.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
