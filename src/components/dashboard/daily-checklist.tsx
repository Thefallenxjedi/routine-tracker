"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO, subDays } from "date-fns";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { saveActivityLog, toggleActivityLog } from "@/lib/actions/logs";
import {
  formatMetricValue,
  getActivityMetricUnit,
  getMetricPreset,
  isActivityLogDone,
} from "@/lib/activity-metrics";
import { ActivityCheck } from "@/components/dashboard/activity-check";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Activity, ActivityLog } from "@/types/database";

type DailyChecklistProps = {
  activities: Activity[];
  logs: ActivityLog[];
  today: string;
};

type LogState = {
  done: boolean;
  metricValue: string;
};

function formatSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return format(new Date(y, m - 1, d), "EEEE, MMM d");
}

function logsToState(
  activities: Activity[],
  logs: ActivityLog[],
  date: string
): Map<string, LogState> {
  const activityMap = new Map(activities.map((a) => [a.id, a]));
  const map = new Map<string, LogState>();

  for (const log of logs) {
    if (log.date !== date) continue;
    const activity = activityMap.get(log.activity_id);
    if (!activity) continue;

    const done = isActivityLogDone(log, activity);
    map.set(log.activity_id, {
      done,
      metricValue:
        log.metric_value != null ? String(log.metric_value) : "",
    });
  }
  return map;
}

