"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ONBOARDING_STEPS,
  onboardingStorageKey,
  type OnboardingStep,
} from "@/lib/onboarding/steps";
import { useOnboarding } from "@/components/onboarding/onboarding-context";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type AppOnboardingProps = {
  userId: string;
};

export function AppOnboarding({ userId }: AppOnboardingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { registerStart } = useOnboarding();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const step = ONBOARDING_STEPS[stepIndex];
  const total = ONBOARDING_STEPS.length;
  const storageKey = onboardingStorageKey(userId);

  const complete = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "done");
    } catch {
      // ignore
    }
    setActive(false);
    setStepIndex(0);
    setPendingRoute(null);
  }, [storageKey]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setActive(true);
    if (pathname !== "/") {
      router.push("/");
    }
  }, [pathname, router]);

  useEffect(() => {
    registerStart(startTour);
  }, [registerStart, startTour]);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    try {
      if (localStorage.getItem(storageKey) === "done") return;
    } catch {
      return;
    }
    const timer = setTimeout(() => startTour(), 2600);
    return () => clearTimeout(timer);
  }, [userId, storageKey, startTour]);

  useEffect(() => {
    if (!active || !step) return;
    if (step.route !== pathname) {
      setPendingRoute(step.route);
      router.push(step.route);
    } else {
      setPendingRoute(null);
    }
  }, [active, step, pathname, router]);

  const updateTargetRect = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-onboarding="${step.target}"]`);
    if (!el) {
      setTargetRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, [step]);

  useLayoutEffect(() => {
    if (!active || pendingRoute) return;
    updateTargetRect();
    const t = setTimeout(updateTargetRect, 400);
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [active, stepIndex, pathname, pendingRoute, updateTargetRect, active]);

  function goNext() {
    if (stepIndex >= total - 1) {
      complete();
      router.push("/");
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  }

  if (!active || !step || pendingRoute) {
    return null;
  }

  const padding = 8;
  const spotlight = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true">
      {!spotlight && <div className="absolute inset-0 bg-black/55" aria-hidden />}

      {spotlight && (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-emerald-400 transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      <TourCard
        step={step}
        stepIndex={stepIndex}
        total={total}
        hasTarget={!!step.target}
        onSkip={complete}
        onBack={goBack}
        onNext={goNext}
        showBack={stepIndex > 0}
        isLast={stepIndex === total - 1}
      />
    </div>
  );
}

function TourCard({
  step,
  stepIndex,
  total,
  hasTarget,
  onSkip,
  onBack,
  onNext,
  showBack,
  isLast,
}: {
  step: OnboardingStep;
  stepIndex: number;
  total: number;
  hasTarget: boolean;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
  showBack: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className={`pointer-events-auto absolute z-[111] w-[calc(100%-2rem)] max-w-md px-4 ${
        hasTarget
          ? "bottom-24 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
          : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      }`}
    >
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-emerald-600">
            Step {stepIndex + 1} of {total}
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md p-1 text-muted-foreground hover:bg-stone-100"
            aria-label="Skip tour"
          >
            <X className="size-4" />
          </button>
        </div>
        <h2 className="text-lg font-bold text-emerald-950">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {showBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            Skip tour
          </Button>
          <Button
            type="button"
            className="ml-auto bg-emerald-600 hover:bg-emerald-700"
            onClick={onNext}
          >
            {isLast ? "Get started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
