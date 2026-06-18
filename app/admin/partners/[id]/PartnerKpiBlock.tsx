import {
  getAdminPartnerExtensions,
  getAdminPartnerKpis,
  type AdminPartnerExtension,
} from "@/lib/admin/partners/kpis";

export async function PartnerKpiBlock({ partnerId }: { partnerId: string }) {
  const [kpis, extensions] = await Promise.all([
    getAdminPartnerKpis(partnerId),
    getAdminPartnerExtensions(partnerId),
  ]);

  if (!kpis) {
    return (
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          KPI partnera
        </h2>
        <p style={{ color: "#6b7280" }}>Brak danych KPI dla tego partnera.</p>
      </section>
    );
  }

  return (
    <>
      <section style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              KPI partnera
            </h2>
            <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 14 }}>
              Sprzedaż, aktywacje i przedłużenia z przypisanych partii.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <KpiCard
            label="Liczba tabliczek"
            value={formatNumber(kpis.assigned_quantity)}
            note={`${formatNumber(kpis.assigned_lots_count)} partii`}
          />

          <KpiCard
            label="Przychód z tabliczek"
            value={formatMoneyFromZloty(kpis.plaques_revenue_gross)}
            note="Ilość × cena brutto za szt."
          />

          <KpiCard
            label="Aktywne profile"
            value={formatNumber(kpis.activated_profiles_count)}
            note="Profile utworzone z QR partnera"
          />

          <KpiCard
            label="Nieaktywowane tabliczki"
            value={formatNumber(kpis.unactivated_quantity)}
            note="Przypisane minus aktywowane"
          />

          <KpiCard
            label="Przedłużone profile"
            value={formatNumber(kpis.extended_profiles_count)}
            note="Płatne przedłużenia"
          />

          <KpiCard
            label="Przychód z przedłużeń"
            value={formatMoneyFromGrosze(kpis.extensions_revenue_gross)}
            note="Suma opłaconych przedłużeń"
          />

          <KpiCard
            label="Skuteczność aktywacji"
            value={formatPercent(kpis.activation_rate_percent)}
            note="Aktywacje / tabliczki"
          />
        </div>
      </section>

      <PartnerExtensionsTable extensions={extensions} />
    </>
  );
}

function PartnerExtensionsTable({
  extensions,
}: {
  extensions: AdminPartnerExtension[];
}) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
        Historia przedłużeń
      </h2>

      {extensions.length === 0 ? (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            background: "#ffffff",
            color: "#6b7280",
          }}
        >
          Ten partner nie ma jeszcze płatnych przedłużeń profili.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            background: "#ffffff",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 680,
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <TableHead>Profil</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Lata</TableHead>
                <TableHead>Data płatności</TableHead>
              </tr>
            </thead>

            <tbody>
              {extensions.map((extension) => (
                <tr key={extension.payment_id}>
                  <TableCell>
                    <a
                      href={`/profile/${extension.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#166534",
                        fontWeight: 800,
                        textDecoration: "none",
                      }}
                    >
                      {extension.full_name || extension.slug}
                    </a>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>
                      /profile/{extension.slug}
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatMoneyFromGrosze(extension.amount_gross)}
                  </TableCell>

                  <TableCell>{extension.years_to_add ?? "-"}</TableCell>

                  <TableCell>
                    {formatDate(extension.paid_at || extension.created_at)}
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        background: "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 28,
          lineHeight: 1.1,
          fontWeight: 900,
          color: "#111827",
        }}
      >
        {value}
      </div>

      {note ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 14px",
        fontSize: 13,
        color: "#374151",
        borderBottom: "1px solid #e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid #f3f4f6",
        fontSize: 14,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}

function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("pl-PL").format(Number(value ?? 0));
}

function formatPercent(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

// Przychód z tabliczek liczymy z partner_lot_assignments.unit_price_gross.
// To jest cena brutto wpisywana w formularzu, czyli zakładamy złotówki, np. 45.00 = 45 zł.
function formatMoneyFromZloty(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

// Przychód z przedłużeń liczymy z payments.amount.
// Zakładamy, że payments.amount jest w groszach, np. 1000 = 10 zł.
function formatMoneyFromGrosze(value: number | string | null | undefined) {
  const amount = Number(value ?? 0) / 100;

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
