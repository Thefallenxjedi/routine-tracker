import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { RoutineLogo } from "@/components/brand/routine-logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="/images/habit-tracker.png"
          alt="Habit tracker journal with colored daily checkboxes"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-sm text-white">
          <RoutineLogo size="lg" className="mb-4 [&_span]:text-white" />
          <p className="text-lg font-medium leading-relaxed text-emerald-50">
            Track habits, build streaks, and see your progress — one day at a
            time.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
        <div className="mb-8 lg:hidden">
          <RoutineLogo size="lg" />
        </div>
        <div className="relative mb-6 w-full max-w-md overflow-hidden rounded-2xl shadow-lg lg:hidden">
          <Image
            src="/images/habit-tracker.png"
            alt="Habit tracker journal"
            width={600}
            height={400}
            className="h-40 w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-emerald-900/20" />
        </div>
        <LoginForm />
        <p className="mt-8 max-w-sm text-center text-xs text-emerald-700/70">
          Build your daily routine. Small wins, every day.
        </p>
      </div>
    </div>
  );
}
