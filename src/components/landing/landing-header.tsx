import Link from "next/link";
import { RoutineLogo } from "@/components/brand/routine-logo";
import { LandingSignInButton } from "@/components/landing/landing-sign-in-button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Routine home">
          <RoutineLogo size="sm" />
        </Link>
        <LandingSignInButton />
      </div>
    </header>
  );
}
