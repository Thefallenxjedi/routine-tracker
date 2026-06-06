"use client";

import { useMemo, useState } from "react";
import {
  formatDisplayDate,
  formatMonthYear,
  getMonthInputValue,
  getMonthRange,
  getMonthRangeFromParts,
  getPreviousMonthRange,
  getTodayString,
} from "@/lib/utils/dates";
import { NumericActivityVisual } from "@/components/dashboard/numeric-activity-visual";
import { isNumericActivity } from "@/lib/activity-metrics";
import { computeActivityMonthStats } from "@/lib/utils/activity-stats";
import { computeDayStats } from "@/lib/utils/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
};

type MonthPreset = "this-month" | "past-month" | "custom";

const ALL_FILTER = "__all__";

function getGithubHeatColor(
  rate: number,
  isFuture: boolean,
  hasData: boolean
): string {
  if (isFuture || !hasData) return "bg-transparent";
  if (rate === 0) return "bg-white ring-1 ring-inset ring-stone-200";
  if (rate < 0.25) return "bg-emerald-200";
  if (rate < 0.5) return "bg-emerald-400";
  if (rate < 0.75) return "bg-emerald-500";
  return "bg-emerald-700";
}

function getActivityHeatColor(
  completed: boolean,
  isFuture: boolean,
  isBeforeCreated: boolean
): string {
  if (isBeforeCreated) return "bg-transparent";
  if (isFuture) return "bg-transparent ring-1 ring-inset ring-stone-100";
  if (completed) return "bg-emerald-600";
  return "bg-white ring-1 ring-inset ring-stone-200";
}

function resolveMonthRange(
  preset: MonthPreset,
  customMonth: string
): { days: string[]; label: string } {
  if (preset === "this-month") {
    const range = getMonthRange();
    return { days: range.days, label: formatMonthYear(range.days[0]) };
  }
  if (preset === "past-month") {
    const range = getPreviousMonthRange();
    return { days: range.days, label: formatMonthYear(range.days[0]) };
  }
  const [yearStr, monthStr] = customMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) {
    const fallback = getMonthRange();
    return { days: fallback.days, label: formatMonthYear(fallback.days[0]) };
  }
  const range = getMonthRangeFromParts(year, month);
  return { days: range.days, label: formatMonthYear(range.days[0]) };
}

