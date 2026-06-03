import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { RoutineLogo } from "@/components/brand/routine-logo";

export default function LoginPage() {
  return (
    <div className="min-h-full flex-1">
      {/* Mobile: full-width hero image with login overlay */}
      <div className="relative min-h-[100dvh] w-full lg:hidden">
        <Image
          src="/images/habit-tracker.png"
          alt="Habit tracker journal"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-900/75 to-emerald-950/90" />
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10">
          <RoutineLogo size="lg" className="mb-8 [&_span]:text-white" />
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Desktop: split layout */}
      <div className="hidden min-h-[100dvh] lg:flex">
        <div className="relative flex-1">
          <Image
            src="/images/habit-tracker.png"
            alt="Habit tracker journal"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-transparent" />
          <div className="absolute bottom-10 left-10 max-w-sm text-white">
            <RoutineLogo size="lg" className="mb-4 [&_span]:text-white" />
            <p className="text-lg font-medium leading-relaxed text-emerald-50">
              Track habits, build streaks, and see your progress — one day at a
              time.
            </p>
          </div>
        </div>
        <div className="flex w-full max-w-md flex-col items-center justify-center bg-stone-100 px-8 py-12">
          <RoutineLogo size="lg" className="mb-8" />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
