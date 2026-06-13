import { FeaturesGridSection } from "@/components/landing/features-grid-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { SecuritySection } from "@/components/landing/security-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";

export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGridSection />
        <SocialProofSection />
        <SecuritySection />
      </main>
      <LandingFooter />
    </div>
  );
}
