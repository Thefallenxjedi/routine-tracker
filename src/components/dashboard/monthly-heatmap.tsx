import { formatDisplayDate, getTodayString } from "@/lib/utils/dates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DayStat } from "@/types/database";

type MonthlyHeatmapProps = {
  stats: DayStat[];
};

function getHeatmapColor(rate: number, isFuture: boolean): string {
  if (isFuture) return "bg-muted/30";
  if (rate === 0) return "bg-muted";
  if (rate < 0.5) return "bg-emerald-200";
  if (rate < 1) return "bg-emerald-400";
  return "bg-emerald-600";
}

export function MonthlyHeatmap({ stats }: MonthlyHeatmapProps) {
  const today = getTodayString();
  const firstDay = stats[0]?.date;
  if (!firstDay) return null;

  const [year, month] = firstDay.split("-").map(Number);
  const firstDate = new Date(year, month - 1, 1);
  const startPadding = (firstDate.getDay() + 6) % 7; // Monday = 0

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const cells: (DayStat | null)[] = [
    ...Array(startPadding).fill(null),
    ...stats.map((s) => s),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Heatmap</CardTitle>
        <CardDescription>Daily completion intensity this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const isFuture = day.date > today;
            const color = getHeatmapColor(day.rate, isFuture);

            return (
              <div
                key={day.date}
                className={`group relative aspect-square rounded-sm ${color} ${
                  day.date === today ? "ring-2 ring-emerald-600 ring-offset-1" : ""
                }`}
                title={
                  isFuture
                    ? formatDisplayDate(day.date)
                    : `${formatDisplayDate(day.date)} — ${day.completed}/${day.total} completed`
                }
              >
                <span className="sr-only">
                  {formatDisplayDate(day.date)}: {day.completed}/{day.total}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="size-3 rounded-sm bg-muted" />
          <div className="size-3 rounded-sm bg-emerald-200" />
          <div className="size-3 rounded-sm bg-emerald-400" />
          <div className="size-3 rounded-sm bg-emerald-600" />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
