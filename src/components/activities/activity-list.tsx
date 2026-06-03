"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import type { Activity } from "@/types/database";

type ActivityListProps = {
  active: Activity[];
  archived: Activity[];
};

export function ActivityList({ active, archived }: ActivityListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
          <p className="text-sm text-muted-foreground">
            Manage what you track each day
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New
        </Button>
      </div>

      <Card>
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
        <Card>
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
