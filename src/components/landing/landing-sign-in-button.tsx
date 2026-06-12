import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingSignInButtonProps = {
  className?: string;
};

export function LandingSignInButton({ className }: LandingSignInButtonProps) {
  return (
    <Link
      href="/login"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2 text-sm font-semibold text-stone-800 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 hover:shadow-[0_2px_8px_rgba(5,150,105,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        className
      )}
    >
      Sign in
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
