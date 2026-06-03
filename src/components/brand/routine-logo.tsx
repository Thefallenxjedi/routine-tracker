import { cn } from "@/lib/utils";

type RoutineLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { icon: "size-7", text: "text-base" },
  md: { icon: "size-9", text: "text-xl" },
  lg: { icon: "size-11", text: "text-2xl" },
};

export function RoutineLogo({
  className,
  showText = true,
  size = "md",
}: RoutineLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-600/30",
          s.icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[55%] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-emerald-950", s.text)}>
          Routine
        </span>
      )}
    </div>
  );
}
