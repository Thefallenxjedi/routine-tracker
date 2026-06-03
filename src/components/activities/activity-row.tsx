"use client";

import { useTransition } from "react";
import { Archive, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  archiveActivity,
  restoreActivity,
} from "@/lib/actions/activities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getActivityMetricLabel } from "@/lib/activity-metrics";
import type { Activity } from "@/types/database";

type ActivityRowProps = {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  archived?: boolean;
};

export function ActivityRow({ activity, onEdit, archived }: ActivityRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = archived
        ? await restoreActivity(activity.id)
        : await archiveActivity(activity.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(archived ? "Activity restored" : "Activity archived");
    });
  }

  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{activity.name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {activity.category}
          </Badge>
          <Badge className="bg-emerald-600/10 text-xs text-emerald-800">
            {getActivityMetricLabel(activity)}
          </Badge>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={isPending} />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!archived && (
            <DropdownMenuItem onClick={() => onEdit(activity)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleArchive}>
            {archived ? (
              <>
                <RotateCcw className="size-4" />
                Restore
              </>
            ) : (
              <>
                <Archive className="size-4" />
                Archive
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
