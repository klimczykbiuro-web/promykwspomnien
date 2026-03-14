import Link from "next/link";
import ClaimForm from "@/components/owner/claim-form";
import { getClaimPageState } from "@/lib/owner/repository";

export default async function OwnerClaimPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const state = await getClaimPageState(slug, token);

  if (state.state === "not_found") {
    return (
      <div className="min-h-screen bg-[#f7f2ec] px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-stone-900">
            Profil nie został znaleziony
          </h1>
        </div>
      </div>
    );
  }

  if (state.state === "invalid_token") {
    return (
      <div className="min-h-screen bg-[#f7f2ec] px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-stone-900">
            Nieprawidłowy link aktywacyjny
          </h1>
          <p className="mt-3 text-stone-600">
            Ten link jest niepoprawny albo został już unieważniony.
          </p>
        </div>
      </div>
    );
  }

  if (state.state === "already_claimed") {
    return (
      <div className="min-h-screen bg-[#f7f2ec] px-6 py-16">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-sm text-stone-500">Dostęp właściciela</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">
            Dostęp został już aktywowany
          </h1>
          <p className="mt-4 text-stone-600">
            Ten profil ma już ustawione hasło właściciela.
          </p>

          <Link
            href="/owner/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-16">
      <ClaimForm slug={slug} token={token} fullName={state.fullName} />
    </div>
  );
}