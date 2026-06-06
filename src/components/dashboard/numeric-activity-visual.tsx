"use client";

import { useMemo, useState, type ReactNode } from "react";
import { format, parseISO, subDays } from "date-fns";
import { WeightTrendChart } from "@/components/dashboard/weight-trend-chart";
import {
  formatMetricValue,
  getActivityMetricUnit,
} from "@/lib/activity-metrics";
import { resolveDateRange, type DateRangePreset } from "@/lib/utils/date-ranges";
import { formatDisplayDate, getTodayString } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Activity, ActivityLog } from "@/types/database";

type VisualMode = "heatmap" | "chart";

type NumericActivityVisualProps = {
  activity: Activity;
  logs: ActivityLog[];
  today?: string;
};

function getNumericHeatColor(value: number, max: number): string {
  if (value <= 0 || max <= 0) return "bg-white ring-1 ring-inset ring-stone-200";
  const ratio = value / max;
  if (ratio < 0.25) return "bg-emerald-200";
  if (ratio < 0.5) return "bg-emerald-400";
  if (ratio < 0.75) return "bg-emerald-500";
  return "bg-emerald-700";
}

export function NumericActivityVisual({
  activity,
  logs,
  today = getTodayString(),
}: NumericActivityVisualProps) {
  const unit = getActivityMetricUnit(activity);
  const [rangePreset, setRangePreset] = useState<DateRangePreset>("week");
  const [visualMode, setVisualMode] = useState<VisualMode>("chart");
  const [customStart, setCustomStart] = useState(
    format(subDays(parseISO(`${today}T12:00:00`), 13), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(today);

  const { days: rangeDays, label: rangeLabel } = useMemo(
    () => resolveDateRange(rangePreset, today, customStart, customEnd),
    [rangePreset, today, customStart, customEnd]
  );

  const activityLogs = useMemo(
    () =>
      logs.filter(
        (l) =>
          l.activity_id === activity.id &&
          l.date >= rangeDays[0] &&
          l.date <= rangeDays[rangeDays.length - 1]
      ),
    [logs, activity.id, rangeDays]
  );

  const logByDate = useMemo(
    () => new Map(activityLogs.map((l) => [l.date, l])),
    [activityLogs]
  );

  const chartPoints = useMemo(
    () =>
      activityLogs
        .filter((l) => l.metric_value != null && Number(l.metric_value) > 0)
        .map((l) => ({ date: l.date, value: Number(l.metric_value) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [activityLogs]
  );

  const { daysLogged, totalValue, maxValue } = useMemo(() => {
    let days = 0;
    let total = 0;
    let max = 0;
    for (const d of rangeDays) {
      const v = Number(logByDate.get(d)?.metric_value ?? 0);
      if (v > 0) {
        days += 1;
        total += v;
        max = Math.max(max, v);
      }
    }
    return { daysLogged: days, totalValue: total, maxValue: max };
  }, [rangeDays, logByDate]);

  const heatCells = useMemo(
    () =>
      rangeDays.map((date) => {
        const value = Number(logByDate.get(date)?.metric_value ?? 0);
        return {
          date,
          value,
          label:
            value > 0
              ? `${formatDisplayDate(date)} — ${formatMetricValue(value, activity)}`
              : `${formatDisplayDate(date)} — no entry`,
          colorClass: getNumericHeatColor(value, maxValue),
        };
      }),
    [rangeDays, logByDate, activity, maxValue]
  );

  const formatChartValue = (v: number) =>
    Number.isInteger(v) ? String(v) : v.toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: "week" as const, label: "Last 1 week" },
            { id: "month" as const, label: "Last 1 month" },
            { id: "custom" as const, label: "Custom" },
          ] as const
        ).map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={rangePreset === id ? "default" : "outline"}
            className={cn(
              "h-8 text-xs",
              rangePreset === id
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "border-stone-300"
            )}
            onClick={() => setRangePreset(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {rangePreset === "custom" && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-stone-200 bg-stone-50/80 p-3">
          <div className="space-y-1">
            <Label htmlFor={`${activity.id}-from`} className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id={`${activity.id}-from`}
              type="date"
              value={customStart}
              max={customEnd || today}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 border-stone-300 bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${activity.id}-to`} className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id={`${activity.id}-to`}
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 border-stone-300 bg-white"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/70">
            {rangeLabel}
          </p>
          <p className="text-2xl font-bold tabular-nums text-emerald-900">
            {daysLogged}
            <span className="ml-1 text-sm font-normal text-emerald-700">
              days logged
            </span>
          </p>
          {totalValue > 0 && (
            <p className="mt-0.5 text-sm font-semibold text-emerald-800">
              Total: {formatMetricValue(totalValue, activity)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-emerald-950">
            {activity.name}
            {unit ? ` (${unit})` : ""}
          </p>
          <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
            <button
              type="button"
              onClick={() => setVisualMode("heatmap")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                visualMode === "heatmap"
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-emerald-800"
              )}
            >
              Heatmap
            </button>
            <button
              type="button"
              onClick={() => setVisualMode("chart")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                visualMode === "chart"
                  ? "bg-emerald-600 text-white"
                  : "text-muted-foreground hover:text-emerald-800"
              )}
            >
              Chart
            </button>
          </div>
        </div>

        {visualMode === "heatmap" ? (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {(() => {
                const first = rangeDays[0];
                if (!first) return null;
                const [y, m, d] = first.split("-").map(Number);
                const pad = (new Date(y, m - 1, d).getDay() + 6) % 7;
                const cells: ReactNode[] = Array.from({ length: pad }, (_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ));
                for (const cell of heatCells) {
                  cells.push(
                    <div
                      key={cell.date}
                      title={cell.label}
                      className={cn(
                        "aspect-square rounded-md transition-colors",
                        cell.colorClass,
                        cell.date === today && "ring-2 ring-emerald-700 ring-offset-1"
                      )}
                    />
                  );
                }
                while (cells.length % 7 !== 0) {
                  cells.push(
                    <div key={`tail-${cells.length}`} className="aspect-square" />
                  );
                }
                return cells;
              })()}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="size-3 rounded-sm bg-white ring-1 ring-stone-200" />
              <div className="size-3 rounded-sm bg-emerald-200" />
              <div className="size-3 rounded-sm bg-emerald-400" />
              <div className="size-3 rounded-sm bg-emerald-500" />
              <div className="size-3 rounded-sm bg-emerald-700" />
              <span>More</span>
            </div>
          </>
        ) : chartPoints.length > 0 ? (
          <WeightTrendChart
            points={chartPoints}
            today={today}
            trendLabel=""
            defaultChartType="bar"
            showTypeToggle={false}
            showRangeFilters={false}
            formatValue={formatChartValue}
            formatDisplay={(v) => formatMetricValue(v, activity)}
            valueUnit={unit}
          />
        ) : (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Log values on your checklist to see a chart here.
          </p>
        )}
      </div>
    </div>
  );
}
