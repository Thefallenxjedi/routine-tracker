export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  /** Page that must be open for this step */
  route: string;
  /** Matches [data-onboarding="..."] — omit for centered modal */
  target?: string;
  /** Spotlight stays clickable; tour does not auto-navigate away */
  interactive?: boolean;
  /** When user navigates here (e.g. taps nav), go to the next step */
  advanceOnNavigate?: string;
  /** Where to place the tooltip card */
  cardPosition?: "center" | "above-target" | "below-target";
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Routine",
    description:
      "A quick 3-step look at your dashboard — banner, progress, and checklist. Tap Get started when you're ready.",
    route: "/",
  },
  {
    id: "banner",
    title: "Your dashboard banner",
    description:
      "Your home banner greets you by name and shows today's completion — percentage, count, and progress bar in one place.",
    route: "/",
    target: "banner",
  },
  {
    id: "checklist",
    title: "Daily checklist",
    description:
      "Check off yes/no activities or enter numbers for tracked metrics. Add more activities from the Activities tab anytime.",
    route: "/",
    target: "daily-checklist",
  },
];

export function onboardingStorageKey(userId: string) {
  return `routine-onboarding-v1-${userId}`;
}
