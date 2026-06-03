"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ActivityAnalytics } from "@/components/dashboard/activity-analytics";
import { ActivityFormDialog } from "@/components/activities/activity-form-dialog";
import { ActivityRow } from "@/components/activities/activity-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Activity, ActivityLog, DayStat } from "@/types/database";

type ActivityListProps = {
  active: Activity[];
  archived: Activity[];
  activities: Activity[];
  logs: ActivityLog[];
  monthDays: string[];
  overallStats: DayStat[];
};

export function ActivityList({
  active,
  archived,
  activities,
  logs,
  monthDays,
  overallStats,
}: ActivityListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
            Activities
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage activities and view monthly heatmaps
          </p>
        </div>
        <Button
          data-onboarding="activities-new"
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <ActivityAnalytics
        activities={activities}
        logs={logs}
        monthDays={monthDays}
        overallStats={overallStats}
      />

      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Active</CardTitle>
          <CardDescription>
            {active.length} {active.length === 1 ? "activity" : "activities"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active activities. Create one to get started.
            </p>
          ) : (
            active.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onEdit={setEditing}
              />
            ))
          )}
        </CardContent>
      </Card>

      {archived.length > 0 && (
        <Card className="border-stone-200 bg-stone-50/80">
          <CardHeader>
            <CardTitle>Archived</CardTitle>
            <CardDescription>
              {archived.length} archived{" "}
              {archived.length === 1 ? "activity" : "activities"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {archived.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onEdit={setEditing}
                archived
              />
            ))}
          </CardContent>
        </Card>
      )}

      <ActivityFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ActivityFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        activity={editing ?? undefined}
      />
    </div>
  );
}
