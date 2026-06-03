"use client";

import { useId, useMemo } from "react";
import { formatDisplayDate } from "@/lib/utils/dates";

export type ValueTrendPoint = {
  date: string;
  value: number;
};

type ValueTrendChartProps = {
  points: ValueTrendPoint[];
  unit: string;
  trendLabel?: string;
  emptyMessage?: string;
};

function formatPointValue(value: number, unit: string) {
  const n = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return unit ? `${n} ${unit}` : n;
}

export function ValueTrendChart({
  points,
  unit,
  trendLabel = "Trend",
  emptyMessage = "Log values on your dashboard to see a chart here.",
}: ValueTrendChartProps) {
  const gradientId = useId();

  const chartData = useMemo(
    () => [...points].sort((a, b) => a.date.localeCompare(b.date)),
    [points]
  );

  const minV = chartData.length ? Math.min(...chartData.map((p) => p.value)) : 0;
  const maxV = chartData.length ? Math.max(...chartData.map((p) => p.value)) : 100;
  const padding = Math.max((maxV - minV) * 0.15, 0.5);
  const chartMin = minV - padding;
  const chartMax = maxV + padding;
  const chartRange = chartMax - chartMin || 1;

  const lineWidth =
    chartData.length > 1 ? 100 / (chartData.length - 1) : 0;
  const linePath =
    chartData.length > 1
      ? chartData
          .map((p, i) => {
            const x = i * lineWidth;
            const y = 100 - ((p.value - chartMin) / chartRange) * 88 - 6;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const singleBarHeightPct =
    chartData.length === 1
      ? Math.max(
          28,
          Math.min(92, ((chartData[0].value - chartMin) / chartRange) * 88 + 12)
        )
      : 0;

  if (chartData.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{trendLabel}</span>
        {chartData.length > 1 && (
          <span>
            {formatPointValue(chartData[0].value, unit)} →{" "}
            {formatPointValue(chartData[chartData.length - 1].value, unit)}
          </span>
        )}
      </div>
      <div className="rounded-lg border border-stone-200 bg-stone-100/50 p-3">
        {chartData.length === 1 ? (
          <div
            className="flex h-44 flex-col items-center justify-end"
            aria-label={`${formatPointValue(chartData[0].value, unit)} on ${formatDisplayDate(chartData[0].date)}`}
          >
            <p className="mb-2 text-lg font-bold tabular-nums text-emerald-800">
              {formatPointValue(chartData[0].value, unit)}
            </p>
            <div
              className="w-20 rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-500 shadow-md shadow-emerald-900/10 transition-all"
              style={{ height: `${singleBarHeightPct}%` }}
            />
            <p className="mt-3 text-[10px] font-medium text-muted-foreground">
              {formatDisplayDate(chartData[0].date)}
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-44 w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
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
              {chartData.map((p, i) => {
                const x = i * lineWidth;
                const y = 100 - ((p.value - chartMin) / chartRange) * 88 - 6;
                return (
                  <circle
                    key={p.date}
                    cx={x}
                    cy={y}
                    r="2.5"
                    fill="#059669"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{formatDisplayDate(chartData[0].date)}</span>
              <span>{formatDisplayDate(chartData[chartData.length - 1].date)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
