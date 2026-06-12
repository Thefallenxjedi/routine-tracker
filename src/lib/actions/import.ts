"use server";

import { revalidatePath } from "next/cache";
import { normalizeActivityName } from "@/lib/import/infer-activity";
import type { ImportCsvPayload, ImportSummary } from "@/lib/import/types";
import { requireServerSession } from "@/lib/auth/session";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/types/database";

function validateCategory(category: string): ActivityCategory {
  return ACTIVITY_CATEGORIES.includes(category as ActivityCategory)
    ? (category as ActivityCategory)
    : "General";
}

export async function importCsvData(
  payload: ImportCsvPayload
): Promise<{ error: string } | ImportSummary> {
  if (!payload.activities.length) {
    return { error: "No activities to import" };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { data: existingRows, error: fetchError } = await supabase
      .from("activities")
      .select("id, name, tracking_type, metric_key, metric_label, category")
      .eq("user_id", userId);

    if (fetchError) {
      return { error: fetchError.message };
    }

    const existingByName = new Map(
      (existingRows ?? []).map((row) => [
        normalizeActivityName(row.name),
        row,
      ])
    );

    const activityIdByName = new Map<string, string>();
    let createdActivities = 0;
    let reusedActivities = 0;
    const warnings: string[] = [];

    for (const def of payload.activities) {
      const key = normalizeActivityName(def.name);
      const existing = existingByName.get(key);

      if (existing) {
        activityIdByName.set(key, existing.id);
        reusedActivities += 1;
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("activities")
        .insert({
          user_id: userId,
          name: def.name.trim(),
          category: validateCategory(def.category),
          tracking_type: def.tracking_type,
          metric_key: def.metric_key,
          metric_label: def.metric_label,
          is_active: true,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        warnings.push(`Failed to create "${def.name}": ${insertError?.message ?? "unknown"}`);
        continue;
      }

      activityIdByName.set(key, inserted.id);
      createdActivities += 1;
    }

    if (activityIdByName.size === 0) {
      return { error: "Could not create or match any activities" };
    }

    const logRows = [];
    let skippedRows = 0;

    for (const log of payload.logs) {
      const key = normalizeActivityName(log.activityName);
      const activityId = activityIdByName.get(key);

      if (!activityId) {
        warnings.push(`Skipped log for unknown activity: "${log.activityName}"`);
        skippedRows += 1;
        continue;
      }

      logRows.push({
        activity_id: activityId,
        date: log.date,
        completed: log.completed,
        metric_value: log.metric_value,
      });
    }

    let importedLogs = 0;

    if (logRows.length > 0) {
      const BATCH = 200;
      for (let i = 0; i < logRows.length; i += BATCH) {
        const batch = logRows.slice(i, i + BATCH);
        const { error: upsertError } = await supabase
          .from("activity_logs")
          .upsert(batch, { onConflict: "activity_id,date" });

        if (upsertError) {
          return { error: upsertError.message };
        }
        importedLogs += batch.length;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/activities");

    return {
      createdActivities,
      reusedActivities,
      importedLogs,
      skippedRows,
      warnings,
    };
  } catch {
    return { error: "Unauthorized" };
  }
}
