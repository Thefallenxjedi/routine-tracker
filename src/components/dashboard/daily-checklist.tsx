"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO, subDays } from "date-fns";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { toggleActivityLog } from "@/lib/actions/logs";
import { ActivityCheck } from "@/components/dashboard/activity-check";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Activity, ActivityLog } from "@/types/database";

type DailyChecklistProps = {
  activities: Activity[];
  logs: ActivityLog[];
  today: string;
};

function formatSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE, MMM d");
}

function logsToMap(logs: ActivityLog[], date: string): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const log of logs) {
    if (log.date === date) {
      map.set(log.activity_id, log.completed);
    }
  }
  return map;
}

export function DailyChecklist({ activities, logs, today }: DailyChecklistProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minDate = format(subDays(parseISO(`${today}T12:00:00`), 60), "yyyy-MM-dd");

  const serverCompleted = useMemo(
    () => logsToMap(logs, selectedDate),
    [logs, selectedDate]
  );

  const [completed, setCompleted] = useState<Map<string, boolean>>(
    () => serverCompleted
  );

  useEffect(() => {
    setCompleted(serverCompleted);
  }, [serverCompleted]);

  const visibleActivities = useMemo(
    () =>
      activities.filter((a) => {
        const created = a.created_at.slice(0, 10);
        return created <= selectedDate;
      }),
    [activities, selectedDate]
  );

  const scheduleDashboardRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    refreshTimer.current = setTimeout(() => {
      router.refresh();
    }, 600);
  }, [router]);

  function handleToggle(activityId: string, next: boolean) {
    const previous = completed.get(activityId) ?? false;

    setCompleted((prev) => {
      const map = new Map(prev);
      map.set(activityId, next);
      return map;
    });

    void toggleActivityLog(activityId, selectedDate, next).then((result) => {
      if (result.error) {
        setCompleted((prev) => {
          const map = new Map(prev);
          map.set(activityId, previous);
          return map;
        });
        toast.error(result.error);
        return;
      }
      scheduleDashboardRefresh();
    });
  }

  const isToday = selectedDate === today;

  if (activities.length === 0) {
    return (
      <Card data-onboarding="daily-checklist" className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Daily Checklist</CardTitle>
          <CardDescription>No activities yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Link href="/activities" className="font-medium text-emerald-600 hover:underline">
              Create your first activity
            </Link>{" "}
            to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-onboarding="daily-checklist" className="border-stone-200 bg-stone-50/80">
      <CardHeader>
        <CardTitle>Daily Checklist</CardTitle>
        <CardDescription>
          {isToday
            ? "Mark activities done for today"
            : `Backfilling for ${formatSelectedDate(selectedDate)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3 rounded-lg border border-stone-200 bg-stone-100/80 p-3">
          <CalendarDays className="mb-2 size-4 shrink-0 text-emerald-700" />
          <div className="flex-1 space-y-1">
            <Label htmlFor="checklist-date" className="text-xs text-muted-foreground">
              Pick a day (including past days you missed)
            </Label>
            <Input
              id="checklist-date"
              type="date"
              value={selectedDate}
              min={minDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-stone-300 bg-white"
            />
          </div>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="mb-0.5 text-xs font-medium text-emerald-700 hover:underline"
            >
              Back to today
            </button>
          )}
        </div>

        {visibleActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activities existed on this date yet.
          </p>
        ) : (
          <div className="space-y-1">
            {visibleActivities.map((activity) => {
              const isDone = completed.get(activity.id) ?? false;
              return (
                <div
                  key={activity.id}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 ${
                    isDone ? "bg-emerald-100" : "bg-white/60"
                  }`}
                >
                  <ActivityCheck
                    checked={isDone}
                    label={`Mark ${activity.name} as done`}
                    onCheckedChange={(checked) =>
                      handleToggle(activity.id, checked)
                    }
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      isDone ? "text-emerald-800" : "text-emerald-950"
                    }`}
                  >
                    {activity.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${isDone ? "bg-emerald-200/80 text-emerald-900" : ""}`}
                  >
                    {activity.category}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
