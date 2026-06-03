import { formatDayLabel } from "@/lib/utils/dates";
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
  const avgRate =
    stats.length > 0
      ? Math.round(
          (stats.reduce((sum, s) => sum + s.rate, 0) / stats.length) * 100
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
        <CardDescription>
          {avgRate}% average completion this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {stats.map((day) => {
            const height = Math.max(day.rate * 100, day.total > 0 ? 4 : 0);
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-xs tabular-nums text-muted-foreground">
                  {day.total > 0 ? `${Math.round(day.rate * 100)}%` : ""}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-emerald-500 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${day.completed}/${day.total} completed`}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
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
