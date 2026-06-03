"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";

export async function saveWeight(date: string, weightKg: number) {
  if (!weightKg || weightKg <= 0 || weightKg >= 500) {
    return { error: "Enter a valid weight in kg" };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase.from("weight_logs").upsert(
      {
        user_id: userId,
        date,
        weight_kg: weightKg,
      },
      { onConflict: "user_id,date" }
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
