"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";

export async function saveWeight(date: string, weightKg: number) {
  const rounded = Math.round(weightKg * 100) / 100;

  if (!rounded || rounded <= 0 || rounded >= 500) {
    return { error: "Enter a valid weight in kg" };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase.from("weight_logs").upsert(
      {
        user_id: userId,
        date,
        weight_kg: rounded,
      },
      { onConflict: "user_id,date" }
    );

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}
