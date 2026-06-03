import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getSettingsData } from "@/lib/data/settings";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default async function SettingsPage() {
  const session = await getServerSession();
  const data = await getSettingsData();

  if (!data || !session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Account info and app preferences
        </p>
      </div>
      <SettingsPanel
        profile={data.profile}
        preferences={data.preferences}
        userId={session.userId}
      />
    </div>
  );
}
