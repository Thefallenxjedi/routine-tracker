"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";

export async function toggleActivityLog(
  activityId: string,
  date: string,
  completed: boolean
) {
  try {
    const { supabase, userId } = await requireServerSession();

    const { data: activity } = await supabase
      .from("activities")
      .select("id")
      .eq("id", activityId)
      .eq("user_id", userId)
      .single();

    if (!activity) {
      return { error: "Activity not found" };
    }

    const { error } = await supabase.from("activity_logs").upsert(
      { activity_id: activityId, date, completed },
      { onConflict: "activity_id,date" }
    );

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}
