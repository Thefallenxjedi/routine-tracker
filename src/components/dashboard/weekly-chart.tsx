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

  const maxCompleted = Math.max(...pastStats.map((s) => s.completed), 1);

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
        <div className="flex h-28 items-end justify-between gap-2">
          {stats.map((day) => {
            const isFuture = day.date > today;
            const barHeight =
              day.total > 0 && !isFuture
                ? Math.max(8, (day.completed / maxCompleted) * 96)
                : isFuture
                  ? 0
                  : 4;

            return (
              <div
                key={day.date}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {!isFuture && day.total > 0
                    ? `${day.completed}/${day.total}`
                    : ""}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isFuture
                      ? "bg-gray-100"
                      : day.completed > 0
                        ? "bg-emerald-500"
                        : "bg-gray-200"
                  }`}
                  style={{ height: `${barHeight}px` }}
                  title={
                    isFuture
                      ? formatDayLabel(day.date)
                      : `${day.completed}/${day.total} completed`
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
