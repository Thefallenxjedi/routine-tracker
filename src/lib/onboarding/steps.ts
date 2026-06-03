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
      "A quick 3-step look at your dashboard. Tap Get started on the last step when you're ready.",
    route: "/",
  },
  {
    id: "banner",
    title: "Your dashboard banner",
    description:
      "This green banner is your home base. It greets you by name and shows how many activities you've completed today, with a progress bar.",
    route: "/",
    target: "banner",
  },
  {
    id: "today-progress",
    title: "Today's progress",
    description:
      "This card is tied to today's date. It shows your completion percentage and how many activities you've finished out of the total. You're ready to go — add activities from the Activities tab and check them off daily.",
    route: "/",
    target: "today-progress",
  },
];

export function onboardingStorageKey(userId: string) {
  return `routine-onboarding-v1-${userId}`;
}
