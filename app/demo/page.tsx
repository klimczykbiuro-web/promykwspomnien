export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f7f2ec] px-6 py-16 text-stone-900">
      <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 shadow-sm">
        <p className="text-sm text-stone-500">Demo / archiwum</p>
        <h1 className="mt-2 text-3xl font-semibold">Prototyp został odseparowany od live kodu</h1>
        <p className="mt-4 leading-7 text-stone-700">
          Ta podstrona jest tylko miejscem na przyszły playground i prototypy.
          Produkcyjny profil działa osobno pod adresami /profile/[slug].
        </p>
        <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
          Live kod:
          <br />- app/profile/[slug]/page.tsx
          <br />- app/api/profiles/[slug]/route.ts
          <br />- app/api/profiles/[slug]/guestbook/route.ts
          <br />- components/profile/guestbook-section.tsx
          <br />- lib/db.ts
        </div>
      </div>
    </div>
  );
}
