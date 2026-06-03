"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";

export async function updateWeightAutomatic(automatic: boolean) {
  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        weight_automatic: automatic,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, weightAutomatic: automatic };
  } catch {
    return { error: "Unauthorized" };
  }
}
