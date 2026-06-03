import { LoginForm } from "@/components/auth/login-form";
import { Activity } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Activity className="size-6 text-emerald-600" />
        <span className="text-xl font-semibold tracking-tight">Routine</span>
      </div>
      <LoginForm />
    </div>
  );
}
