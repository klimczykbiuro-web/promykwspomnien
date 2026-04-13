import OwnerLoginForm from "@/components/owner/login-form";

type SearchParams = Promise<{ slug?: string; next?: string }>;

export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-16">
      <OwnerLoginForm
        initialSlug={params.slug ?? ""}
        nextPath={params.next ?? "/owner"}
      />
    </div>
  );
}
