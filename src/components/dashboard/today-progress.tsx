import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TodayProgressProps = {
  completed: number;
  total: number;
  rate: number;
  today: string;
};

export function TodayProgress({
  completed,
  total,
  rate,
  today,
}: TodayProgressProps) {
  const percentage = Math.round(rate * 100);

  return (
    <Card data-onboarding="today-progress" className="border-stone-200 bg-stone-50/80">
      <CardHeader className="pb-2">
        <CardDescription>{today}</CardDescription>
        <CardTitle className="text-2xl">Today&apos;s Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-4xl font-bold tabular-nums text-emerald-600">
            {percentage}%
          </span>
          <span className="text-sm text-muted-foreground">
            {completed}/{total} completed
          </span>
        </div>
        <Progress
          value={percentage}
          className="h-3 [&_[data-slot=progress-indicator]]:bg-emerald-500"
        />
      </CardContent>
    </Card>
  );
}