export function DailyChecklist({ activities, logs, today }: DailyChecklistProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(today);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minDate = format(subDays(parseISO(`${today}T12:00:00`), 60), "yyyy-MM-dd");

  const serverState = useMemo(
    () => logsToState(activities, logs, selectedDate),
    [activities, logs, selectedDate]
  );

  const [logState, setLogState] = useState<Map<string, LogState>>(
    () => serverState
  );
  const [editingMetricIds, setEditingMetricIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    setLogState(serverState);
  }, [serverState]);

  useEffect(() => {
    setEditingMetricIds((prev) => {
      const next = new Set(prev);
      for (const id of prev) {
        const state = serverState.get(id);
        if (state?.done) next.delete(id);
      }
      return next;
    });
  }, [serverState]);

  const visibleActivities = useMemo(
    () =>
      activities.filter((a) => {
        const created = a.created_at.slice(0, 10);
        return created <= selectedDate;
      }),
    [activities, selectedDate]
  );

  const scheduleDashboardRefresh = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    refreshTimer.current = setTimeout(() => {
      router.refresh();
    }, 600);
  }, [router]);

  function handleYesNoToggle(activityId: string, next: boolean) {
    const previous = logState.get(activityId) ?? { done: false, metricValue: "" };

    setLogState((prev) => {
      const map = new Map(prev);
      map.set(activityId, { ...previous, done: next });
      return map;
    });

    void toggleActivityLog(activityId, selectedDate, next).then((result) => {
      if (result.error) {
        setLogState((prev) => {
          const map = new Map(prev);
          map.set(activityId, previous);
          return map;
        });
        toast.error(result.error);
        return;
      }
      scheduleDashboardRefresh();
    });
  }

  function handleMetricSave(activity: Activity) {
    const previous = logState.get(activity.id) ?? { done: false, metricValue: "" };
    const raw = previous.metricValue.trim();
    const value = raw === "" ? null : parseFloat(raw);

    if (value !== null && (Number.isNaN(value) || value < 0)) {
      toast.error("Enter a valid number");
      return;
    }

    const nextDone = value !== null && value > 0;

    setLogState((prev) => {
      const map = new Map(prev);
      map.set(activity.id, { done: nextDone, metricValue: raw });
      return map;
    });

    setEditingMetricIds((ids) => {
      const next = new Set(ids);
      next.delete(activity.id);
      return next;
    });

    void saveActivityLog(activity.id, selectedDate, { metricValue: value }).then(
      (result) => {
        if (result.error) {
          setLogState((prev) => {
            const map = new Map(prev);
            map.set(activity.id, previous);
            return map;
          });
          setEditingMetricIds((ids) => new Set(ids).add(activity.id));
          toast.error(result.error);
          return;
        }
        toast.success(
          value != null && value > 0
            ? `Logged ${formatMetricValue(value, activity)}`
            : "Entry cleared"
        );
        scheduleDashboardRefresh();
      }
    );
  }

  function startMetricEdit(activityId: string) {
    setEditingMetricIds((ids) => new Set(ids).add(activityId));
  }

  function cancelMetricEdit(activityId: string) {
    setEditingMetricIds((ids) => {
      const next = new Set(ids);
      next.delete(activityId);
      return next;
    });
    const server = serverState.get(activityId);
    setLogState((prev) => {
      const map = new Map(prev);
      if (server) {
        map.set(activityId, server);
      } else {
        map.delete(activityId);
      }
      return map;
    });
  }

  function handleMetricClear(activity: Activity) {
    const previous = logState.get(activity.id) ?? { done: false, metricValue: "" };

    setEditingMetricIds((ids) => {
      const next = new Set(ids);
      next.delete(activity.id);
      return next;
    });

    setLogState((prev) => {
      const map = new Map(prev);
      map.set(activity.id, { done: false, metricValue: "" });
      return map;
    });

    void saveActivityLog(activity.id, selectedDate, { metricValue: null }).then(
      (result) => {
        if (result.error) {
          setLogState((prev) => {
            const map = new Map(prev);
            map.set(activity.id, previous);
            return map;
          });
          toast.error(result.error);
        } else {
          scheduleDashboardRefresh();
        }
      }
    );
  }

  const isToday = selectedDate === today;

  if (activities.length === 0) {
    return (
      <Card data-onboarding="daily-checklist" className="border-stone-200 bg-stone-50/80">
        <CardHeader>
          <CardTitle>Daily Checklist</CardTitle>
          <CardDescription>No activities yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Link href="/activities" className="font-medium text-emerald-600 hover:underline">
              Create your first activity
            </Link>{" "}
            to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-onboarding="daily-checklist" className="border-stone-200 bg-stone-50/80">
      <CardHeader>
        <CardTitle>Daily Checklist</CardTitle>
        <CardDescription>
          {isToday
            ? "Mark activities or log numbers for today"
            : `Backfilling for ${formatSelectedDate(selectedDate)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3 rounded-lg border border-stone-200 bg-stone-100/80 p-3">
          <CalendarDays className="mb-2 size-4 shrink-0 text-emerald-700" />
          <div className="flex-1 space-y-1">
            <Label htmlFor="checklist-date" className="text-xs text-muted-foreground">
              Pick a day (including past days you missed)
            </Label>
            <Input
              id="checklist-date"
              type="date"
              value={selectedDate}
              min={minDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-stone-300 bg-white"
            />
          </div>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="mb-0.5 text-xs font-medium text-emerald-700 hover:underline"
            >
              Back to today
            </button>
          )}
        </div>

        {visibleActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activities existed on this date yet.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleActivities.map((activity) => {
              const state = logState.get(activity.id) ?? {
                done: false,
                metricValue: "",
              };
              const unit = getActivityMetricUnit(activity);
              const preset = getMetricPreset(activity.metric_key);
              const isNumeric = activity.tracking_type === "numeric";
              const isEditingMetric = editingMetricIds.has(activity.id);
              const showMetricForm = isNumeric && (!state.done || isEditingMetric);
              const savedNumericValue =
                state.metricValue !== ""
                  ? parseFloat(state.metricValue)
                  : null;

              return (
                <div
                  key={activity.id}
                  className={`rounded-lg px-3 py-3 ${
                    state.done ? "bg-emerald-100" : "bg-white/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isNumeric ? (
                      <ActivityCheck
                        checked={state.done}
                        label={
                          state.done
                            ? `${activity.name} logged — tap to edit`
                            : `Log ${activity.name}`
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            startMetricEdit(activity.id);
                          } else if (state.done) {
                            handleMetricClear(activity);
                          }
                        }}
                      />
                    ) : (
                      <ActivityCheck
                        checked={state.done}
                        label={`Mark ${activity.name} as done`}
                        onCheckedChange={(checked) =>
                          handleYesNoToggle(activity.id, checked)
                        }
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            state.done ? "text-emerald-800" : "text-emerald-950"
                          }`}
                        >
                          {activity.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.category}
                        </Badge>
                        {isNumeric && unit && !state.done && (
                          <Badge className="bg-emerald-600/10 text-xs text-emerald-800">
                            {unit}
                          </Badge>
                        )}
                      </div>

                      {isNumeric && state.done && !isEditingMetric && (
                        <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-800">
                          {savedNumericValue != null &&
                          !Number.isNaN(savedNumericValue)
                            ? formatMetricValue(savedNumericValue, activity)
                            : "—"}
                        </p>
                      )}

                      {showMetricForm && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            placeholder={preset?.placeholder ?? "0"}
                            value={state.metricValue}
                            onChange={(e) =>
                              setLogState((prev) => {
                                const map = new Map(prev);
                                const current = prev.get(activity.id) ?? {
                                  done: false,
                                  metricValue: "",
                                };
                                map.set(activity.id, {
                                  ...current,
                                  metricValue: e.target.value,
                                });
                                return map;
                              })
                            }
                            className="h-9 max-w-[140px] border-stone-300 bg-white"
                            aria-label={`${activity.name} value in ${unit || "units"}`}
                          />
                          {unit && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {unit}
                            </span>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            className="h-9 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleMetricSave(activity)}
                          >
                            Save
                          </Button>
                          {isEditingMetric && state.done && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-9 border-stone-300"
                              onClick={() => cancelMetricEdit(activity.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}

                      {isNumeric && state.done && !isEditingMetric && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-emerald-300 bg-white text-emerald-800"
                            onClick={() => startMetricEdit(activity.id)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 text-muted-foreground"
                            onClick={() => handleMetricClear(activity)}
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
