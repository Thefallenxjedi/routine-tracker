import { getActivitiesPageData } from "@/lib/data/dashboard";
import { ActivityList } from "@/components/activities/activity-list";

export default async function ActivitiesPage() {
  const data = await getActivitiesPageData();

  return (
    <ActivityList
      active={data.active}
      archived={data.archived}
      activities={data.activities}
      logs={data.logs}
      monthDays={data.monthDays}
      overallStats={data.overallStats}
    />
  );
}
