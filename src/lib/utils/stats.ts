import type { Activity, ActivityLog, DayStat } from "@/types/database";

function buildLogIndex(logs: ActivityLog[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!log.completed) continue;
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
  const logIndex = buildLogIndex(logs);

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
  const completed = activeActivities.filter(
    (a) => todayLogs.get(a.id)?.completed
  ).length;
  const rate = total > 0 ? completed / total : 0;

  return { completed, total, rate };
}
