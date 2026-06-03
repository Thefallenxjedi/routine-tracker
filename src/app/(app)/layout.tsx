import { AppHeader } from "@/components/layout/app-header";
import { DevBypassBanner } from "@/components/layout/dev-bypass-banner";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DevBypassBanner />
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 bg-stone-100/40 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
