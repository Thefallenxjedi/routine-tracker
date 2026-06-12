import { MockupShell } from "@/components/landing/mockup-shell";
import { cn } from "@/lib/utils";

const MONTH_HEAT = [
  0, 0, 1, 2, 3, 4, 3,
  2, 4, 4, 3, 4, 4, 2,
  1, 3, 4, 4, 4, 3, 2,
  3, 4, 4, 3, 4, 2, 1,
  2, 3, 4, 4, 3, 2, 0,
] as const;

const LEVELS = [
  "bg-white ring-1 ring-inset ring-stone-200",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-700",
] as const;

export function HeatmapMockup() {
  return (
    <MockupShell>
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">Activity Trends</p>
            <p className="text-xs text-stone-500">June 2026</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {["All", "Run", "Read"].map((pill, i) => (
              <span
                key={pill}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-medium",
                  i === 0
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600"
                )}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={`${d}-${i}`}
              className="text-center text-[8px] font-medium text-stone-400"
            >
              {d}
            </span>
          ))}
          {MONTH_HEAT.map((level, i) => (
            <div
              key={i}
              className={cn("aspect-square rounded-md", LEVELS[level])}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-emerald-800">
            24 days completed this month
          </p>
          <div className="flex shrink-0 items-center gap-0.5 text-[8px] text-stone-400">
            <span>Less</span>
            {LEVELS.slice(1).map((c, i) => (
              <div key={i} className={cn("size-2 rounded-[2px]", c)} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </MockupShell>
  );
}
