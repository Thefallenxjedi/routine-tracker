import { format } from "date-fns";
import { getServerSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserPreferences } from "@/lib/data/preferences";

export type SettingsProfile = {
  name: string;
  email: string;
  createdAt: string;
  createdAtLabel: string;
};

export async function getSettingsData() {
  const session = await getServerSession();

  if (!session) {
    return null;
  }

  let user;
  if (session.isDevBypass) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(session.userId);
    if (error || !data.user) {
      return null;
    }
    user = data.user;
  } else {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      return null;
    }
    user = authUser;
  }

  const meta = user.user_metadata ?? {};
  const fullName =
    meta.full_name || meta.name || meta.user_name || user.email?.split("@")[0];
  const name =
    typeof fullName === "string" && fullName.length > 0 ? fullName : "User";

  const createdAt = user.created_at;
  const createdDate = new Date(createdAt);

  const preferences = await getUserPreferences(session.userId);

  return {
    profile: {
      name,
      email: user.email ?? "—",
      createdAt,
      createdAtLabel: format(createdDate, "MMMM d, yyyy"),
    } satisfies SettingsProfile,
    preferences,
  };
}
