"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Calendar, LogOut, Mail, User } from "lucide-react";
import { signOut } from "@/lib/actions/activities";
import { updateWeightAutomatic } from "@/lib/actions/settings";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SettingsProfile } from "@/lib/data/settings";
import type { UserPreferences } from "@/types/database";

const PREFS_STORAGE_KEY = "routine-weight-automatic";

type SettingsPanelProps = {
  profile: SettingsProfile;
  preferences: UserPreferences;
};

export function SettingsPanel({ profile, preferences }: SettingsPanelProps) {
  const router = useRouter();
  const [weightAutomatic, setWeightAutomatic] = useState(
    preferences.weight_automatic
  );
  const [isPending, startTransition] = useTransition();
  const [signingOut, startSignOut] = useTransition();

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    });
  }

  function persistLocal(automatic: boolean) {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, String(automatic));
    } catch {
      // ignore
    }
  }

  function handleWeightModeChange(automatic: boolean) {
    setWeightAutomatic(automatic);
    persistLocal(automatic);

    startTransition(async () => {
      const result = await updateWeightAutomatic(automatic);
      if (result.error) {
        setWeightAutomatic(!automatic);
        persistLocal(!automatic);
        toast.error(result.error);
        return;
      }
      toast.success(
        automatic
          ? "Automatic weight logging enabled"
          : "Manual weight logging enabled"
      );
    });
  }

  return (
    <div className="space-y-6">
      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your Google sign-in details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
            <User className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="font-medium text-emerald-950">{profile.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="break-all font-medium text-emerald-950">
                {profile.email}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
            <Calendar className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Account created
              </p>
              <p className="font-medium text-emerald-950">
                {profile.createdAtLabel}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(profile.createdAt), "h:mm a")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>End your session on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            disabled={signingOut}
            className="gap-1.5 border-emerald-300 text-emerald-800"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out..." : "Log out"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Weight tracker</CardTitle>
          <CardDescription>How logging works on your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white px-4 py-4">
            <div className="space-y-1 pr-2">
              <Label htmlFor="weight-automatic" className="text-sm font-medium">
                Automatic weight logging
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {weightAutomatic ? (
                  <>
                    <span className="font-medium text-emerald-800">On:</span>{" "}
                    Save once — the form hides for the rest of the day and your
                    chart stays visible.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-emerald-800">Off:</span>{" "}
                    Manual mode — the entry form stays available so you can
                    update weight anytime.
                  </>
                )}
              </p>
            </div>
            <Switch
              id="weight-automatic"
              checked={weightAutomatic}
              disabled={isPending}
              onCheckedChange={handleWeightModeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
