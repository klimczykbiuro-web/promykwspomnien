import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getOrdersDashboard } from "@/lib/admin/orders";
import GenerateBatchButton from "./generate-batch-button";
import styles from "../admin.module.css";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatWindow(value: string) {
  return formatDateTime(value);
}

function statusText(status: string | null) {
  switch (status) {
    case "label_ready":
      return "Etykieta gotowa";
    case "batched":
      return "W batchu";
    case "error":
      return "Błąd wysyłki";
    case "printed":
      return "Wydrukowane";
    case "new":
    case null:
      return "Nowe";
    default:
      return status;
  }
}

export default async function AdminOrdersPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const dashboard = await getOrdersDashboard(150);
  const latestBatch = dashboard.batches[0] ?? null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerShell}>
          <div className={styles.headerBar} />
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Panel administratora</p>
              <h1 className={styles.title}>Panel zamówień i listów przewozowych</h1>
              <p className={styles.subtitle}>
                Doba biznesowa liczy się od 10:00 do 09:59 następnego dnia. Batch dnia zbiera opłacone zamówienia,
                wysyła je do Apaczki i przygotowuje jeden PDF z etykietami.
              </p>
              <div className={styles.headerStats}>
                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Doba biznesowa</span>
                  <span className={styles.headerStatValue}>{dashboard.currentWindow.businessDay}</span>
                </div>
                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Zamówienia w kolejce</span>
                  <span className={styles.headerStatValue}>{dashboard.currentWindow.queuedOrders}</span>
                </div>
                <div className={styles.headerStat}>
                  <span className={styles.headerStatLabel}>Okno batcha</span>
                  <span className={styles.headerStatValue} style={{ fontSize: 16, lineHeight: 1.3 }}>
                    {formatWindow(dashboard.currentWindow.windowStart)}<br />{formatWindow(dashboard.currentWindow.windowEnd)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <GenerateBatchButton />
              <Link
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 46,
                  padding: "0 18px",
                  borderRadius: 999,
                  border: "1px solid #d6d3d1",
                  background: "#ffffff",
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Wróć do głównego panelu
              </Link>
            </div>
          </header>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Ostatnie batche</h2>
                <p className={styles.sectionDescription}>
                  Tu pobierzesz gotowy PDF z etykietami i zbiorcze potwierdzenie nadań.
                </p>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Doba biznesowa</th>
                      <th>Status</th>
                      <th>Zamówienia</th>
                      <th>Sukces</th>
                      <th>Błędy</th>
                      <th>Okno</th>
                      <th>Pliki</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.batches.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyState}>Brak batchy.</td>
                      </tr>
                    ) : (
                      dashboard.batches.map((batch) => (
                        <tr key={batch.id}>
                          <td><strong>{batch.business_day}</strong></td>
                          <td>{batch.status}</td>
                          <td>{batch.orders_count}</td>
                          <td>{batch.success_count}</td>
                          <td>{batch.error_count}</td>
                          <td>
                            {formatDateTime(batch.window_start)}<br />{formatDateTime(batch.window_end)}
                          </td>
                          <td>
                            <div style={{ display: "grid", gap: 8 }}>
                              {batch.labels_ready ? (
                                <Link href={`/api/admin/orders/batches/${batch.id}/labels`} style={{ color: "#111827", textDecoration: "underline" }}>
                                  Pobierz etykiety PDF
                                </Link>
                              ) : (
                                <span style={{ color: "#78716c" }}>Brak etykiet</span>
                              )}
                              {batch.turn_in_ready ? (
                                <Link href={`/api/admin/orders/batches/${batch.id}/turn-in`} style={{ color: "#111827", textDecoration: "underline" }}>
                                  Pobierz potwierdzenie nadań
                                </Link>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {latestBatch ? (
          <section className={styles.section}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Najnowszy batch</h2>
                  <p className={styles.sectionDescription}>
                    Szybki dostęp do ostatnio przygotowanej paczki dnia.
                  </p>
                </div>
              </div>

              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Doba biznesowa</p>
                  <p className={styles.cardValue}>{latestBatch.business_day}</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Status</p>
                  <p className={styles.cardValue}>{latestBatch.status}</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Skutecznie wysłane</p>
                  <p className={styles.cardValue}>{latestBatch.success_count}</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Błędy</p>
                  <p className={styles.cardValue}>{latestBatch.error_count}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Zamówienia</h2>
                <p className={styles.sectionDescription}>
                  Lista zamówień z informacją o płatności, wysyłce i numerze listu przewozowego.
                </p>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Zamówienie</th>
                      <th>Klient</th>
                      <th>Adres</th>
                      <th>Płatność</th>
                      <th>Wysyłka</th>
                      <th>List przewozowy</th>
                      <th>Tracking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyState}>Brak zamówień.</td>
                      </tr>
                    ) : (
                      dashboard.orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.order_number}</strong><br />
                            {order.memorial_name}<br />
                            <span className={styles.reportMeta}>{formatDateTime(order.paid_at || order.created_at)}</span>
                          </td>
                          <td>
                            {order.buyer_name}<br />
                            <span className={styles.reportMeta}>{order.buyer_email}</span><br />
                            <span className={styles.reportMeta}>{order.buyer_phone}</span>
                          </td>
                          <td>
                            {order.street}<br />
                            {order.postal_code} {order.city}
                          </td>
                          <td>{order.status}</td>
                          <td>
                            {statusText(order.shipping_status)}
                            {order.shipping_error ? (
                              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6 }}>
                                {order.shipping_error}
                              </div>
                            ) : null}
                          </td>
                          <td>{order.apaczka_waybill_number || "—"}</td>
                          <td>
                            {order.apaczka_tracking_url ? (
                              <a href={order.apaczka_tracking_url} target="_blank" rel="noreferrer" style={{ color: "#111827", textDecoration: "underline" }}>
                                Otwórz tracking
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
