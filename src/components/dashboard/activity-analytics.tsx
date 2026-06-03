"use client";

import { useMemo, useState } from "react";
import { formatDayLabel, formatDisplayDate, getTodayString } from "@/lib/utils/dates";
import {
  computeActivityLinePoints,
  computeActivityMonthStats,
} from "@/lib/utils/activity-stats";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Activity, ActivityLog } from "@/types/database";

type ActivityAnalyticsProps = {
  activities: Activity[];
  logs: ActivityLog[];
  monthDays: string[];
};

export function ActivityAnalytics({
  activities,
  logs,
  monthDays,
}: ActivityAnalyticsProps) {
  const active = activities.filter((a) => a.is_active);
  const [selectedId, setSelectedId] = useState(active[0]?.id ?? "");

  const selected = active.find((a) => a.id === selectedId) ?? active[0];
  const today = getTodayString();

  const points = useMemo(() => {
    if (!selected) return [];
    return computeActivityMonthStats(selected, logs, monthDays);
  }, [selected, logs, monthDays]);

  const lineValues = useMemo(() => computeActivityLinePoints(points), [points]);
  const maxLine = Math.max(...lineValues, 1);
  const completedCount = points.filter((p) => p.completed && p.date <= today).length;

  if (active.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>
            Add activities to see per-event heatmaps and charts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [year, month] = monthDays[0]?.split("-").map(Number) ?? [0, 0];
  const firstDate = new Date(year, month - 1, 1);
  const startPadding = (firstDate.getDay() + 6) % 7;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const heatmapCells: (typeof points[0] | null)[] = [
    ...Array(startPadding).fill(null),
    ...points,
  ];
  while (heatmapCells.length % 7 !== 0) {
    heatmapCells.push(null);
  }

  const lineWidth = points.length > 1 ? 100 / (points.length - 1) : 100;
  const linePath = lineValues
    .map((v, i) => {
      const x = i * lineWidth;
      const y = 100 - (v / maxLine) * 100;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Trends</CardTitle>
        <CardDescription>
          Filter by activity — heatmap and completion trend this month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {active.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => setSelectedId(activity.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected?.id === activity.id
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
              )}
            >
              {activity.name}
            </button>
          ))}
        </div>

        {selected && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-emerald-950">{selected.name}</p>
                <p className="text-xs text-muted-foreground">
                  {completedCount} days completed this month
                </p>
              </div>
              <Badge variant="secondary">{selected.category}</Badge>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Monthly heatmap
              </p>
              <div className="mb-1 grid grid-cols-7 gap-1">
                {dayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-[10px] font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {heatmapCells.map((day, i) => {
                  if (!day) {
                    return <div key={`e-${i}`} className="aspect-square" />;
                  }
                  const isFuture = day.date > today;
                  return (
                    <div
                      key={day.date}
                      title={`${formatDisplayDate(day.date)} — ${day.completed ? "Done" : "Missed"}`}
                      className={cn(
                        "aspect-square rounded-sm",
                        isFuture && "bg-muted/20",
                        !isFuture && day.completed && "bg-emerald-500",
                        !isFuture && !day.completed && "bg-emerald-100",
                        day.date === today && "ring-2 ring-emerald-700 ring-offset-1"
                      )}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Cumulative completions
              </p>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="h-28 w-full"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${linePath} L 100 100 L 0 100 Z`}
                    fill="url(#lineGrad)"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{formatDayLabel(monthDays[0])}</span>
                  <span>{formatDayLabel(monthDays[monthDays.length - 1])}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
