"use client";

import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { AppOnboarding } from "@/components/onboarding/app-onboarding";

type OnboardingShellProps = {
  userId: string;
  children: React.ReactNode;
};

export function OnboardingShell({ userId, children }: OnboardingShellProps) {
  return (
    <OnboardingProvider>
      <AppOnboarding userId={userId} />
      {children}
    </OnboardingProvider>
  );
}
