import { MockupShell } from "@/components/landing/mockup-shell";

const BARS = [38, 62, 55, 78, 85, 92, 70] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const CHART_HEIGHT = 112;

export function ChartMockup() {
  return (
    <MockupShell>
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">Weekly Overview</p>
            <p className="mt-0.5 text-xs text-stone-500">78% average this week</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
            +12%
          </span>
        </div>

        <div
          className="mt-5 flex items-end justify-between gap-2 border-b border-stone-100 pb-1"
          style={{ height: CHART_HEIGHT }}
        >
          {BARS.map((pct, i) => {
            const barHeight = Math.max(10, Math.round((pct / 100) * CHART_HEIGHT));
            return (
              <div
                key={DAYS[i]}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="text-[9px] font-medium tabular-nums text-emerald-700">
                  {pct}%
                </span>
                <div
                  className="w-full max-w-[32px] rounded-md bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm"
                  style={{ height: barHeight }}
                />
                <span className="text-[9px] text-stone-400">{DAYS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </MockupShell>
  );
}
