"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/activities";
import { RoutineLogo } from "@/components/brand/routine-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-100/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link href="/">
            <RoutineLogo size="sm" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-900"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="gap-1.5 border-emerald-300 bg-white text-emerald-800 shadow-sm hover:bg-emerald-50 hover:text-emerald-900"
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}
