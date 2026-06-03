import { formatDayLabel, getTodayString } from "@/lib/utils/dates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DayStat } from "@/types/database";

type WeeklyChartProps = {
  stats: DayStat[];
};

export function WeeklyChart({ stats }: WeeklyChartProps) {
  const today = getTodayString();
  const pastStats = stats.filter((s) => s.date <= today);

  const avgRate =
    pastStats.length > 0
      ? Math.round(
          (pastStats.reduce((sum, s) => sum + s.rate, 0) / pastStats.length) *
            100
        )
      : 0;

  return (
    <Card className="border-stone-200 bg-stone-50/80">
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
        <CardDescription>
          {pastStats.length > 0
            ? `${avgRate}% average completion this week`
            : "Complete activities to see your week"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end justify-between gap-2">
          {stats.map((day) => {
            const isFuture = day.date > today;
            const hasActivities = day.total > 0 && !isFuture;
            const pct = Math.round(day.rate * 100);
            const barHeight = hasActivities
              ? Math.max(14, pct * 0.9)
              : isFuture
                ? 6
                : 8;

            return (
              <div
                key={day.date}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[10px] font-medium tabular-nums text-emerald-800">
                  {hasActivities ? `${pct}%` : isFuture ? "" : "0%"}
                </span>
                <div
                  className={`w-full min-h-[6px] rounded-t-md ${
                    isFuture
                      ? "bg-stone-200"
                      : hasActivities && pct > 0
                        ? "bg-emerald-500"
                        : "bg-stone-300"
                  }`}
                  style={{ height: `${barHeight}px` }}
                  title={
                    hasActivities
                      ? `${day.completed}/${day.total} completed (${pct}%)`
                      : formatDayLabel(day.date)
                  }
                />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {formatDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
