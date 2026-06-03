"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_MS = 2000;

export function AppSplash() {
  const [phase, setPhase] = useState<"visible" | "hiding" | "done">("visible");

  useEffect(() => {
    const hideTimer = setTimeout(() => setPhase("hiding"), SPLASH_MS);
    const doneTimer = setTimeout(() => setPhase("done"), SPLASH_MS + 400);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#34d399] transition-opacity duration-[400ms] ease-out ${
        phase === "hiding" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={phase === "hiding"}
      role="presentation"
    >
      <Image
        src="/logo.png"
        alt="Routine"
        width={160}
        height={160}
        priority
        className="size-36 rounded-2xl shadow-lg shadow-emerald-900/20 sm:size-40"
      />
      <p className="mt-6 text-lg font-semibold tracking-tight text-white">
        Routine
      </p>
    </div>
  );
}
