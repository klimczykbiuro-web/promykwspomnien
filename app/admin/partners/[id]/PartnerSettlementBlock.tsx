import { revalidatePath } from "next/cache";
import type { CSSProperties, ReactNode } from "react";
import {
  createPartnerPayout,
  getPartnerSettlement,
  listPartnerPayouts,
  updatePartnerExtensionCommissionPercent,
  type PartnerPayout,
} from "@/lib/admin/partners/settlements";

async function updateCommissionAction(formData: FormData) {
  "use server";

  const partnerId = String(formData.get("partnerId") ?? "");
  const rawPercent = String(formData.get("extensionCommissionPercent") ?? "0");
  const extensionCommissionPercent = Number(rawPercent.replace(",", "."));

  if (!partnerId) {
    throw new Error("Brak ID partnera.");
  }

  if (
    Number.isNaN(extensionCommissionPercent) ||
    extensionCommissionPercent < 0 ||
    extensionCommissionPercent > 100
  ) {
    throw new Error("Prowizja musi być liczbą od 0 do 100.");
  }

  await updatePartnerExtensionCommissionPercent(
    partnerId,
    extensionCommissionPercent
  );

  revalidatePath(`/admin/partners/${partnerId}`);
}

async function createPayoutAction(formData: FormData) {
  "use server";

  const partnerId = String(formData.get("partnerId") ?? "");
  const rawAmount = String(formData.get("amountGross") ?? "0");
  const amountGross = Number(rawAmount.replace(",", "."));
  const payoutDate = String(formData.get("payoutDate") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!partnerId) {
    throw new Error("Brak ID partnera.");
  }

  if (Number.isNaN(amountGross) || amountGross <= 0) {
    throw new Error("Kwota wypłaty musi być większa od 0.");
  }

  if (!payoutDate) {
    throw new Error("Podaj datę wypłaty.");
  }

  await createPartnerPayout({
    partnerId,
    amountGross,
    payoutDate,
    notes,
  });

  revalidatePath(`/admin/partners/${partnerId}`);
}

