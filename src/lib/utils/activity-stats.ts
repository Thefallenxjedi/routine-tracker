import { isActivityLogDone } from "@/lib/activity-metrics";
import type { Activity, ActivityLog } from "@/types/database";

export type ActivityDayPoint = {
  date: string;
  completed: boolean;
};

export function computeActivityMonthStats(
  activity: Activity,
  logs: ActivityLog[],
  monthDays: string[]
): ActivityDayPoint[] {
  const logMap = new Map(
    logs
      .filter((l) => l.activity_id === activity.id)
      .map((l) => [l.date, l])
  );
  const createdDate = activity.created_at.slice(0, 10);

  return monthDays.map((date) => {
    const log = logMap.get(date);
    return {
      date,
      completed:
        date >= createdDate ? isActivityLogDone(log, activity) : false,
    };
  });
}

export function computeActivityLinePoints(points: ActivityDayPoint[]): number[] {
  let cumulative = 0;
  return points.map((p) => {
    if (p.completed) cumulative += 1;
    return cumulative;
  });
}
