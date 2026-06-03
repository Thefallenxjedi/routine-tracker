"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
} from "react";

type OnboardingContextValue = {
  startTour: () => void;
  registerStart: (fn: () => void) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const startRef = useRef<(() => void) | null>(null);

  const registerStart = useCallback((fn: () => void) => {
    startRef.current = fn;
  }, []);

  const startTour = useCallback(() => {
    startRef.current?.();
  }, []);

  return (
    <OnboardingContext.Provider value={{ startTour, registerStart }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
