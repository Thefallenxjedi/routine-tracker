import { isDevBypassAuth } from "@/lib/auth/dev-bypass";

export function DevBypassBanner() {
  if (!isDevBypassAuth()) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
      Dev mode — auth bypassed locally. Google login still required in production.
    </div>
  );
}
