"use server";

import { requireServerSession } from "@/lib/auth/session";

export async function toggleActivityLog(
  activityId: string,
  date: string,
  completed: boolean
) {
  try {
    const { supabase } = await requireServerSession();

    const { error } = await supabase.from("activity_logs").upsert(
      { activity_id: activityId, date, completed },
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
