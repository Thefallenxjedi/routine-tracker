"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Scale } from "lucide-react";
import { saveWeight } from "@/lib/actions/weight";
import { formatDisplayDate } from "@/lib/utils/dates";
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
import type { WeightLog } from "@/types/database";

type WeightTrackerProps = {
  today: string;
  todayWeight?: WeightLog;
  recentLogs: WeightLog[];
  weightAutomatic?: boolean;
};

function storageKey(date: string) {
  return `routine-weight-${date}`;
}

export function WeightTracker({
  today,
  todayWeight,
  recentLogs,
  weightAutomatic = true,
}: WeightTrackerProps) {
  const router = useRouter();
  const gradientId = useId();
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localLogs, setLocalLogs] = useState(recentLogs);
  const [loggedToday, setLoggedToday] = useState<WeightLog | undefined>();

  useEffect(() => {
    setLocalLogs(recentLogs);

    const fromServer = todayWeight ?? recentLogs.find((l) => l.date === today);
    if (!weightAutomatic) {
      setLoggedToday(fromServer);
      if (fromServer) {
        setWeight(String(fromServer.weight_kg));
      }
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey(today));
      if (stored) {
        setLoggedToday(JSON.parse(stored) as WeightLog);
        return;
      }
    } catch {
      // ignore
    }
    setLoggedToday(fromServer);
  }, [recentLogs, todayWeight, today, weightAutomatic]);

  const hasLoggedToday = !!loggedToday;
  const showForm = !weightAutomatic || !hasLoggedToday;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight);
    if (Number.isNaN(value)) {
      toast.error("Enter a valid number");
      return;
    }

    startTransition(async () => {
      const result = await saveWeight(today, value);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const entry: WeightLog = {
        id: loggedToday?.id ?? crypto.randomUUID(),
        user_id: loggedToday?.user_id ?? "",
        date: today,
        weight_kg: value,
        created_at: new Date().toISOString(),
      };

      setLoggedToday(entry);
      setLocalLogs((prev) => [
        ...prev.filter((l) => l.date !== today),
        entry,
      ]);
      if (weightAutomatic) {
        try {
          localStorage.setItem(storageKey(today), JSON.stringify(entry));
        } catch {
          // ignore
        }
      }
      setWeight("");
      toast.success("Weight saved for today");
      router.refresh();
    });
  }

  const chartData = useMemo(
    () =>
      [...localLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-30),
    [localLogs]
  );

  const minW = chartData.length
    ? Math.min(...chartData.map((l) => l.weight_kg))
    : 0;
  const maxW = chartData.length
    ? Math.max(...chartData.map((l) => l.weight_kg))
    : 100;
  const padding = Math.max((maxW - minW) * 0.15, 0.5);
  const chartMin = minW - padding;
  const chartMax = maxW + padding;
  const chartRange = chartMax - chartMin || 1;

  const lineWidth =
    chartData.length > 1 ? 100 / (chartData.length - 1) : 0;
  const linePath =
    chartData.length > 1
      ? chartData
          .map((log, i) => {
            const x = i * lineWidth;
            const y = 100 - ((log.weight_kg - chartMin) / chartRange) * 88 - 6;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  const singleBarHeightPct =
    chartData.length === 1
      ? Math.max(
          28,
          Math.min(92, ((chartData[0].weight_kg - chartMin) / chartRange) * 88 + 12)
        )
      : 0;

  return (
    <Card className="border-stone-200 bg-stone-50/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <Scale className="size-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle>Weight Tracker</CardTitle>
            <CardDescription>
              {weightAutomatic
                ? hasLoggedToday
                  ? `Logged today: ${loggedToday.weight_kg} kg`
                  : "Log your weight once per day (kg)"
                : hasLoggedToday
                  ? `Manual mode · today: ${loggedToday.weight_kg} kg`
                  : "Manual mode — log or update your weight anytime"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="weight" className="sr-only">
                Weight today
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="1"
                max="499"
                placeholder="Enter today's weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border-stone-300 bg-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        )}

        {chartData.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Weight trend</span>
              {chartData.length > 1 && (
                <span>
                  {chartData[0].weight_kg} →{" "}
                  {chartData[chartData.length - 1].weight_kg} kg
                </span>
              )}
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-100/50 p-3">
              {chartData.length === 1 ? (
                <div
                  className="flex h-44 flex-col items-center justify-end"
                  aria-label={`Weight ${chartData[0].weight_kg} kg on ${formatDisplayDate(chartData[0].date)}`}
                >
                  <p className="mb-2 text-lg font-bold tabular-nums text-emerald-800">
                    {chartData[0].weight_kg} kg
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
                    {chartData.map((log, i) => {
                      const x = i * lineWidth;
                      const y =
                        100 - ((log.weight_kg - chartMin) / chartRange) * 88 - 6;
                      return (
                        <circle
                          key={log.id}
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
        ) : (
          chartData.length === 0 && !hasLoggedToday && (
            <p className="text-center text-xs text-muted-foreground">
              Your chart will appear after you save today&apos;s weight.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