export async function PartnerSettlementBlock({
  partnerId,
}: {
  partnerId: string;
}) {
  const [settlement, payouts] = await Promise.all([
    getPartnerSettlement(partnerId),
    listPartnerPayouts(partnerId),
  ]);

  if (!settlement) {
    return (
      <section style={cardStyle}>
        <h2 style={cardTitleStyle}>Rozliczenia partnera</h2>
        <p style={{ color: "#57534e", margin: 0 }}>
          Brak danych rozliczeń dla tego partnera.
        </p>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <h2 style={cardTitleStyle}>Rozliczenia partnera</h2>
          <p style={{ color: "#57534e", margin: "6px 0 0", lineHeight: 1.6 }}>
            Prowizja liczona jest tylko od płatnych przedłużeń profili.
            Przychód z tabliczek jest pokazany wyłącznie informacyjnie.
          </p>
        </div>
      </div>

      <div style={kpiGridStyle}>
        <SettlementCard
          label="Przychód z tabliczek"
          value={formatMoney(settlement.plaques_revenue_gross)}
          note="Tylko informacyjnie, bez prowizji"
        />

        <SettlementCard
          label="Przychód z przedłużeń"
          value={formatMoney(settlement.extensions_revenue_gross)}
          note={`${formatNumber(settlement.extended_profiles_count)} przedłużeń`}
        />

        <SettlementCard
          label="Prowizja od przedłużeń"
          value={`${Number(settlement.extension_commission_percent ?? 0).toFixed(2)}%`}
          note="Ustawiana indywidualnie"
        />

        <SettlementCard
          label="Należna prowizja"
          value={formatMoney(settlement.extension_commission_gross)}
          note="Od przedłużeń"
        />

        <SettlementCard
          label="Wypłacono"
          value={formatMoney(settlement.paid_out_gross)}
          note="Suma zapisanych wypłat"
        />

        <SettlementCard
          label="Do wypłaty"
          value={formatMoney(settlement.remaining_to_pay_gross)}
          note="Należna prowizja minus wypłaty"
          strong
        />
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
        <form action={updateCommissionAction} style={formBoxStyle}>
          <input type="hidden" name="partnerId" value={partnerId} />

          <div>
            <h3 style={smallTitleStyle}>Ustaw prowizję od przedłużeń</h3>
            <p style={helpTextStyle}>
              Nie dotyczy sprzedaży tabliczek. Dotyczy tylko płatnych przedłużeń
              profili po aktywacji.
            </p>
          </div>

          <div style={smallFormGridStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Prowizja %</span>
              <input
                name="extensionCommissionPercent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={settlement.extension_commission_percent}
                style={inputStyle}
              />
            </label>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="button">
                Zapisz prowizję
              </button>
            </div>
          </div>
        </form>

        <form action={createPayoutAction} style={formBoxStyle}>
          <input type="hidden" name="partnerId" value={partnerId} />

          <div>
            <h3 style={smallTitleStyle}>Dodaj wypłatę</h3>
            <p style={helpTextStyle}>
              Zapisz ręczną wypłatę dla partnera. System odejmie ją od kwoty
              „Do wypłaty”.
            </p>
          </div>

          <div style={smallFormGridStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Kwota brutto</span>
              <input
                name="amountGross"
                type="number"
                min="0.01"
                step="0.01"
                required
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Data wypłaty</span>
              <input
                name="payoutDate"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Notatka</span>
              <input
                name="notes"
                placeholder="np. przelew bankowy"
                style={inputStyle}
              />
            </label>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className="button">
                Dodaj wypłatę
              </button>
            </div>
          </div>
        </form>
      </div>

      <PayoutHistory payouts={payouts} />
    </section>
  );
}

function PayoutHistory({ payouts }: { payouts: PartnerPayout[] }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={smallTitleStyle}>Historia wypłat</h3>

      {payouts.length === 0 ? (
        <p style={{ color: "#57534e" }}>Brak zapisanych wypłat.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e7e5e4" }}>
                <th style={thStyle}>Data wypłaty</th>
                <th style={thStyle}>Kwota</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Notatka</th>
                <th style={thStyle}>Dodano</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} style={{ borderBottom: "1px solid #f5f5f4" }}>
                  <td style={tdStyle}>{formatDateOnly(payout.payout_date)}</td>
                  <td style={tdStyle}>{formatMoney(payout.amount_gross)}</td>
                  <td style={tdStyle}>{payoutStatusLabel(payout.status)}</td>
                  <td style={tdStyle}>{payout.notes ?? "—"}</td>
                  <td style={tdStyle}>{formatDateTime(payout.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettlementCard({
  label,
  value,
  note,
  strong = false,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        border: strong ? "1px solid #86efac" : "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        background: strong ? "#f0fdf4" : "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 26,
          lineHeight: 1.1,
          fontWeight: 900,
          color: strong ? "#166534" : "#111827",
        }}
      >
        {value}
      </div>

      {note ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          {note}
        </div>
      ) : null}
    </div>
  );
}

function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(Number(value ?? 0));
}

function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("pl-PL").format(Number(value ?? 0));
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function payoutStatusLabel(value: string) {
  switch (value) {
    case "paid":
      return "Wypłacono";
    case "pending":
      return "Oczekuje";
    case "cancelled":
      return "Anulowano";
    default:
      return value;
  }
}

const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e7e5e4",
  borderRadius: 20,
  padding: 24,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
};

const kpiGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
};

const formBoxStyle: CSSProperties = {
  border: "1px solid #e7e5e4",
  borderRadius: 16,
  padding: 16,
  background: "#fafaf9",
  display: "grid",
  gap: 14,
};

const smallTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
};

const helpTextStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "#57534e",
  lineHeight: 1.5,
  fontSize: 14,
};

const smallFormGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#44403c",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #d6d3d1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const thStyle: CSSProperties = {
  padding: "12px 10px",
  fontSize: 13,
  color: "#78716c",
  fontWeight: 700,
};

const tdStyle: CSSProperties = {
  padding: "14px 10px",
  fontSize: 15,
  color: "#1c1917",
};
