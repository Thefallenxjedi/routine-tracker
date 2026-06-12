import { MockupShell } from "@/components/landing/mockup-shell";
import { cn } from "@/lib/utils";

const items = [
  { name: "Meditation", value: "10 min", done: true },
  { name: "Steps", value: "8,420", done: true },
  { name: "Journal", value: null, done: false },
  { name: "LinkedIn outreach", value: "5 sent", done: true },
] as const;

export function DashboardMockup() {
  return (
    <MockupShell>
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
          Daily checklist
        </p>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5",
                item.done ? "bg-emerald-50/80" : "bg-stone-50"
              )}
            >
              <div>
                <p className="text-sm font-medium text-stone-800">{item.name}</p>
                {item.value && (
                  <p className="text-[10px] font-semibold text-emerald-700">
                    {item.value}
                  </p>
                )}
              </div>
              <div
                className={cn(
                  "h-5 w-9 rounded-full",
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
    </MockupShell>
  );
}
