import { format } from "date-fns";
import { getDashboardData } from "@/lib/data/dashboard";
import { ActivityAnalytics } from "@/components/dashboard/activity-analytics";
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
      <DashboardHeader
        displayDate={displayDate}
        userName={data.userName}
        completed={data.dailyProgress.completed}
        total={data.dailyProgress.total}
        rate={data.dailyProgress.rate}
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
          <ActivityAnalytics
            activities={data.activities}
            logs={data.logs}
            monthDays={data.monthDays}
            overallStats={data.monthlyStats}
          />
        </>
      ) : (
        <DailyChecklist activities={[]} logs={[]} today={data.today} />
      )}

      <WeightTracker
        today={data.today}
        todayWeight={data.todayWeight}
        recentLogs={data.weightLogs}
        weightAutomatic={data.weightAutomatic}
      />
    </div>
  );
}
