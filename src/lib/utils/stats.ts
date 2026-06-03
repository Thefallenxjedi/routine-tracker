import { isActivityLogDone } from "@/lib/activity-metrics";
import type { Activity, ActivityLog, DayStat } from "@/types/database";

function buildLogIndex(
  activities: Activity[],
  logs: ActivityLog[]
): Map<string, Set<string>> {
  const activityMap = new Map(activities.map((a) => [a.id, a]));
  const index = new Map<string, Set<string>>();

  for (const log of logs) {
    const activity = activityMap.get(log.activity_id);
    if (!activity || !isActivityLogDone(log, activity)) continue;
    if (!index.has(log.date)) {
      index.set(log.date, new Set());
    }
    index.get(log.date)!.add(log.activity_id);
  }
  return index;
}

function getActivityCountForDate(activities: Activity[], date: string): number {
  return activities.filter((a) => {
    const createdDate = a.created_at.slice(0, 10);
    return createdDate <= date;
  }).length;
}

export function computeDayStats(
  activities: Activity[],
  logs: ActivityLog[],
  dates: string[]
): DayStat[] {
  const logIndex = buildLogIndex(activities, logs);

  return dates.map((date) => {
    const total = getActivityCountForDate(activities, date);
    const completed = logIndex.get(date)?.size ?? 0;
    const rate = total > 0 ? completed / total : 0;

    return { date, completed, total, rate };
  });
}

export function computeDailyProgress(
  activeActivities: Activity[],
  logs: ActivityLog[],
  today: string
): { completed: number; total: number; rate: number } {
  const todayLogs = new Map(
    logs.filter((l) => l.date === today).map((l) => [l.activity_id, l])
  );

  const total = activeActivities.length;
  const completed = activeActivities.filter((a) =>
    isActivityLogDone(todayLogs.get(a.id), a)
  ).length;
  const rate = total > 0 ? completed / total : 0;

  return { completed, total, rate };
}
