"use client";

import { useState, useTransition } from "react";
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
};

export function WeightTracker({
  today,
  todayWeight,
  recentLogs,
}: WeightTrackerProps) {
  const [weight, setWeight] = useState(
    todayWeight ? String(todayWeight.weight_kg) : ""
  );
  const [isPending, startTransition] = useTransition();

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
      toast.success("Weight saved");
    });
  }

  const sorted = [...recentLogs].sort((a, b) => a.date.localeCompare(b.date));
  const minW = sorted.length ? Math.min(...sorted.map((l) => l.weight_kg)) : 0;
  const maxW = sorted.length ? Math.max(...sorted.map((l) => l.weight_kg)) : 1;
  const range = maxW - minW || 1;

  return (
    <Card className="border-emerald-100">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
            <Scale className="size-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle>Weight Tracker</CardTitle>
            <CardDescription>Log your weight daily (kg)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="weight" className="sr-only">
              Weight today
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="1"
              max="499"
              placeholder="e.g. 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border-emerald-200"
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

        {sorted.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Last {sorted.length} entries
            </p>
            <div className="flex h-20 items-end gap-1">
              {sorted.slice(-14).map((log) => {
                const height = ((log.weight_kg - minW) / range) * 70 + 20;
                return (
                  <div
                    key={log.id}
                    className="flex flex-1 flex-col items-center gap-1"
                    title={`${formatDisplayDate(log.date)}: ${log.weight_kg} kg`}
                  >
                    <div
                      className="w-full rounded-t bg-emerald-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {log.date.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
