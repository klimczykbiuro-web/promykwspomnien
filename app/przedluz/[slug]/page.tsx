import Link from "next/link";
import ExtendProfileForm from "@/app/owner/extend-profile-form";

type Profile = {
  id: string;
  slug: string;
  full_name: string;
};

async function getProfile(slug: string): Promise<Profile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/profiles/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch profile");

  return res.json();
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicExtendPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "32px 0 56px",
        }}
      >
        <div className="container">
          <section
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "32px",
              boxShadow: "0 8px 30px rgba(43, 33, 24, 0.06)",
              padding: "28px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
              Przedłużenie profilu
            </p>
            <h1 style={{ margin: "12px 0 0", fontSize: "40px", lineHeight: 1.1 }}>
              Profil nie został znaleziony
            </h1>
            <p style={{ margin: "16px 0 0", fontSize: "18px", color: "var(--muted)" }}>
              Nie można przygotować płatności dla profilu o adresie: {slug}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 0 56px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gap: "24px",
          }}
        >
          <section
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "32px",
              boxShadow: "0 8px 30px rgba(43, 33, 24, 0.06)",
              padding: "28px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>
              Przedłużenie profilu
            </p>

            <h1 style={{ margin: "12px 0 0", fontSize: "40px", lineHeight: 1.1 }}>
              {profile.full_name}
            </h1>

            <p
              style={{
                margin: "16px 0 0",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#5a5149",
              }}
            >
              Na tej stronie możesz opłacić przedłużenie ważności profilu pamięci.
            </p>

            <div style={{ marginTop: "20px" }}>
              <Link
                href={`/profile/${profile.slug}`}
                style={{
                  color: "#3a2415",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ← Wróć do profilu
              </Link>
            </div>
          </section>

          <section
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "32px",
              boxShadow: "0 8px 30px rgba(43, 33, 24, 0.06)",
              padding: "28px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                lineHeight: 1.15,
              }}
            >
              Wybierz okres przedłużenia
            </h2>

            <p
              style={{
                margin: "14px 0 0",
                fontSize: "17px",
                lineHeight: 1.7,
                color: "#5a5149",
              }}
            >
              Po kliknięciu zostaniesz przekierowany do płatności.
            </p>

            <div style={{ marginTop: "24px" }}>
              <ExtendProfileForm slug={profile.slug} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}