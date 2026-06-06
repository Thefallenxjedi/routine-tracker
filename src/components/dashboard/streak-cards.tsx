"use client";

import { useState } from "react";
import { ChevronDown, Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StreakInfo } from "@/types/database";

type StreakCardsProps = {
  streaks: StreakInfo[];
};

export function StreakCards({ streaks }: StreakCardsProps) {
  const [open, setOpen] = useState(false);
  const activeStreaks = streaks.filter((s) => s.currentStreak > 0);

  return (
    <Card data-onboarding="streaks" className="border-stone-200 bg-stone-50/80">
      <CardHeader className="pb-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start justify-between gap-3 rounded-lg text-left transition-colors hover:bg-stone-100/80 -mx-1 px-1 py-1"
          aria-expanded={open}
        >
          <div>
            <CardTitle className="text-base">Current Streaks</CardTitle>
            <CardDescription>
              Consecutive days completed per activity
              {!open && activeStreaks.length > 0 && (
                <span className="ml-1 font-medium text-orange-600">
                  · {activeStreaks.length} active
                </span>
              )}
            </CardDescription>
          </div>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </CardHeader>
      {open && (
        <CardContent className="pt-4">
          {activeStreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete activities to start building streaks.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {streaks.map((streak) => (
                <div
                  key={streak.activityId}
                  className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3"
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      streak.currentStreak > 0
                        ? "bg-orange-100 text-orange-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Flame className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-tight">
                      {streak.activityName}
                    </p>
                    <p className="text-lg font-bold tabular-nums text-orange-600">
                      {streak.currentStreak}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {streak.currentStreak === 1 ? "day" : "days"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
