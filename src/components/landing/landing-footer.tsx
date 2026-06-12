import { RoutineLogo } from "@/components/brand/routine-logo";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <RoutineLogo size="sm" />
        <p className="text-sm text-stone-500">
          Simple tracking for real life.
        </p>
        <p className="text-xs text-stone-400">
          &copy; {year} Routine. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
