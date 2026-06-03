import { format, parseISO, subDays } from "date-fns";
import { isActivityLogDone } from "@/lib/activity-metrics";
import type { Activity, ActivityLog, StreakInfo } from "@/types/database";

function getActivityStartDate(activity: Activity): string {
  return format(parseISO(activity.created_at), "yyyy-MM-dd");
}

export function calculateStreaks(
  activities: Activity[],
  logs: ActivityLog[],
  today: string
): StreakInfo[] {
  const logsByActivityAndDate = new Map<string, Map<string, ActivityLog>>();

  for (const log of logs) {
    if (!logsByActivityAndDate.has(log.activity_id)) {
      logsByActivityAndDate.set(log.activity_id, new Map());
    }
    logsByActivityAndDate.get(log.activity_id)!.set(log.date, log);
  }

  return activities.map((activity) => {
    const startDate = getActivityStartDate(activity);
    const activityLogs = logsByActivityAndDate.get(activity.id);
    let streak = 0;
    let currentDate = today;

    const todayLog = activityLogs?.get(today);
    if (!isActivityLogDone(todayLog, activity)) {
      const yesterday = format(
        subDays(parseISO(`${today}T12:00:00`), 1),
        "yyyy-MM-dd"
      );
      currentDate = yesterday;
    }

    while (currentDate >= startDate) {
      const log = activityLogs?.get(currentDate);
      if (isActivityLogDone(log, activity)) {
        streak++;
        currentDate = format(
          subDays(parseISO(`${currentDate}T12:00:00`), 1),
          "yyyy-MM-dd"
        );
      } else {
        break;
      }
    }

    return {
      activityId: activity.id,
      activityName: activity.name,
      currentStreak: streak,
    };
  });
}
