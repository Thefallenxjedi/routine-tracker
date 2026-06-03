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
      "This quick tour works on phone and desktop. We'll show you how to track habits, build streaks, and log weight.",
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
      "This card is tied to today's date. It shows your completion percentage and how many activities you've finished out of the total.",
    route: "/",
    target: "today-progress",
  },
  {
    id: "checklist",
    title: "Daily checklist",
    description:
      "Tick activities when you complete them. You can also pick a past date to backfill days you missed. Add activities first from the Activities tab.",
    route: "/",
    target: "daily-checklist",
  },
  {
    id: "streaks",
    title: "Streaks",
    description:
      "Each activity gets its own streak — consecutive days you've completed it. Keep showing up to grow your streak count.",
    route: "/",
    target: "streaks",
  },
  {
    id: "weight",
    title: "Weight tracker",
    description:
      "Log your weight in kg and see a chart over time. After you save, you can edit the same day from here or change how logging works in Settings.",
    route: "/",
    target: "weight",
  },
  {
    id: "nav-activities",
    title: "Activities tab",
    description:
      "Tap Activities in the bottom bar (mobile) or top menu (desktop) to open this section. You can tap it now — or press Next when you're ready.",
    route: "/",
    target: "nav-activities",
    interactive: true,
    advanceOnNavigate: "/activities",
    cardPosition: "above-target",
  },
  {
    id: "activities-new",
    title: "Create activities",
    description:
      'Tap "New" to add an activity — choose a name and category (Health, Work, etc.). Active items appear on your daily checklist.',
    route: "/activities",
    target: "activities-new",
    interactive: true,
    cardPosition: "below-target",
  },
  {
    id: "activities-heatmap",
    title: "Monthly heatmaps",
    description:
      "See GitHub-style heatmaps per activity or a cumulative view for all activities. Filter with the pills at the top.",
    route: "/activities",
    target: "activities-heatmap",
  },
  {
    id: "nav-settings",
    title: "Settings tab",
    description:
      "Tap Settings to see your account and weight options. You can tap it now — or press Next.",
    route: "/activities",
    target: "nav-settings",
    interactive: true,
    advanceOnNavigate: "/settings",
    cardPosition: "above-target",
  },
  {
    id: "settings-account",
    title: "Your account",
    description:
      "View your name, email, and when your account was created. This comes from your Google sign-in.",
    route: "/settings",
    target: "settings-account",
  },
  {
    id: "settings-weight",
    title: "Weight logging mode",
    description:
      "Automatic: save once and the form hides until tomorrow (you can still Edit). Off: the entry form stays visible so you can update anytime.",
    route: "/settings",
    target: "settings-weight",
  },
  {
    id: "finish",
    title: "You're all set",
    description:
      "Start by adding activities, then check them off daily. You can replay this tour anytime from Settings.",
    route: "/settings",
  },
];

export function onboardingStorageKey(userId: string) {
  return `routine-onboarding-v1-${userId}`;
}
