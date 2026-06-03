"use client";

import { ValueTrendChart } from "@/components/charts/value-trend-chart";
import {
  getActivityMetricTrendPoints,
  getActivityMetricUnit,
} from "@/lib/activity-metrics";
import type { Activity, ActivityLog } from "@/types/database";

type ActivityMetricTrendProps = {
  activity: Activity;
  logs: ActivityLog[];
};

export function ActivityMetricTrend({ activity, logs }: ActivityMetricTrendProps) {
  const unit = getActivityMetricUnit(activity);
  const points = getActivityMetricTrendPoints(activity.id, logs);

  return (
    <ValueTrendChart
      points={points}
      unit={unit}
      trendLabel={`${activity.name} trend`}
      emptyMessage="Save a value on your dashboard checklist to see your trend."
    />
  );
}
