import OrderForm from "./order-form";

export const metadata = {
  title: "Zamów tabliczkę QR | Promyk Wspomnień",
  description:
    "Zamów tabliczkę QR za 60 zł. W cenie otrzymujesz także 1 rok subskrypcji profilu pamięci.",
};

export default function OrderPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>Zamów tabliczkę QR</h1>

      <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 24 }}>
        Cena tabliczki to <strong>60 zł</strong>. W tej cenie zawarty jest także{" "}
        <strong>1 rok subskrypcji</strong> profilu pamięci.
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          background: "#fafafa",
        }}
      >
        <strong>Co zawiera zamówienie:</strong>
        <ul style={{ marginTop: 12, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>tabliczka QR</li>
          <li>1 rok aktywnego profilu pamięci</li>
          <li>możliwość dodania zdjęcia, cytatu, biografii i galerii</li>
          <li>funkcję „zapal znicz”</li>
        </ul>
      </div>

      <OrderForm />
    </main>
  );
}