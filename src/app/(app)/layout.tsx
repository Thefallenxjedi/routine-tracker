import { AppHeader } from "@/components/layout/app-header";
import { DevBypassBanner } from "@/components/layout/dev-bypass-banner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { getServerSession } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const userId = session?.userId ?? "guest";

  return (
    <OnboardingShell userId={userId}>
      <div className="flex min-h-full flex-1 flex-col">
        <DevBypassBanner />
        <AppHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 bg-stone-100/40 px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </OnboardingShell>
  );
}
