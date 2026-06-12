import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MockupShellProps = {
  children: ReactNode;
  className?: string;
  /** Taller hero composition */
  tall?: boolean;
};

export function MockupShell({ children, className, tall }: MockupShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-b from-stone-50 to-white p-4 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)] md:p-6",
        tall ? "min-h-[420px]" : "min-h-[320px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-emerald-100/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-stone-200/50 blur-3xl"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
