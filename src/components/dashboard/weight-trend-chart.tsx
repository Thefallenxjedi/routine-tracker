"use client";

import { useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import { formatDisplayDate } from "@/lib/utils/dates";
import { formatWeightDisplay, formatWeightKg } from "@/lib/utils/weight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type WeightChartPoint = {
  date: string;
  value: number;
};

type RangePreset = "week" | "month" | "custom";
type ChartType = "line" | "bar";

type WeightTrendChartProps = {
  points: WeightChartPoint[];
  today: string;
  trendLabel?: string;
  defaultChartType?: ChartType;
  showTypeToggle?: boolean;
  showRangeFilters?: boolean;
  formatValue?: (value: number) => string;
  formatDisplay?: (value: number) => string;
  valueUnit?: string;
  emptyMessage?: string;
};

const PLOT_HEIGHT = 180;
const PAD_LEFT = 48;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

function filterByRange(
  points: WeightChartPoint[],
  preset: RangePreset,
  today: string,
  customStart: string,
  customEnd: string
): WeightChartPoint[] {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));

  if (preset === "week") {
    const start = format(subDays(parseISO(`${today}T12:00:00`), 6), "yyyy-MM-dd");
    return sorted.filter((p) => p.date >= start && p.date <= today);
  }

  if (preset === "month") {
    const start = format(subDays(parseISO(`${today}T12:00:00`), 29), "yyyy-MM-dd");
    return sorted.filter((p) => p.date >= start && p.date <= today);
  }

  if (customStart && customEnd) {
    const start = customStart <= customEnd ? customStart : customEnd;
    const end = customStart <= customEnd ? customEnd : customStart;
    return sorted.filter((p) => p.date >= start && p.date <= end);
  }

  return sorted;
}

function getYScale(values: number[]) {
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const padding = Math.max((maxV - minV) * 0.12, 0.25);
  const chartMin = minV - padding;
  const chartMax = maxV + padding;
  const range = chartMax - chartMin || 1;

  return {
    chartMin,
    chartMax,
    range,
    toY: (value: number) =>
      PAD_TOP +
      (1 - (value - chartMin) / range) * (PLOT_HEIGHT - PAD_TOP - PAD_BOTTOM),
  };
}

