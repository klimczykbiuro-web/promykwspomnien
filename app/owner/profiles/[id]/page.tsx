export default async function OwnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="page">
      <div className="container grid grid-2">
        <section className="card card-pad">
          <h1 style={{ marginTop: 0 }}>Panel właściciela</h1>
          <p className="muted">Profil: {id}</p>
          <div className="grid">
            <input className="input" defaultValue="Maria Kowalska" />
            <input className="input" defaultValue="1948 — 2024" />
            <textarea className="textarea" defaultValue="Maria była osobą ciepłą, spokojną i zawsze gotową pomóc." />
            <button className="button">Zapisz zmiany</button>
          </div>
        </section>
        <section className="card card-pad">
          <h2 style={{ marginTop: 0 }}>Statystyki</h2>
          <div className="grid grid-2">
            <div className="kpi"><strong>1 284</strong><br /><span className="muted">Odwiedziny</span></div>
            <div className="kpi"><strong>128</strong><br /><span className="muted">Znicze</span></div>
            <div className="kpi"><strong>34</strong><br /><span className="muted">Wpisy</span></div>
            <div className="kpi"><strong>4027</strong><br /><span className="muted">Dni do wygaśnięcia</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
