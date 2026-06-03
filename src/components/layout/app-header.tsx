"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, tourId: undefined },
  {
    href: "/activities",
    label: "Activities",
    icon: ListChecks,
    tourId: "nav-activities",
  },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "nav-settings" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-stone-100/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-12 max-w-2xl items-center px-4">
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, tourId }) => (
            <Link
              key={href}
              href={href}
              data-onboarding={tourId}
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
    </header>
  );
}
