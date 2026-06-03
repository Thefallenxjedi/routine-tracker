"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MetricsReference } from "@/components/activities/metrics-reference";
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

function AddActivityButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={className ?? "bg-emerald-600 hover:bg-emerald-700"}
    >
      <Plus className="size-4" />
      New activity
    </Button>
  );
}

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
          Activities
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage activities and view monthly heatmaps
        </p>
      </div>

      <Card className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Active</CardTitle>
          <CardDescription>
            {active.length} {active.length === 1 ? "activity" : "activities"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {active.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-center text-sm text-muted-foreground">
                No active activities yet. Create your first one to start tracking.
              </p>
              <AddActivityButton
                onClick={() => setCreateOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              />
            </div>
          ) : (
            <>
              {active.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  logs={logs}
                  onEdit={setEditing}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-1 w-full gap-2 border-dashed border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                Add activity
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ActivityAnalytics
        activities={activities}
        logs={logs}
        monthDays={monthDays}
        overallStats={overallStats}
      />

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
                logs={logs}
                onEdit={setEditing}
                archived
              />
            ))}
          </CardContent>
        </Card>
      )}

      <MetricsReference />

      <ActivityFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ActivityFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        activity={editing ?? undefined}
      />
    </div>
  );
}
