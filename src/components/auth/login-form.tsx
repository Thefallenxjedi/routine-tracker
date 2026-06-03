"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthMode = "sign-in" | "sign-up";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Missing Supabase credentials")) {
      return error.message;
    }

    if (
      error.message.toLowerCase().includes("fetch") ||
      error.message.toLowerCase().includes("network")
    ) {
      return "Could not reach Supabase. Check your project URL and ensure the project is not paused.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Signed in");
        router.push("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Account created");
        router.push("/");
        router.refresh();
        return;
      }

      toast.success("Account created. Check your email to confirm, then sign in.");
      setMode("sign-in");
      setPassword("");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = mode === "sign-in";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignIn ? "Welcome back" : "Create an account"}</CardTitle>
        <CardDescription>
          {isSignIn
            ? "Sign in with your email and password."
            : "Sign up to start tracking your daily activities."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignIn ? "Your password" : "At least 6 characters"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignIn ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isSignIn ? "Signing in..." : "Creating account..."}
              </>
            ) : isSignIn ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-emerald-600 hover:underline"
            onClick={() => {
              setMode(isSignIn ? "sign-up" : "sign-in");
              setPassword("");
            }}
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
