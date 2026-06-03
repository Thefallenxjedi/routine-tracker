"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_CATEGORIES, type ActivityCategory } from "@/types/database";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

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

  const { supabase, user } = await getUser();

  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    name: trimmed,
    category: validateCategory(category),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/activities");
  return { success: true };
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

  const { supabase } = await getUser();

  const { error } = await supabase
    .from("activities")
    .update({ name: trimmed, category: validateCategory(category) })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/activities");
  return { success: true };
}

export async function archiveActivity(id: string) {
  const { supabase } = await getUser();

  const { error } = await supabase
    .from("activities")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/activities");
  return { success: true };
}

export async function restoreActivity(id: string) {
  const { supabase } = await getUser();

  const { error } = await supabase
    .from("activities")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/activities");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
