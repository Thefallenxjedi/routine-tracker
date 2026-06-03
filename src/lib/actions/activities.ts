"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getMetricPreset } from "@/lib/activity-metrics";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/types/database";

function validateCategory(category: string): ActivityCategory {
  return ACTIVITY_CATEGORIES.includes(category as ActivityCategory)
    ? (category as ActivityCategory)
    : "General";
}

function resolveTracking(metricKey: string, customLabel?: string) {
  const preset = getMetricPreset(metricKey);
  if (!preset) {
    return {
      tracking_type: "yes_no" as const,
      metric_key: "yes_no",
      metric_label: null as string | null,
    };
  }

  if (preset.key === "custom") {
    const label = customLabel?.trim();
    if (!label) {
      return { error: "Enter a custom unit label (e.g. miles, glasses)" };
    }
    return {
      tracking_type: "numeric" as const,
      metric_key: "custom",
      metric_label: label,
    };
  }

  return {
    tracking_type: preset.trackingType,
    metric_key: preset.key,
    metric_label: null as string | null,
  };
}

export async function createActivity(
  name: string,
  category: string,
  metricKey: string,
  customMetricLabel?: string
) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Name is required" };
  }

  const tracking = resolveTracking(metricKey, customMetricLabel);
  if ("error" in tracking) {
    return { error: tracking.error };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      name: trimmed,
      category: validateCategory(category),
      tracking_type: tracking.tracking_type,
      metric_key: tracking.metric_key,
      metric_label: tracking.metric_label,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/activities");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function updateActivity(
  id: string,
  name: string,
  category: string,
  metricKey: string,
  customMetricLabel?: string
) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Name is required" };
  }

  const tracking = resolveTracking(metricKey, customMetricLabel);
  if ("error" in tracking) {
    return { error: tracking.error };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase
      .from("activities")
      .update({
        name: trimmed,
        category: validateCategory(category),
        tracking_type: tracking.tracking_type,
        metric_key: tracking.metric_key,
        metric_label: tracking.metric_label,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/activities");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function archiveActivity(id: string) {
  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase
      .from("activities")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/activities");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function restoreActivity(id: string) {
  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase
      .from("activities")
      .update({ is_active: true })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/activities");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
