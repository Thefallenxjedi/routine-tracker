"use client";

import { useId, useMemo, useState } from "react";
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
import type { Activity, ActivityLog, DayStat } from "@/types/database";

type ActivityAnalyticsProps = {
  activities: Activity[];
  logs: ActivityLog[];
  monthDays: string[];
  overallStats: DayStat[];
};

const ALL_FILTER = "__all__";

function getGithubHeatColor(rate: number, isFuture: boolean, hasData: boolean): string {
  if (isFuture || !hasData) return "bg-transparent";
  if (rate === 0) return "bg-white ring-1 ring-inset ring-gray-200";
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
  if (isFuture) return "bg-transparent ring-1 ring-inset ring-gray-100";
  if (completed) return "bg-emerald-600";
  return "bg-white ring-1 ring-inset ring-gray-200";
}

export function ActivityAnalytics({
  activities,
  logs,
  monthDays,
  overallStats,
}: ActivityAnalyticsProps) {
  const active = activities.filter((a) => a.is_active);
  const [selectedId, setSelectedId] = useState<string>(ALL_FILTER);
  const gradientId = useId();
  const today = getTodayString();

  const isAllView = selectedId === ALL_FILTER;
  const selected = active.find((a) => a.id === selectedId);

  const activityPoints = useMemo(() => {
    if (!selected || isAllView) return [];
    return computeActivityMonthStats(selected, logs, monthDays);
  }, [selected, logs, monthDays, isAllView]);

  const lineValues = useMemo(() => {
    if (isAllView) {
      let cumulative = 0;
      return overallStats.map((s) => {
        cumulative += s.completed;
        return cumulative;
      });
    }
    return computeActivityLinePoints(activityPoints);
  }, [isAllView, overallStats, activityPoints]);

  const maxLine = Math.max(...lineValues, 1);
  const cumulativeScore = isAllView
    ? overallStats
        .filter((s) => s.date <= today)
        .reduce((sum, s) => sum + s.completed, 0)
    : activityPoints.filter((p) => p.completed && p.date <= today).length;

  const eligibleDays = isAllView
    ? overallStats.filter((s) => s.date <= today && s.total > 0).length
    : activityPoints.filter(
        (p) =>
          p.date <= today &&
          selected &&
          p.date >= selected.created_at.slice(0, 10)
      ).length;

  if (active.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Heatmap</CardTitle>
          <CardDescription>Add activities to see heatmaps and trends.</CardDescription>
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

    if (isAllView) {
      for (const stat of overallStats) {
        const isFuture = stat.date > today;
        cells.push({
          date: stat.date,
          label: `${formatDisplayDate(stat.date)} — ${stat.completed}/${stat.total} done`,
          colorClass: getGithubHeatColor(
            stat.rate,
            isFuture,
            stat.date <= today
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
  ]);

  const lineWidth =
    lineValues.length > 1 ? 100 / (lineValues.length - 1) : 100;
  const linePath = lineValues
    .map((v, i) => {
      const x = i * lineWidth;
      const y = 100 - (v / maxLine) * 90 - 5;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Heatmap</CardTitle>
        <CardDescription>
          Filter by activity — GitHub-style grid with cumulative score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedId(ALL_FILTER)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isAllView
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
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
                  : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
              )}
            >
              {activity.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Cumulative score
            </p>
            <p className="text-3xl font-bold tabular-nums text-emerald-900">
              {cumulativeScore}
              <span className="ml-1 text-base font-normal text-emerald-700">
                {isAllView ? "completions" : "days done"}
              </span>
            </p>
          </div>
          {!isAllView && selected && (
            <Badge variant="secondary">{selected.category}</Badge>
          )}
        </div>

        <div>
          <div className="mb-2 grid grid-cols-7 gap-1.5">
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
              return (
                <div
                  key={cell.date}
                  title={cell.label}
                  className={cn(
                    "aspect-square rounded-sm transition-colors",
                    cell.colorClass,
                    cell.date === today &&
                      "ring-2 ring-emerald-700 ring-offset-1"
                  )}
                />
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="size-3 rounded-sm bg-white ring-1 ring-gray-200" />
            <div className="size-3 rounded-sm bg-emerald-200" />
            <div className="size-3 rounded-sm bg-emerald-400" />
            <div className="size-3 rounded-sm bg-emerald-600" />
            <div className="size-3 rounded-sm bg-emerald-700" />
            <span>More</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Cumulative trend
            {eligibleDays > 0 && (
              <span className="ml-1 text-emerald-700">
                (max {maxLine})
              </span>
            )}
          </p>
          <div className="rounded-lg border border-emerald-100 bg-white p-3">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-32 w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {lineValues.length > 0 && (
                <>
                  <path
                    d={`${linePath} L 100 100 L 0 100 Z`}
                    fill={`url(#${gradientId})`}
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{formatDayLabel(monthDays[0])}</span>
              <span className="font-medium text-emerald-700">
                Total: {lineValues[lineValues.length - 1] ?? 0}
              </span>
              <span>{formatDayLabel(monthDays[monthDays.length - 1])}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
