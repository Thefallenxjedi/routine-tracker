"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleActivityLog } from "@/lib/actions/logs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityWithLog } from "@/types/database";

type DailyChecklistProps = {
  activities: ActivityWithLog[];
  today: string;
};

export function DailyChecklist({ activities, today }: DailyChecklistProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticActivities, setOptimisticActivities] = useOptimistic(
    activities,
    (state, { id, completed }: { id: string; completed: boolean }) =>
      state.map((a) =>
        a.id === id
          ? {
              ...a,
              todayLog: {
                id: a.todayLog?.id ?? "",
                activity_id: a.id,
                date: today,
                completed,
                created_at: a.todayLog?.created_at ?? new Date().toISOString(),
              },
            }
          : a
      )
  );

  function handleToggle(activityId: string, completed: boolean) {
    startTransition(async () => {
      setOptimisticActivities({ id: activityId, completed });
      const result = await toggleActivityLog(activityId, today, completed);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  if (activities.length === 0) {
    return (
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Daily Checklist</CardTitle>
        <CardDescription>Mark activities as done for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {optimisticActivities.map((activity) => {
          const completed = activity.todayLog?.completed ?? false;
          return (
            <label
              key={activity.id}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50 ${
                isPending ? "opacity-80" : ""
              } ${completed ? "bg-emerald-50/50" : ""}`}
            >
              <Checkbox
                checked={completed}
                onCheckedChange={(checked) =>
                  handleToggle(activity.id, checked === true)
                }
                className="size-5"
              />
              <span
                className={`flex-1 text-sm font-medium ${
                  completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {activity.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {activity.category}
              </Badge>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
