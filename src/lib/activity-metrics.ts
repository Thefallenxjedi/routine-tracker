import type { Activity, ActivityLog } from "@/types/database";

export type TrackingType = "yes_no" | "numeric";

export type MetricPreset = {
  key: string;
  label: string;
  trackingType: TrackingType;
  unit: string;
  placeholder: string;
  example?: string;
};

/** Global metric presets — pick one when creating an activity */
export const METRIC_PRESETS: MetricPreset[] = [
  {
    key: "yes_no",
    label: "Yes / No",
    trackingType: "yes_no",
    unit: "",
    placeholder: "",
    example: "Meditation, vitamins",
  },
  {
    key: "km",
    label: "Distance",
    trackingType: "numeric",
    unit: "km",
    placeholder: "5.2",
    example: "Running, cycling",
  },
  {
    key: "steps",
    label: "Steps",
    trackingType: "numeric",
    unit: "steps",
    placeholder: "8000",
    example: "Walking",
  },
  {
    key: "minutes",
    label: "Time",
    trackingType: "numeric",
    unit: "min",
    placeholder: "30",
    example: "Workout, reading",
  },
  {
    key: "reps",
    label: "Repetitions",
    trackingType: "numeric",
    unit: "reps",
    placeholder: "50",
    example: "Push-ups, squats",
  },
  {
    key: "pages",
    label: "Pages",
    trackingType: "numeric",
    unit: "pages",
    placeholder: "20",
    example: "Reading",
  },
  {
    key: "liters",
    label: "Water",
    trackingType: "numeric",
    unit: "L",
    placeholder: "2",
    example: "Hydration",
  },
  {
    key: "calories",
    label: "Calories",
    trackingType: "numeric",
    unit: "kcal",
    placeholder: "500",
    example: "Exercise burn",
  },
  {
    key: "custom",
    label: "Custom number",
    trackingType: "numeric",
    unit: "",
    placeholder: "1",
    example: "Your own unit",
  },
];

export function getMetricPreset(key: string): MetricPreset | undefined {
  return METRIC_PRESETS.find((p) => p.key === key);
}

export function normalizeActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    category: row.category as string,
    is_active: row.is_active as boolean,
    tracking_type: (row.tracking_type as TrackingType) ?? "yes_no",
    metric_key: (row.metric_key as string) ?? "yes_no",
    metric_label: (row.metric_label as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

export function normalizeActivityLog(row: Record<string, unknown>): ActivityLog {
  const raw = row.metric_value;
  return {
    id: row.id as string,
    activity_id: row.activity_id as string,
    date: row.date as string,
    completed: row.completed as boolean,
    metric_value:
      raw === null || raw === undefined ? null : Number(raw),
    created_at: row.created_at as string,
  };
}

export function getActivityMetricUnit(activity: Activity): string {
  if (activity.tracking_type === "yes_no") return "";
  if (activity.metric_key === "custom" && activity.metric_label) {
    return activity.metric_label;
  }
  return getMetricPreset(activity.metric_key)?.unit ?? "";
}

export function getActivityMetricLabel(activity: Activity): string {
  if (activity.tracking_type === "yes_no") return "Yes / No";
  const preset = getMetricPreset(activity.metric_key);
  if (activity.metric_key === "custom" && activity.metric_label) {
    return `Number (${activity.metric_label})`;
  }
  return preset ? `${preset.label} (${preset.unit})` : "Number";
}

export function isActivityLogDone(
  log: ActivityLog | undefined,
  activity: Activity
): boolean {
  if (!log) return false;
  if (activity.tracking_type === "numeric") {
    return log.metric_value != null && Number(log.metric_value) > 0;
  }
  return log.completed;
}

export function formatMetricValue(value: number, activity: Activity): string {
  const unit = getActivityMetricUnit(activity);
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return unit ? `${formatted} ${unit}` : formatted;
}
