"use client";

import { useState, useTransition } from "react";
import { Archive, ChevronDown, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  archiveActivity,
  restoreActivity,
} from "@/lib/actions/activities";
import { ActivityMetricTrend } from "@/components/activities/activity-metric-trend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getActivityMetricLabel,
  isNumericActivity,
} from "@/lib/activity-metrics";
import { cn } from "@/lib/utils";
import type { Activity, ActivityLog } from "@/types/database";

type ActivityRowProps = {
  activity: Activity;
  logs: ActivityLog[];
  onEdit: (activity: Activity) => void;
  archived?: boolean;
};

export function ActivityRow({ activity, logs, onEdit, archived }: ActivityRowProps) {
  const [isPending, startTransition] = useTransition();
  const [trendOpen, setTrendOpen] = useState(false);
  const numeric = isNumericActivity(activity);

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

  function handleRowClick() {
    if (numeric) {
      setTrendOpen((open) => !open);
    }
  }

  return (
    <div className="rounded-lg border">
      <div
        className={cn(
          "flex min-h-11 items-center justify-between gap-3 px-3 py-2",
          numeric && "cursor-pointer hover:bg-emerald-50/50"
        )}
        onClick={numeric ? handleRowClick : undefined}
        onKeyDown={
          numeric
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRowClick();
                }
              }
            : undefined
        }
        role={numeric ? "button" : undefined}
        tabIndex={numeric ? 0 : undefined}
        aria-expanded={numeric ? trendOpen : undefined}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{activity.name}</p>
            {numeric && (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-emerald-700 transition-transform",
                  trendOpen && "rotate-180"
                )}
              />
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {activity.category}
            </Badge>
            <Badge className="bg-emerald-600/10 text-xs text-emerald-800">
              {getActivityMetricLabel(activity)}
            </Badge>
          </div>
          {numeric && !trendOpen && (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap to view trend chart
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={(e) => e.stopPropagation()}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!archived && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleArchive();
              }}
            >
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
      {numeric && trendOpen && (
        <div
          className="border-t border-stone-200 bg-stone-50/80 px-3 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          <ActivityMetricTrend activity={activity} logs={logs} />
        </div>
      )}
    </div>
  );
}
