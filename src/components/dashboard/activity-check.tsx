"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { playTickSound } from "@/lib/utils/tick-sound";

type ActivityCheckProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function ActivityCheck({
  checked,
  onCheckedChange,
  label,
  disabled,
}: ActivityCheckProps) {
  function handleClick() {
    if (disabled) return;
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
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-emerald-500/40 active:scale-90",
        checked
          ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
          : "border-stone-300 bg-white hover:border-emerald-400"
      )}
    >
      <Check
        className={cn(
          "size-3.5 stroke-[3] transition-all duration-200 ease-out",
          checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      />
    </button>
  );
}
