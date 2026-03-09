"use client";

import { useMemo, useState } from "react";

const plans = [
  { id: "plan_1y", label: "1 rok", amount: 10, years: 1 },
  { id: "plan_5y", label: "5 lat", amount: 45, years: 5 },
  { id: "plan_20y", label: "20 lat", amount: 150, years: 20 },
];

export function PaymentCheckout({ profileId }: { profileId: string }) {
  const [planId, setPlanId] = useState(plans[1].id);
  const [buyerName, setBuyerName] = useState("Bliska osoba");
  const [buyerEmail, setBuyerEmail] = useState("rodzina@example.com");
  const [provider, setProvider] = useState("stripe");
  const [status, setStatus] = useState("idle");

  const selectedPlan = useMemo(() => plans.find((item) => item.id === planId) ?? plans[1], [planId]);

  const onSubmit = async () => {
    setStatus("pending");
    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, planId, buyerName, buyerEmail, provider }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "error");
      return;
    }
    setStatus(data.mode === "demo" ? "created_demo_payment" : "redirecting");
    if (data.redirectUrl) window.location.href = data.redirectUrl;
  };

  return (
    <section className="grid grid-2">
      <div className="card card-pad">
        <h2 style={{ marginTop: 0 }}>Ekran płatności</h2>
        <div className="grid grid-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="input"
              style={{ textAlign: "left", borderColor: plan.id === planId ? "#1e1713" : undefined, background: plan.id === planId ? "#1e1713" : undefined, color: plan.id === planId ? "white" : undefined }}
              onClick={() => setPlanId(plan.id)}
            >
              <strong>{plan.label}</strong>
              <div style={{ marginTop: 8 }}>{plan.amount} zł</div>
            </button>
          ))}
        </div>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <input className="input" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Imię" />
          <input className="input" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="E-mail" />
        </div>
        <select className="select" style={{ marginTop: 16 }} value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="stripe">Stripe</option>
          <option value="przelewy24">Przelewy24</option>
          <option value="blik">BLIK</option>
        </select>
      </div>
      <div className="card card-pad" style={{ background: "#171310", color: "white" }}>
        <p className="muted" style={{ color: "rgba(255,255,255,0.6)" }}>Podsumowanie</p>
        <h3 style={{ marginTop: 0 }}>{selectedPlan.label}</h3>
        <div className="kpi" style={{ background: "rgba(255,255,255,0.06)", color: "white" }}>
          Kwota: <strong>{selectedPlan.amount} zł</strong>
        </div>
        <button className="button secondary" style={{ width: "100%", marginTop: 16 }} onClick={onSubmit}>
          Utwórz płatność
        </button>
        <p style={{ marginTop: 16, color: "rgba(255,255,255,0.72)" }}>Status checkoutu: {status}</p>
      </div>
    </section>
  );
}
