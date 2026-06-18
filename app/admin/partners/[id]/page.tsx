import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PartnerKpiBlock } from "./PartnerKpiBlock";
import { DeleteAssignmentButton } from "./DeleteAssignmentButton";
import {
  createPartnerAssignment,
  deletePartnerAssignment,
  getPartnerById,
  listAvailableLots,
  listPartnerActivations,
  listPartnerAssignments,
  updatePartner,
} from "@/lib/admin/partners/repository";
import {
  createPartnerAssignmentSchema,
  deletePartnerAssignmentSchema,
  updatePartnerSchema,
} from "@/lib/admin/partners/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function updatePartnerAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const payload = updatePartnerSchema.parse({
    name: formData.get("name"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    nip: formData.get("nip"),
    notes: formData.get("notes"),
    status: formData.get("status"),
  });

  await updatePartner(id, payload);
  revalidatePath(`/admin/partners/${id}`);
}

async function createAssignmentAction(formData: FormData) {
  "use server";

  const partnerId = String(formData.get("partnerId") ?? "");
  const payload = createPartnerAssignmentSchema.parse({
    lotId: formData.get("lotId"),
    quantityAssigned: formData.get("quantityAssigned"),
    unitPriceGross: formData.get("unitPriceGross"),
    assignmentType: formData.get("assignmentType"),
    notes: formData.get("notes"),
  });

  await createPartnerAssignment(partnerId, payload);
  revalidatePath(`/admin/partners/${partnerId}`);
}

