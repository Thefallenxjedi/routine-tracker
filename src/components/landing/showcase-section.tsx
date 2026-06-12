import { ActivitiesMockup } from "@/components/landing/mockups/activities-mockup";
import { ChartMockup } from "@/components/landing/mockups/chart-mockup";
import { DashboardMockup } from "@/components/landing/mockups/dashboard-mockup";
import { HeatmapMockup } from "@/components/landing/mockups/heatmap-mockup";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const showcases: {
  title: string;
  description: string;
  visual: ReactNode;
}[] = [
  {
    title: "Daily dashboard",
    description:
      "Start each day with a clear checklist. Toggle habits on or off, log numeric metrics, and see your progress at a glance.",
    visual: <DashboardMockup />,
  },
  {
    title: "Weekly analytics",
    description:
      "Track your completion rate across the week. Spot patterns and stay accountable to your goals.",
    visual: <ChartMockup />,
  },
  {
    title: "Activity heatmap",
    description:
      "Visualize consistency over time with monthly heatmaps. See streaks, gaps, and trends for every activity.",
    visual: <HeatmapMockup />,
  },
  {
    title: "Custom activities",
    description:
      "Create activities for anything you want to track — yes/no habits or numeric metrics like steps, hours, and calories.",
    visual: <ActivitiesMockup />,
  },
];

export function ShowcaseSection() {
  return (
    <section className="border-b border-stone-100 bg-white py-24">
      <div className="mx-auto max-w-6xl space-y-24 px-6">
        {showcases.map((item, index) => {
          const imageFirst = index % 2 === 1;
          return (
            <div
              key={item.title}
              className={cn(
                "grid items-center gap-12 lg:grid-cols-2",
                imageFirst && "lg:[&>*:first-child]:order-2"
              )}
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-stone-600">
                  {item.description}
                </p>
              </div>
              <div aria-hidden>{item.visual}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
