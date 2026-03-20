import { notFound, redirect } from "next/navigation";
import ActivateForm from "./activate-form";
import { getQrActivationState } from "@/lib/qr/repository";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function QrEntryPage({ params }: PageProps) {
  const { token } = await params;
  const state = await getQrActivationState(token);

  if (state.state === "not_found") {
    notFound();
  }

  if (state.state === "activated") {
    redirect(`/profile/${state.slug}`);
  }

  if (state.state === "disabled") {
    return (
      <main
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "48px 20px",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>
          Tabliczka jest nieaktywna
        </h1>
        <p style={{ fontSize: "18px", lineHeight: 1.6 }}>
          Ta tabliczka nie może zostać użyta. Jeśli to błąd, skontaktuj się z
          obsługą.
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "48px 20px",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
        Aktywuj tabliczkę
      </h1>

      <p style={{ fontSize: "18px", lineHeight: 1.6, marginBottom: "8px" }}>
        Uzupełnij podstawowe dane i ustaw hasło właściciela.
      </p>

      <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#555" }}>
        Po aktywacji od razu przejdziesz do panelu właściciela i uzupełnisz
        zdjęcie, cytat, wspomnienie oraz galerię.
      </p>

      <ActivateForm token={token} />
    </main>
  );
}