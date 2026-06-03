import { createClient } from "@/lib/supabase/server";
import {
  getMonthRange,
  getTodayString,
  getWeekRange,
} from "@/lib/utils/dates";
import { computeDailyProgress, computeDayStats } from "@/lib/utils/stats";
import { calculateStreaks } from "@/lib/utils/streaks";
import type { Activity, ActivityLog } from "@/types/database";

export async function getDashboardData() {
  const supabase = await createClient();
  const today = getTodayString();
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();

  const rangeStart = weekRange.start < monthRange.start ? weekRange.start : monthRange.start;
  const rangeEnd = monthRange.end > weekRange.end ? monthRange.end : weekRange.end;

  const [activitiesResult, logsResult] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("*")
      .gte("date", rangeStart)
      .lte("date", rangeEnd),
  ]);

  if (activitiesResult.error) throw activitiesResult.error;
  if (logsResult.error) throw logsResult.error;

  const activities = activitiesResult.data as Activity[];
  const logs = logsResult.data as ActivityLog[];
  const activeActivities = activities.filter((a) => a.is_active);

  const streakLogs =
    activeActivities.length > 0
      ? (((
          await supabase
            .from("activity_logs")
            .select("*")
            .in(
              "activity_id",
              activeActivities.map((a) => a.id)
            )
            .eq("completed", true)
        ).data ?? []) as ActivityLog[])
      : [];

  const todayLogs = logs.filter((l) => l.date === today);
  const activitiesWithLogs = activeActivities.map((activity) => ({
    ...activity,
    todayLog: todayLogs.find((l) => l.activity_id === activity.id),
  }));

  const dailyProgress = computeDailyProgress(activeActivities, logs, today);
  const weeklyStats = computeDayStats(activities, logs, weekRange.days);
  const monthlyStats = computeDayStats(activities, logs, monthRange.days);
  const streaks = calculateStreaks(activeActivities, streakLogs, today);

  return {
    today,
    activitiesWithLogs,
    dailyProgress,
    weeklyStats,
    monthlyStats,
    streaks,
    hasActivities: activeActivities.length > 0,
  };
}

export async function getActivitiesData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const activities = data as Activity[];
  return {
    active: activities.filter((a) => a.is_active),
    archived: activities.filter((a) => !a.is_active),
  };
}