export function WeightTrendChart({
  points,
  today,
  trendLabel = "Weight trend",
  defaultChartType = "line",
  showTypeToggle = true,
  showRangeFilters = true,
  formatValue: formatValueProp,
  formatDisplay: formatDisplayProp,
  valueUnit = "kg",
  emptyMessage = "No entries in this date range.",
}: WeightTrendChartProps) {
  const [rangePreset, setRangePreset] = useState<RangePreset>("week");
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [customStart, setCustomStart] = useState(
    format(subDays(parseISO(`${today}T12:00:00`), 13), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(today);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    if (!showRangeFilters) return sorted;
    return filterByRange(points, rangePreset, today, customStart, customEnd);
  }, [points, rangePreset, today, customStart, customEnd, showRangeFilters]);

  const scale = useMemo(
    () => (filtered.length ? getYScale(filtered.map((p) => p.value)) : null),
    [filtered]
  );

  const yTicks = useMemo(() => {
    if (!scale) return [];
    const { chartMin, chartMax } = scale;
    const mid = (chartMin + chartMax) / 2;
    return [chartMax, mid, chartMin];
  }, [scale]);

  function getX(index: number, count: number, width: number) {
    if (count <= 1) return PAD_LEFT + (width - PAD_LEFT - PAD_RIGHT) / 2;
    return (
      PAD_LEFT +
      (index / (count - 1)) * (width - PAD_LEFT - PAD_RIGHT)
    );
  }

  if (points.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Your chart will appear after you save today&apos;s weight.
      </p>
    );
  }

  const plotWidth = 360;
  const hovered = hoveredIndex != null ? filtered[hoveredIndex] : null;
  const hoveredX =
    scale && hoveredIndex != null
      ? getX(hoveredIndex, filtered.length, plotWidth)
      : 0;
  const hoveredY =
    scale && hovered ? scale.toY(hovered.value) : 0;

  function handlePlotHover(clientX: number, svgRect: DOMRect) {
    if (filtered.length === 0 || !scale) return;
    const relX = ((clientX - svgRect.left) / svgRect.width) * plotWidth;
    const plotStart = PAD_LEFT;
    const plotEnd = plotWidth - PAD_RIGHT;
    const clamped = Math.max(plotStart, Math.min(plotEnd, relX));
    const ratio =
      filtered.length <= 1
        ? 0
        : (clamped - plotStart) / (plotEnd - plotStart);
    const index = Math.round(ratio * (filtered.length - 1));
    setHoveredIndex(index);
  }

  const linePath =
    scale && filtered.length > 1
      ? filtered
          .map((p, i) => {
            const x = getX(i, filtered.length, plotWidth);
            const y = scale.toY(p.value);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const formatValue = formatValueProp ?? formatWeightKg;
  const formatDisplay =
    formatDisplayProp ??
    (formatValueProp
      ? (v: number) =>
          valueUnit ? `${formatValue(v)} ${valueUnit}` : formatValue(v)
      : formatWeightDisplay);
  const showHeader = Boolean(trendLabel) || showTypeToggle;

  return (
    <div className="space-y-3">
      {showHeader && (
      <div className="flex flex-wrap items-center justify-between gap-2">
        {trendLabel ? (
          <p className="text-xs font-medium text-muted-foreground">{trendLabel}</p>
        ) : (
          <span />
        )}
        {showTypeToggle && (
        <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setChartType("line")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              chartType === "line"
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:text-emerald-800"
            )}
          >
            Line
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              chartType === "bar"
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:text-emerald-800"
            )}
          >
            Bar
          </button>
        </div>
        )}
      </div>
      )}

      {showRangeFilters && (
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
      )}

      {showRangeFilters && rangePreset === "custom" && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-stone-200 bg-stone-50/80 p-3">
          <div className="space-y-1">
            <Label htmlFor="weight-from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="weight-from"
              type="date"
              value={customStart}
              max={customEnd || today}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 border-stone-300 bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="weight-to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="weight-to"
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

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className={cn(showRangeFilters && "rounded-lg border border-stone-200 bg-white p-3")}>
          <div className="relative">
            <svg
              viewBox={`0 0 ${plotWidth} ${PLOT_HEIGHT}`}
              className="h-[180px] w-full touch-none"
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                if (chartType === "line") {
                  handlePlotHover(e.clientX, e.currentTarget.getBoundingClientRect());
                }
              }}
              onTouchEnd={() => setHoveredIndex(null)}
            >
              {scale &&
                yTicks.map((tick) => {
                  const y = scale.toY(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={PAD_LEFT}
                        y1={y}
                        x2={plotWidth - PAD_RIGHT}
                        y2={y}
                        stroke="#e7e5e4"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={PAD_LEFT - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-stone-500 text-[9px]"
                        style={{ fontSize: "9px" }}
                      >
                        {formatValue(tick)}
                      </text>
                    </g>
                  );
                })}

              {chartType === "line" && scale && filtered.length > 1 && (
                <>
                  <path
                    d={`${linePath} L ${getX(filtered.length - 1, filtered.length, plotWidth)} ${PLOT_HEIGHT - PAD_BOTTOM} L ${PAD_LEFT} ${PLOT_HEIGHT - PAD_BOTTOM} Z`}
                    fill="#10b981"
                    fillOpacity="0.12"
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}

              {chartType === "bar" &&
                scale &&
                filtered.map((p, i) => {
                  const barWidth =
                    filtered.length > 1
                      ? Math.max(
                          6,
                          (plotWidth - PAD_LEFT - PAD_RIGHT) / filtered.length - 2
                        )
                      : 32;
                  const x =
                    getX(i, filtered.length, plotWidth) - barWidth / 2;
                  const y = scale.toY(p.value);
                  const height = PLOT_HEIGHT - PAD_BOTTOM - y;
                  return (
                    <rect
                      key={p.date}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(height, 2)}
                      rx={3}
                      fill={
                        hoveredIndex === i ? "#047857" : "#10b981"
                      }
                      onMouseEnter={() => setHoveredIndex(i)}
                      onTouchStart={() => setHoveredIndex(i)}
                    />
                  );
                })}

              {chartType === "line" &&
                scale &&
                filtered.map((p, i) => {
                  const cx = getX(i, filtered.length, plotWidth);
                  const cy = scale.toY(p.value);
                  return (
                    <g key={p.date}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="12"
                        fill="transparent"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onTouchStart={() => setHoveredIndex(i)}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={hoveredIndex === i ? 5 : 3.5}
                        fill={hoveredIndex === i ? "#047857" : "#059669"}
                        stroke="white"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                        pointerEvents="none"
                      />
                    </g>
                  );
                })}

              {chartType === "line" &&
                scale &&
                filtered.length === 1 &&
                filtered.map((p, i) => {
                  const cx = getX(i, 1, plotWidth);
                  const cy = scale.toY(p.value);
                  const barWidth = 24;
                  const y = cy;
                  const height = PLOT_HEIGHT - PAD_BOTTOM - y;
                  return (
                    <rect
                      key={p.date}
                      x={cx - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={Math.max(height, 2)}
                      rx={3}
                      fill="#10b981"
                      onMouseEnter={() => setHoveredIndex(i)}
                    />
                  );
                })}
            </svg>

            {hovered && scale && (
              <div
                className="pointer-events-none absolute z-10 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
                style={{
                  left: `${(hoveredX / plotWidth) * 100}%`,
                  top: `${(hoveredY / PLOT_HEIGHT) * 100 - 12}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="font-semibold tabular-nums text-emerald-900">
                  {formatDisplay(hovered.value)}
                </p>
                <p className="text-muted-foreground">
                  {formatDisplayDate(hovered.date)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{formatDisplayDate(filtered[0].date)}</span>
            {filtered.length > 1 && (
              <span>{formatDisplayDate(filtered[filtered.length - 1].date)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
