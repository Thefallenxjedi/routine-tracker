import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeatureCards } from "@/components/landing/feature-cards";
import { ProblemSection } from "@/components/landing/problem-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <SocialProof />
        <FeatureCards />
        <ProblemSection />
        <ShowcaseSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  );
}
