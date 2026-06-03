"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard, tourId: undefined },
  {
    href: "/activities",
    label: "Activities",
    icon: ListChecks,
    tourId: "nav-activities",
  },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "nav-settings" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background md:hidden">
      <div className="mx-auto flex max-w-2xl">
        {navItems.map(({ href, label, icon: Icon, tourId }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              data-onboarding={tourId}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
