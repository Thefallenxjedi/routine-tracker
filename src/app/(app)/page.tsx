import { format } from "date-fns";
import { getDashboardData } from "@/lib/data/dashboard";
import { DailyChecklist } from "@/components/dashboard/daily-checklist";
import { MonthlyHeatmap } from "@/components/dashboard/monthly-heatmap";
import { StreakCards } from "@/components/dashboard/streak-cards";
import { TodayProgress } from "@/components/dashboard/today-progress";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const displayDate = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{displayDate}</p>
      </div>

      {data.hasActivities ? (
        <>
          <TodayProgress
            completed={data.dailyProgress.completed}
            total={data.dailyProgress.total}
            rate={data.dailyProgress.rate}
            today={displayDate}
          />
          <DailyChecklist
            activities={data.activitiesWithLogs}
            today={data.today}
          />
          <StreakCards streaks={data.streaks} />
          <WeeklyChart stats={data.weeklyStats} />
          <MonthlyHeatmap stats={data.monthlyStats} />
        </>
      ) : (
        <DailyChecklist activities={[]} today={data.today} />
      )}
    </div>
  );
}
