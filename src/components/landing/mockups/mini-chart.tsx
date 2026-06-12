import { cn } from "@/lib/utils";

const BARS = [42, 68, 55, 82, 71, 90, 64] as const;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const CHART_HEIGHT = 72;

type MiniChartProps = {
  title?: string;
  className?: string;
};

export function MiniChart({
  title = "Weekly overview",
  className,
}: MiniChartProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
          {title}
        </p>
        <p className="shrink-0 text-xs font-semibold tabular-nums text-emerald-700">
          78%
        </p>
      </div>
      <div
        className="mt-3 flex items-end justify-between gap-0.5 sm:gap-1"
        style={{ height: CHART_HEIGHT }}
      >
        {BARS.map((pct, i) => {
          const barHeight = Math.max(8, Math.round((pct / 100) * CHART_HEIGHT));
          return (
            <div
              key={i}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                className="w-full min-w-[6px] max-w-[28px] rounded-sm bg-emerald-500"
                style={{ height: barHeight }}
              />
              <span className="text-[8px] text-stone-400">{DAYS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
