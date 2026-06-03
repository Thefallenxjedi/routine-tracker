import { isDevBypassAuth, getDevUserId } from "@/lib/auth/dev-bypass";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServerSession = {
  supabase: SupabaseClient;
  userId: string;
  isDevBypass: boolean;
};

export async function getServerSession(): Promise<ServerSession | null> {
  if (isDevBypassAuth()) {
    const userId = getDevUserId();
    if (!userId) {
      return null;
    }

    return {
      supabase: createAdminClient(),
      userId,
      isDevBypass: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    supabase,
    userId: user.id,
    isDevBypass: false,
  };
}

export async function requireServerSession(): Promise<ServerSession> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
