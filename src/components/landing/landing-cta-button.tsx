import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingCtaButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
};

export function LandingCtaButton({
  href = "/login",
  children,
  className,
}: LandingCtaButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-7 text-base font-semibold text-white shadow-[0_2px_8px_rgba(5,150,105,0.35)] transition-all hover:bg-emerald-700 hover:shadow-[0_4px_16px_rgba(5,150,105,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
