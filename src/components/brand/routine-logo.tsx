import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type RoutineLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { icon: "size-5", text: "text-base" },
  md: { icon: "size-6", text: "text-xl" },
  lg: { icon: "size-8", text: "text-2xl" },
};

export function RoutineLogo({
  className,
  showText = true,
  size = "md",
}: RoutineLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Activity className={cn("shrink-0 text-emerald-600", s.icon)} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-emerald-950", s.text)}>
          Routine
        </span>
      )}
    </div>
  );
}
