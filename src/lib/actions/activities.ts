"use server";

import { revalidatePath } from "next/cache";
import { requireServerSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/types/database";

function validateCategory(category: string): ActivityCategory {
  return ACTIVITY_CATEGORIES.includes(category as ActivityCategory)
    ? (category as ActivityCategory)
    : "General";
}

export async function createActivity(name: string, category: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Name is required" };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase.from("activities").insert({
      user_id: userId,
      name: trimmed,
      category: validateCategory(category),
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
  category: string
) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Name is required" };
  }

  try {
    const { supabase, userId } = await requireServerSession();

    const { error } = await supabase
      .from("activities")
      .update({ name: trimmed, category: validateCategory(category) })
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
