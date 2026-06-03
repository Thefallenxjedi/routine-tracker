"use client";

import { useState } from "react";
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

function getAuthErrorMessage(error: unknown, redirectUrl: string): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("Missing Supabase credentials")) {
      return message;
    }

    if (
      message.toLowerCase().includes("fetch") ||
      message.toLowerCase().includes("network")
    ) {
      return "Could not reach Supabase. Check your project URL, ensure the project is not paused, and restart npm run dev.";
    }

    if (
      message.toLowerCase().includes("redirect") ||
      message.toLowerCase().includes("not allowed")
    ) {
      return `Add this URL in Supabase → Authentication → URL Configuration → Redirect URLs: ${redirectUrl}`;
    }

    return message;
  }

  return "Something went wrong. Please try again.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    const redirectUrl = `${window.location.origin}/auth/callback`;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes("redirect") ||
          error.message.toLowerCase().includes("not allowed")
        ) {
          toast.error(
            `Add this redirect URL in Supabase: ${redirectUrl}`,
            { duration: 8000 }
          );
        } else {
          toast.error(error.message);
        }
        return;
      }

      setSent(true);
      toast.success("Check your email for a login link");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, redirectUrl), { duration: 8000 });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{email}</strong>. Click the link
            to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in with a magic link sent to your email.
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send magic link"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
