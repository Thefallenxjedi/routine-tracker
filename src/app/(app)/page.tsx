import { format } from "date-fns";
import { getDashboardData } from "@/lib/data/dashboard";
import { DailyChecklist } from "@/components/dashboard/daily-checklist";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StreakCards } from "@/components/dashboard/streak-cards";
import { TodayProgress } from "@/components/dashboard/today-progress";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { WeightTracker } from "@/components/dashboard/weight-tracker";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const displayDate = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-6">
      <DashboardHeader displayDate={displayDate} userName={data.userName} />

      <WeightTracker
        today={data.today}
        todayWeight={data.todayWeight}
        recentLogs={data.weightLogs}
      />

      {data.hasActivities ? (
        <>
          <TodayProgress
            completed={data.dailyProgress.completed}
            total={data.dailyProgress.total}
            rate={data.dailyProgress.rate}
            today={displayDate}
          />
          <DailyChecklist
            activities={data.activeActivities}
            logs={data.logs}
            today={data.today}
          />
          <StreakCards streaks={data.streaks} />
          <WeeklyChart stats={data.weeklyStats} />
        </>
      ) : (
        <DailyChecklist activities={[]} logs={[]} today={data.today} />
      )}
    </div>
  );
}
