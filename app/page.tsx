import { Hero } from "@/components/marketing/hero";
import { ProfilePublicView } from "@/components/profile/profile-public-view";
import { SiteFooter } from "@/components/layout/site-footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="page">
      <div className="container grid">
        <Hero />
        <ProfilePublicView />
        <SiteFooter />
      </div>
    </main>
  );
}