export function ActivityAnalytics({ activities, logs }: ActivityAnalyticsProps) {
  const active = activities.filter((a) => a.is_active);
  const today = getTodayString();

  const [selectedId, setSelectedId] = useState<string>(ALL_FILTER);
  const [monthPreset, setMonthPreset] = useState<MonthPreset>("this-month");
  const [customMonth, setCustomMonth] = useState(getMonthInputValue());

  const { days: monthDays, label: monthLabel } = useMemo(
    () => resolveMonthRange(monthPreset, customMonth),
    [monthPreset, customMonth]
  );

  const isAllView = selectedId === ALL_FILTER;
  const selected = active.find((a) => a.id === selectedId);
  const selectedNumeric = selected ? isNumericActivity(selected) : false;

  const overallStats = useMemo(
    () => computeDayStats(active, logs, monthDays),
    [active, logs, monthDays]
  );

  const activityPoints = useMemo(() => {
    if (!selected || isAllView) return [];
    return computeActivityMonthStats(selected, logs, monthDays);
  }, [selected, logs, monthDays, isAllView]);

  const cumulativeScore = isAllView
    ? overallStats
        .filter((s) => s.date <= today)
        .reduce((sum, s) => sum + s.completed, 0)
    : activityPoints.filter((p) => p.completed && p.date <= today).length;

  if (active.length === 0) {
    return (
      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Add activities to see heatmaps.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [year, month] = monthDays[0]?.split("-").map(Number) ?? [0, 0];
  const firstDate = new Date(year, month - 1, 1);
  const startPadding = (firstDate.getDay() + 6) % 7;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  type HeatCell = {
    date: string;
    label: string;
    colorClass: string;
  } | null;

  const heatCells: HeatCell[] = useMemo(() => {
    const cells: HeatCell[] = Array(startPadding).fill(null);
    const monthEnd = monthDays[monthDays.length - 1];

    if (isAllView) {
      for (const stat of overallStats) {
        const isFuture = stat.date > today;
        const inSelectedMonth = stat.date >= monthDays[0] && stat.date <= monthEnd;
        cells.push({
          date: stat.date,
          label: `${formatDisplayDate(stat.date)} — ${stat.completed}/${stat.total} done`,
          colorClass: getGithubHeatColor(
            stat.rate,
            isFuture,
            inSelectedMonth && stat.date <= today
          ),
        });
      }
    } else if (selected) {
      const createdDate = selected.created_at.slice(0, 10);
      for (const point of activityPoints) {
        const isFuture = point.date > today;
        const isBeforeCreated = point.date < createdDate;
        cells.push({
          date: point.date,
          label: `${formatDisplayDate(point.date)} — ${point.completed ? "Done" : "Missed"}`,
          colorClass: getActivityHeatColor(
            point.completed,
            isFuture,
            isBeforeCreated
          ),
        });
      }
    }

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [
    startPadding,
    isAllView,
    overallStats,
    activityPoints,
    selected,
    today,
    monthDays,
  ]);

  const isCurrentMonthView =
    monthPreset === "this-month" ||
    (monthPreset === "custom" && customMonth === getMonthInputValue());

  return (
    <Card className="border-stone-200 bg-stone-50/80">
      <CardHeader className="space-y-4 pb-2">
        <div>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>
            {selectedNumeric
              ? "Heatmap and chart for numeric tracking"
              : `Heatmap by activity — ${monthLabel}`}
          </CardDescription>
        </div>

        {!selectedNumeric && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "this-month" as const, label: "This month" },
                  { id: "past-month" as const, label: "Past month" },
                  { id: "custom" as const, label: "Custom month" },
                ] as const
              ).map(({ id, label }) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={monthPreset === id ? "default" : "outline"}
                  className={cn(
                    "h-8 text-xs",
                    monthPreset === id
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-stone-300"
                  )}
                  onClick={() => setMonthPreset(id)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {monthPreset === "custom" && (
              <div className="rounded-lg border border-stone-200 bg-white p-3">
                <Label htmlFor="heatmap-month" className="text-xs text-muted-foreground">
                  Pick month and year
                </Label>
                <Input
                  id="heatmap-month"
                  type="month"
                  value={customMonth}
                  max={getMonthInputValue()}
                  onChange={(e) => setCustomMonth(e.target.value)}
                  className="mt-1 max-w-[200px] border-stone-300 bg-white"
                />
              </div>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-stone-200 bg-white p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Filter activity
          </p>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setSelectedId(ALL_FILTER)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isAllView
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-stone-200 bg-stone-50 text-emerald-800 hover:bg-emerald-50"
              )}
            >
              All
            </button>
            {active.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => setSelectedId(activity.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  selectedId === activity.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-stone-200 bg-stone-50 text-emerald-800 hover:bg-emerald-50"
                )}
              >
                {activity.name}
              </button>
            ))}
          </div>
        </div>

        {selectedNumeric && selected ? (
          <NumericActivityVisual
            activity={selected}
            logs={logs}
            today={today}
          />
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/70">
                  {isAllView ? "Total completions" : "Days completed"}
                </p>
                <p className="text-3xl font-bold tabular-nums text-emerald-900">
                  {cumulativeScore}
                  <span className="ml-1 text-sm font-normal text-emerald-700">
                    in {monthLabel}
                  </span>
                </p>
              </div>
              {!isAllView && selected && (
                <Badge variant="secondary">{selected.category}</Badge>
              )}
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-emerald-950">
                  {monthLabel} heatmap
                </p>
                {isAllView && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>Less</span>
                    <div className="size-3 rounded-sm bg-white ring-1 ring-stone-200" />
                    <div className="size-3 rounded-sm bg-emerald-200" />
                    <div className="size-3 rounded-sm bg-emerald-400" />
                    <div className="size-3 rounded-sm bg-emerald-500" />
                    <div className="size-3 rounded-sm bg-emerald-700" />
                    <span>More</span>
                  </div>
                )}
              </div>
              <div className="mb-1 grid grid-cols-7 gap-1.5">
                {dayLabels.map((label) => (
                  <div
                    key={label}
                    className="text-center text-[10px] font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {heatCells.map((cell, i) => {
                  if (!cell) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }
                  const highlightToday =
                    isCurrentMonthView && cell.date === today;
                  return (
                    <div
                      key={cell.date}
                      title={cell.label}
                      className={cn(
                        "aspect-square rounded-md transition-colors",
                        cell.colorClass,
                        highlightToday && "ring-2 ring-emerald-700 ring-offset-1"
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
