import Image from "next/image";
import { cn } from "@/lib/utils";

type RoutineLogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { img: 28, text: "text-base" },
  md: { img: 32, text: "text-xl" },
  lg: { img: 48, text: "text-2xl" },
};

export function RoutineLogo({
  className,
  showText = true,
  size = "md",
}: RoutineLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="Routine"
        width={s.img}
        height={s.img}
        className="shrink-0 rounded-lg"
        priority={size === "lg"}
      />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-emerald-950", s.text)}>
          Routine
        </span>
      )}
    </div>
  );
}
