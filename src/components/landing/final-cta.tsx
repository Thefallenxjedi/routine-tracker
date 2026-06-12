import { LandingCtaButton } from "@/components/landing/landing-cta-button";

export function FinalCta() {
  return (
    <section className="bg-stone-50 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
          Build consistency one day at a time.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">
          Small actions repeated daily create long-term results. Routine helps
          you see those actions clearly.
        </p>
        <div className="mt-10 flex justify-center">
          <LandingCtaButton>Get Started</LandingCtaButton>
        </div>
      </div>
    </section>
  );
}
