import { Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StreakInfo } from "@/types/database";

type StreakCardsProps = {
  streaks: StreakInfo[];
};

export function StreakCards({ streaks }: StreakCardsProps) {
  const activeStreaks = streaks.filter((s) => s.currentStreak > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Streaks</CardTitle>
        <CardDescription>Consecutive days completed per activity</CardDescription>
      </CardHeader>
      <CardContent>
        {activeStreaks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete activities to start building streaks.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
            {streaks.map((streak) => (
              <div
                key={streak.activityId}
                className="flex min-w-[140px] shrink-0 items-center gap-3 rounded-lg border bg-card p-3 md:min-w-0"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    streak.currentStreak > 0
                      ? "bg-orange-100 text-orange-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Flame className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">
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
    </Card>
  );
}
