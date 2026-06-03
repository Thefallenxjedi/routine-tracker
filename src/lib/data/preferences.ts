import { getServerSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { UserPreferences } from "@/types/database";

const DEFAULT_PREFERENCES: UserPreferences = {
  weight_automatic: true,
};

export async function getWeightAutomatic(userId: string | null): Promise<boolean> {
  if (!userId) return DEFAULT_PREFERENCES.weight_automatic;

  const session = await getServerSession();
  const supabase = session?.supabase ?? (await createClient());

  const { data, error } = await supabase
    .from("user_preferences")
    .select("weight_automatic")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return DEFAULT_PREFERENCES.weight_automatic;
  }

  return data?.weight_automatic ?? DEFAULT_PREFERENCES.weight_automatic;
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences> {
  const session = await getServerSession();
  const supabase = session?.supabase ?? (await createClient());

  const { data, error } = await supabase
    .from("user_preferences")
    .select("weight_automatic")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_PREFERENCES;
  }

  return { weight_automatic: data.weight_automatic };
}
