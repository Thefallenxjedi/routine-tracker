import { getActivitiesData } from "@/lib/data/dashboard";
import { ActivityList } from "@/components/activities/activity-list";

export default async function ActivitiesPage() {
  const { active, archived } = await getActivitiesData();

  return <ActivityList active={active} archived={archived} />;
}
