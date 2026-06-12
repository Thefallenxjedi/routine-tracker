import { HeroMockup } from "@/components/landing/mockups/hero-mockup";
import { LandingCtaButton } from "@/components/landing/landing-cta-button";

export function HeroSection() {
  return (
    <section className="border-b border-stone-100 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
            Your life doesn&apos;t belong in a spreadsheet.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone-600 md:text-xl">
            Track habits, learning, health, work, and personal goals from one
            simple dashboard. Routine helps you stay consistent without building
            another complicated system.
          </p>
          <div className="mt-10">
            <LandingCtaButton>Start Tracking</LandingCtaButton>
          </div>
        </div>
        <HeroMockup />
      </div>
    </section>
  );
}
