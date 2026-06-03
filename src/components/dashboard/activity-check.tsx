"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTickSound } from "@/lib/utils/tick-sound";

type ActivityCheckProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
};

export function ActivityCheck({
  checked,
  onCheckedChange,
  label,
}: ActivityCheckProps) {
  function handleClick() {
    const next = !checked;
    if (next) {
      playTickSound();
    }
    onCheckedChange(next);
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={handleClick}
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 outline-none transition-[background-color,border-color,transform] duration-75 focus-visible:ring-2 focus-visible:ring-emerald-500/50 active:scale-95",
        checked
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-stone-300 bg-white hover:border-emerald-500"
      )}
    >
      <Check
        className={cn(
          "size-3.5 stroke-[3]",
          checked ? "opacity-100" : "opacity-0"
        )}
      />
    </button>
  );
}
