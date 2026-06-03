import { format, subDays, parseISO } from "date-fns";
import { getServerSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getMonthRange, getTodayString, getWeekRange } from "@/lib/utils/dates";
import { computeDailyProgress, computeDayStats } from "@/lib/utils/stats";
import { calculateStreaks } from "@/lib/utils/streaks";
import type { Activity, ActivityLog, WeightLog } from "@/types/database";

async function getDataClient() {
  const session = await getServerSession();
  if (session) {
    return { supabase: session.supabase, userId: session.userId };
  }
  const supabase = await createClient();
  return { supabase, userId: null as string | null };
}

async function getUserDisplayName(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "there";

  const meta = user.user_metadata ?? {};
  const full =
    meta.full_name || meta.name || meta.user_name || user.email?.split("@")[0];
  if (typeof full === "string" && full.length > 0) {
    return full.split(" ")[0];
  }
  return "there";
}

export async function getDashboardData() {
  const { supabase, userId } = await getDataClient();
  const today = getTodayString();
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();
  const userName = await getUserDisplayName();

  const backfillStart = format(
    subDays(parseISO(`${today}T12:00:00`), 60),
    "yyyy-MM-dd"
  );

  const rangeStart = [weekRange.start, monthRange.start, backfillStart].sort()[0];
  const rangeEnd =
    monthRange.end > weekRange.end ? monthRange.end : weekRange.end;

  const activitiesQuery = supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: true });

  const logsQuery = supabase
    .from("activity_logs")
    .select("*")
    .gte("date", rangeStart)
    .lte("date", rangeEnd);

  if (userId) {
    activitiesQuery.eq("user_id", userId);
  }

  const [activitiesResult, logsResult] = await Promise.all([
    activitiesQuery,
    logsQuery,
  ]);

  if (activitiesResult.error) throw activitiesResult.error;
  if (logsResult.error) throw logsResult.error;

  let activities = (activitiesResult.data ?? []) as Activity[];
  let logs = (logsResult.data ?? []) as ActivityLog[];

  if (!userId) {
    activities = [];
    logs = [];
  } else {
    const activityIds = new Set(activities.map((a) => a.id));
    logs = logs.filter((l) => activityIds.has(l.activity_id));
  }

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
  const weeklyStats = computeDayStats(activeActivities, logs, weekRange.days);
  const monthlyStats = computeDayStats(activeActivities, logs, monthRange.days);
  const streaks = calculateStreaks(activeActivities, streakLogs, today);

  let weightLogs: WeightLog[] = [];
  let todayWeight: WeightLog | undefined;

  if (userId) {
    const { data: weightData, error: weightError } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(60);

    if (!weightError && weightData) {
      weightLogs = weightData.map((w) => ({
        ...w,
        weight_kg: Number(w.weight_kg),
      })) as WeightLog[];
      todayWeight = weightLogs.find((w) => w.date === today);
    }
  }

  return {
    today,
    userName,
    activitiesWithLogs,
    activities,
    activeActivities,
    logs,
    monthDays: monthRange.days,
    dailyProgress,
    weeklyStats,
    monthlyStats,
    streaks,
    weightLogs,
    todayWeight,
    hasActivities: activeActivities.length > 0,
  };
}

export async function getActivitiesPageData() {
  const { supabase, userId } = await getDataClient();
  const monthRange = getMonthRange();

  if (!userId) {
    return {
      active: [],
      archived: [],
      activities: [],
      logs: [],
      monthDays: monthRange.days,
      overallStats: [],
    };
  }

  const [activitiesResult, logsResult] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("*")
      .gte("date", monthRange.start)
      .lte("date", monthRange.end),
  ]);

  if (activitiesResult.error) throw activitiesResult.error;
  if (logsResult.error) throw logsResult.error;

  const activities = (activitiesResult.data ?? []) as Activity[];
  const activityIds = new Set(activities.map((a) => a.id));
  const logs = ((logsResult.data ?? []) as ActivityLog[]).filter((l) =>
    activityIds.has(l.activity_id)
  );

  const activeActivities = activities.filter((a) => a.is_active);
  const monthlyStats = computeDayStats(activeActivities, logs, monthRange.days);

  return {
    active: activeActivities,
    archived: activities.filter((a) => !a.is_active),
    activities,
    logs,
    monthDays: monthRange.days,
    overallStats: monthlyStats,
  };
}
