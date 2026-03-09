const guestEntries = [
  { id: 1, author: "Anna", date: "5 marca 2026", text: "Na zawsze pozostaniesz w naszej pamięci." },
  { id: 2, author: "Rodzina", date: "2 marca 2026", text: "Codziennie wspominamy wspólne chwile." },
];

export function ProfilePublicView() {
  return (
    <section className="grid grid-2">
      <div className="card card-pad">
        <div style={{ borderRadius: 28, padding: 24, background: "linear-gradient(180deg, #ddd0c0, #f3ece4)" }}>
          <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
              alt="Maria Kowalska"
              style={{ width: 144, height: 180, borderRadius: 999, objectFit: "cover", margin: "0 auto", border: "4px solid white" }}
            />
            <h2 style={{ marginBottom: 0 }}>Maria Kowalska</h2>
            <p className="muted" style={{ marginTop: 6 }}>1948 — 2024</p>
            <p className="muted" style={{ fontStyle: "italic", lineHeight: 1.8 }}>
              „Pozostaje po nas dobro, które daliśmy innym.”
            </p>
          </div>
        </div>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <button className="button">Księga gości</button>
          <button className="button secondary">Zapal znicz</button>
        </div>
      </div>
      <div className="card card-pad">
        <h3 style={{ marginTop: 0 }}>Księga gości</h3>
        <div style={{ display: "grid", gap: 14 }}>
          {guestEntries.map((entry) => (
            <div key={entry.id} className="kpi">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong>{entry.author}</strong>
                <span className="muted">{entry.date}</span>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
