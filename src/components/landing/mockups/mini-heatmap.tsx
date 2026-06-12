import { cn } from "@/lib/utils";

const HEAT_LEVELS = [
  "bg-white ring-1 ring-inset ring-stone-200",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-700",
] as const;

/** Deterministic pattern for a 7×5 heatmap grid */
const PATTERN = [
  0, 2, 3, 4, 3, 2, 1,
  1, 3, 4, 4, 3, 2, 0,
  2, 4, 4, 3, 4, 3, 1,
  0, 2, 3, 4, 2, 1, 0,
  1, 3, 4, 3, 4, 2, 1,
];

type MiniHeatmapProps = {
  title?: string;
  className?: string;
  compact?: boolean;
};

export function MiniHeatmap({
  title = "Activity heatmap",
  className,
  compact,
}: MiniHeatmapProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-stone-200/80 bg-white/90 p-3 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
        {title}
      </p>
      <div className="mt-2 grid grid-cols-7 gap-0.5 sm:gap-1">
        {PATTERN.map((level, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm",
              !compact && "h-3.5",
              HEAT_LEVELS[level]
            )}
          />
        ))}
      </div>
      {!compact && (
        <div className="mt-2 flex items-center justify-end gap-0.5 text-[8px] text-stone-400">
          <span>Less</span>
          {HEAT_LEVELS.slice(1).map((c, i) => (
            <div key={i} className={cn("size-2 rounded-[2px]", c)} />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}
