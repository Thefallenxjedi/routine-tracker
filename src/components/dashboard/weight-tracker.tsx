"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { WeightTrendChart } from "@/components/dashboard/weight-trend-chart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Scale } from "lucide-react";
import { saveWeight } from "@/lib/actions/weight";
import { formatWeightDisplay, formatWeightKg, roundWeightKg } from "@/lib/utils/weight";
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
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localLogs, setLocalLogs] = useState(recentLogs);
  const [loggedToday, setLoggedToday] = useState<WeightLog | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalLogs(recentLogs);

    const fromServer = todayWeight ?? recentLogs.find((l) => l.date === today);
    if (!weightAutomatic) {
      setLoggedToday(fromServer);
      if (fromServer) {
        setWeight(formatWeightKg(fromServer.weight_kg));
      }
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey(today));
      if (stored) {
        const parsed = JSON.parse(stored) as WeightLog;
        setLoggedToday(parsed);
        return;
      }
    } catch {
      // ignore
    }
    setLoggedToday(fromServer);
  }, [recentLogs, todayWeight, today, weightAutomatic]);

  const hasLoggedToday = !!loggedToday;
  const showForm =
    !weightAutomatic || !hasLoggedToday || isEditing;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = roundWeightKg(parseFloat(weight));
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
      setIsEditing(false);
      toast.success(
        hasLoggedToday ? "Weight updated for today" : "Weight saved for today"
      );
      router.refresh();
    });
  }

  const chartPoints = useMemo(
    () =>
      [...localLogs]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((l) => ({ date: l.date, value: l.weight_kg })),
    [localLogs]
  );

  return (
    <Card data-onboarding="weight" className="border-stone-200 bg-stone-50/80">
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
                  ? `Logged today: ${formatWeightDisplay(loggedToday.weight_kg)}`
                  : "Log your weight once per day (kg)"
                : hasLoggedToday
                  ? `Manual mode · today: ${formatWeightDisplay(loggedToday.weight_kg)}`
                  : "Manual mode — log or update your weight anytime"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLoggedToday && weightAutomatic && !isEditing && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-medium text-emerald-900">
              Today: <span className="tabular-nums">{formatWeightDisplay(loggedToday.weight_kg)}</span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100"
              onClick={() => {
                setWeight(formatWeightKg(loggedToday.weight_kg));
                setIsEditing(true);
              }}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="weight" className="sr-only">
                Weight today
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="1"
                max="499"
                placeholder="Enter today's weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border-stone-300 bg-white"
              />
            </div>
            <div className="flex gap-2">
              {isEditing && weightAutomatic && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="border-stone-300"
                  onClick={() => {
                    setIsEditing(false);
                    setWeight("");
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isPending ? "Saving..." : hasLoggedToday ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        )}

        {(chartPoints.length > 0 || hasLoggedToday) && (
          <WeightTrendChart points={chartPoints} today={today} />
        )}
        {chartPoints.length === 0 && !hasLoggedToday && (
          <p className="text-center text-xs text-muted-foreground">
            Your chart will appear after you save today&apos;s weight.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
