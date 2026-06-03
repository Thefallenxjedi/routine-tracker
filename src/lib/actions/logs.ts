"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleActivityLog(
  activityId: string,
  date: string,
  completed: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
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
}
