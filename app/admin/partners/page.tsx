import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  createPartner,
  listPartnersSummary,
} from "@/lib/admin/partners/repository";
import { createPartnerSchema } from "@/lib/admin/partners/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function createPartnerAction(formData: FormData) {
  "use server";

  const payload = createPartnerSchema.parse({
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    nip: formData.get("nip"),
    notes: formData.get("notes"),
  });

  await createPartner(payload);
  revalidatePath("/admin/partners");
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function AdminPartnersPage() {
  const partners = await listPartnersSummary();

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#78716c" }}>
            Admin / Partnerzy
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 32 }}>Partnerzy</h1>
          <p style={{ margin: "12px 0 0", color: "#57534e", lineHeight: 1.6 }}>
            Tutaj dodajesz hurtowych odbiorców i sprawdzasz, ile partii oraz
            aktywacji ma każdy z nich.
          </p>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Dodaj partnera</h2>

          <form action={createPartnerAction} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label>Nazwa firmy</label>
              <input name="name" required style={inputStyle} />
            </div>

            <div
              style={{
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <div style={{ display: "grid", gap: 6 }}>
                <label>Osoba kontaktowa</label>
                <input name="contactPerson" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Email</label>
                <input name="email" type="email" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Telefon</label>
                <input name="phone" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Miasto</label>
                <input name="city" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>NIP</label>
                <input name="nip" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Notatki</label>
              <textarea name="notes" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <button type="submit" className="button">
                Dodaj partnera
              </button>
            </div>
          </form>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e7e5e4",
            borderRadius: 20,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Lista partnerów</h2>

          {partners.length === 0 ? (
            <p style={{ color: "#57534e" }}>Brak partnerów.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #e7e5e4" }}>
                    <th style={thStyle}>Nazwa</th>
                    <th style={thStyle}>Miasto</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Partie</th>
                    <th style={thStyle}>Sztuki</th>
                    <th style={thStyle}>Aktywacje</th>
                    <th style={thStyle}>Dodany</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} style={{ borderBottom: "1px solid #f5f5f4" }}>
                      <td style={tdStyle}>{partner.name}</td>
                      <td style={tdStyle}>{partner.city ?? "—"}</td>
                      <td style={tdStyle}>{statusLabel(partner.status)}</td>
                      <td style={tdStyle}>{partner.assigned_lots_count}</td>
                      <td style={tdStyle}>{partner.assigned_quantity}</td>
                      <td style={tdStyle}>{partner.activated_profiles_count}</td>
                      <td style={tdStyle}>{formatDate(partner.created_at)}</td>
                      <td style={tdStyle}>
                        <Link href={`/admin/partners/${partner.id}`}>Szczegóły</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d6d3d1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  fontSize: 13,
  color: "#78716c",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 10px",
  fontSize: 15,
  color: "#1c1917",
};

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Aktywny";
    case "paused":
      return "Wstrzymany";
    case "inactive":
      return "Nieaktywny";
    default:
      return status;
  }
}
