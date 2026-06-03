export type TrackingType = "yes_no" | "numeric";

export type Activity = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  is_active: boolean;
  tracking_type: TrackingType;
  metric_key: string;
  metric_label: string | null;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  activity_id: string;
  date: string;
  completed: boolean;
  metric_value: number | null;
  created_at: string;
};

export type ActivityWithLog = Activity & {
  todayLog?: ActivityLog;
};

export type StreakInfo = {
  activityId: string;
  activityName: string;
  currentStreak: number;
};

export type DayStat = {
  date: string;
  completed: number;
  total: number;
  rate: number;
};

export type WeightLog = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  created_at: string;
};

export type UserPreferences = {
  weight_automatic: boolean;
};

export const ACTIVITY_CATEGORIES = [
  "General",
  "Health",
  "Learning",
  "Work",
  "Personal",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];
