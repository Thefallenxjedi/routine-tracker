import { MockupShell } from "@/components/landing/mockup-shell";
import { MiniChart } from "@/components/landing/mockups/mini-chart";
import { MiniHeatmap } from "@/components/landing/mockups/mini-heatmap";
import { cn } from "@/lib/utils";

const checklist = [
  { name: "Morning run", done: true, category: "Health" },
  { name: "Read 30 min", done: true, category: "Learning" },
  { name: "Deep work block", done: false, category: "Work" },
] as const;

export function HeroMockup() {
  return (
    <MockupShell tall className="w-full">
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-700/70">
            Wednesday, Jun 3
          </p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-emerald-950">
                Good morning, Alex
              </p>
              <p className="text-xs text-stone-600">2 of 3 done today</p>
            </div>
            <p className="text-3xl font-bold tabular-nums text-emerald-700">67%</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-2/3 rounded-full bg-emerald-600" />
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/80 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-stone-500">
            Daily checklist
          </p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.name}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-2",
                  item.done ? "bg-emerald-50" : "bg-stone-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-800">
                    {item.name}
                  </span>
                  <span className="rounded-full bg-stone-200/80 px-1.5 py-0.5 text-[9px] text-stone-600">
                    {item.category}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    item.done ? "bg-emerald-600" : "bg-stone-300"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 size-4 rounded-full bg-white shadow-sm",
                      item.done ? "ml-[18px]" : "ml-0.5"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniChart />
          <MiniHeatmap compact />
        </div>
      </div>
    </MockupShell>
  );
}
