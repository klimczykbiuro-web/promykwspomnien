import { notFound, redirect } from "next/navigation";
import { getQrActivationState } from "@/lib/qr/repository";

export default async function QrEntryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const state = await getQrActivationState(token);

  if (state.state === "not_found") {
    notFound();
  }

  if (state.state === "disabled") {
    return <main>Ta tabliczka jest nieaktywna.</main>;
  }

  if (state.state === "activated") {
    redirect(`/profile/${state.slug}`);
  }

  return (
    <main>
      <h1>Aktywuj tabliczkę</h1>
      <p>Ustaw hasło właściciela i utwórz profil.</p>
      {/* tu później podpinasz formularz aktywacji */}
    </main>
  );
}