async function deleteAssignmentAction(formData: FormData) {
  "use server";

  const payload = deletePartnerAssignmentSchema.parse({
    partnerId: formData.get("partnerId"),
    assignmentId: formData.get("assignmentId"),
  });

  await deletePartnerAssignment(payload.partnerId, payload.assignmentId);
  revalidatePath(`/admin/partners/${payload.partnerId}`);
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

export default async function AdminPartnerDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const [partner, assignments, activations, availableLots] = await Promise.all([
    getPartnerById(id),
    listPartnerAssignments(id),
    listPartnerActivations(id),
    listAvailableLots(),
  ]);

  if (!partner) {
    notFound();
  }

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
            Admin / Partnerzy / Szczegóły
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 32 }}>{partner.name}</h1>
          <p style={{ margin: "12px 0 0", color: "#57534e", lineHeight: 1.6 }}>
            Edycja danych partnera, przypisywanie partii i podgląd aktywacji z
            jego QR.
          </p>
        </section>

        <PartnerKpiBlock partnerId={partner.id} />

        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Dane partnera</h2>

          <form action={updatePartnerAction} style={{ display: "grid", gap: 14 }}>
            <input type="hidden" name="id" value={partner.id} />

            <div style={{ display: "grid", gap: 6 }}>
              <label>Nazwa firmy</label>
              <input name="name" defaultValue={partner.name} required style={inputStyle} />
            </div>

            <div style={gridStyle}>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Osoba kontaktowa</label>
                <input
                  name="contactPerson"
                  defaultValue={partner.contact_person ?? ""}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Email</label>
                <input name="email" type="email" defaultValue={partner.email ?? ""} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Telefon</label>
                <input name="phone" defaultValue={partner.phone ?? ""} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Miasto</label>
                <input name="city" defaultValue={partner.city ?? ""} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>NIP</label>
                <input name="nip" defaultValue={partner.nip ?? ""} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Status</label>
                <select name="status" defaultValue={partner.status} style={inputStyle}>
                  <option value="active">Aktywny</option>
                  <option value="paused">Wstrzymany</option>
                  <option value="inactive">Nieaktywny</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Notatki</label>
              <textarea
                name="notes"
                rows={4}
                defaultValue={partner.notes ?? ""}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <button type="submit" className="button">
                Zapisz dane partnera
              </button>
            </div>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Przypisz partię / lot</h2>

          <form action={createAssignmentAction} style={{ display: "grid", gap: 14 }}>
            <input type="hidden" name="partnerId" value={partner.id} />

            <div style={gridStyle}>
              <div style={{ display: "grid", gap: 6 }}>
                <label>Lot</label>
                <select name="lotId" required style={inputStyle}>
                  <option value="">Wybierz lot</option>
                  {availableLots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.lot_code} / {lot.run_code} / {lot.quantity_total} szt.
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Ilość przypisana</label>
                <input
                  name="quantityAssigned"
                  type="number"
                  min="1"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Cena brutto za szt.</label>
                <input
                  name="unitPriceGross"
                  type="number"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label>Typ przypisania</label>
                <select name="assignmentType" defaultValue="sale" style={inputStyle}>
                  <option value="sale">Sprzedaż</option>
                  <option value="consignment">Depozyt</option>
                  <option value="sample">Próbka</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label>Notatki</label>
              <textarea name="notes" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <button type="submit" className="button">
                Przypisz lot do partnera
              </button>
            </div>
          </form>
        </section>

        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Przypisane partie</h2>

          {assignments.length === 0 ? (
            <p style={{ color: "#57534e" }}>Brak przypisanych partii.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #e7e5e4" }}>
                    <th style={thStyle}>Lot</th>
                    <th style={thStyle}>Ilość</th>
                    <th style={thStyle}>Cena brutto</th>
                    <th style={thStyle}>Typ</th>
                    <th style={thStyle}>Data</th>
                    <th style={thStyle}>Notatki</th>
                    <th style={thStyle}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} style={{ borderBottom: "1px solid #f5f5f4" }}>
                      <td style={tdStyle}>{assignment.lot_code}</td>
                      <td style={tdStyle}>{assignment.quantity_assigned}</td>
                      <td style={tdStyle}>{assignment.unit_price_gross ?? "—"}</td>
                      <td style={tdStyle}>{assignmentTypeLabel(assignment.assignment_type)}</td>
                      <td style={tdStyle}>{formatDate(assignment.assigned_at)}</td>
                      <td style={tdStyle}>{assignment.notes ?? "—"}</td>
                      <td style={tdStyle}>
                        <form action={deleteAssignmentAction}>
                          <input type="hidden" name="partnerId" value={partner.id} />
                          <input type="hidden" name="assignmentId" value={assignment.id} />
                          <DeleteAssignmentButton lotCode={assignment.lot_code} />
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{ margin: "12px 0 0", color: "#78716c", fontSize: 13 }}>
            Usunięcie przypisania nie usuwa QR, profili ani płatności. Lot wróci na listę
            dostępnych partii do przypisania.
          </p>
        </section>

        <section style={cardStyle}>
          <h2 style={cardTitleStyle}>Aktywowane profile z partii partnera</h2>

          {activations.length === 0 ? (
            <p style={{ color: "#57534e" }}>Brak aktywowanych profili.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #e7e5e4" }}>
                    <th style={thStyle}>Profil</th>
                    <th style={thStyle}>Slug</th>
                    <th style={thStyle}>Lot</th>
                    <th style={thStyle}>Token prefix</th>
                    <th style={thStyle}>Data aktywacji</th>
                  </tr>
                </thead>
                <tbody>
                  {activations.map((activation) => (
                    <tr key={activation.profile_id} style={{ borderBottom: "1px solid #f5f5f4" }}>
                      <td style={tdStyle}>{activation.full_name}</td>
                      <td style={tdStyle}>{activation.slug}</td>
                      <td style={tdStyle}>{activation.lot_code}</td>
                      <td style={tdStyle}>{activation.token_prefix}</td>
                      <td style={tdStyle}>{formatDate(activation.profile_created_at)}</td>
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

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e7e5e4",
  borderRadius: 20,
  padding: 24,
};

const cardTitleStyle: React.CSSProperties = {
  marginTop: 0,
  fontSize: 22,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d6d3d1",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

function assignmentTypeLabel(value: string) {
  switch (value) {
    case "sale":
      return "Sprzedaż";
    case "consignment":
      return "Depozyt";
    case "sample":
      return "Próbka";
    default:
      return value;
  }
}
