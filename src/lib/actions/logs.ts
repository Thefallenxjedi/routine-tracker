"use server";

import { requireServerSession } from "@/lib/auth/session";
import { normalizeActivity } from "@/lib/activity-metrics";

export async function toggleActivityLog(
  activityId: string,
  date: string,
  completed: boolean
) {
  return saveActivityLog(activityId, date, { completed });
}

export async function saveActivityLog(
  activityId: string,
  date: string,
  payload: { completed?: boolean; metricValue?: number | null }
) {
  try {
    const { supabase } = await requireServerSession();

    const { data: activityRow, error: activityError } = await supabase
      .from("activities")
      .select("tracking_type, metric_key, metric_label")
      .eq("id", activityId)
      .single();

    if (activityError || !activityRow) {
      return { error: "Activity not found" };
    }

    const activity = normalizeActivity({
      id: activityId,
      user_id: "",
      name: "",
      category: "",
      is_active: true,
      created_at: "",
      tracking_type: activityRow.tracking_type,
      metric_key: activityRow.metric_key,
      metric_label: activityRow.metric_label,
    });

    let completed = payload.completed ?? false;
    let metric_value: number | null = null;

    if (activity.tracking_type === "numeric") {
      if (payload.metricValue !== undefined && payload.metricValue !== null) {
        const v = Number(payload.metricValue);
        if (Number.isNaN(v) || v < 0) {
          return { error: "Enter a valid number" };
        }
        metric_value = v;
        completed = v > 0;
      } else if (payload.completed === false) {
        metric_value = null;
        completed = false;
      }
    } else {
      completed = payload.completed ?? false;
    }

    const { error } = await supabase.from("activity_logs").upsert(
      {
        activity_id: activityId,
        date,
        completed,
        metric_value,
      },
      { onConflict: "activity_id,date" }
    );

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}
