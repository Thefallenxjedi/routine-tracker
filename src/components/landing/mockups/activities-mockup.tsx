import { MockupShell } from "@/components/landing/mockup-shell";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  { name: "Morning run", type: "Yes / No", category: "Health" },
  { name: "Daily steps", type: "Steps", category: "Health" },
  { name: "Reading", type: "Minutes", category: "Learning" },
  { name: "Calories", type: "kcal", category: "Health" },
] as const;

export function ActivitiesMockup() {
  return (
    <MockupShell>
      <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-900">Your activities</p>
          <div className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white">
            <Plus className="size-3" />
            Add
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {activities.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-stone-800">{a.name}</p>
                <p className="text-[9px] text-stone-500">{a.category}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-medium",
                  a.type === "Yes / No"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-stone-200 text-stone-700"
                )}
              >
                {a.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  );
}
