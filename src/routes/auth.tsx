import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Wins Journal" },
      {
        name: "description",
        content: "Access your private professional wins journal.",
      },
      { property: "og:title", content: "Sign In — Wins Journal" },
      {
        property: "og:description",
        content: "Access your private professional wins journal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/" });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="size-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-[32rem] rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -right-28 top-1/3 size-[30rem] rounded-full bg-white/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
        <div className="fade-rise mb-8 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-white/60 ring-1 ring-white/40 backdrop-blur-xl">
              <span className="size-2.5 rounded-full bg-teal" />
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
              Wins Journal
            </span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-ink">
            {mode === "signin" ? "Welcome back" : "Create your journal"}
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            {mode === "signin"
              ? "Sign in to continue logging your wins."
              : "Start recording your professional achievements today."}
          </p>
        </div>

        <div
          className="fade-rise rounded-2xl bg-white/55 p-6 ring-1 ring-white/50 backdrop-blur-xl sm:p-8"
          style={{ animationDelay: "0.08s" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-ink/50"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg bg-white/70 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-transform placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-ink/50"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg bg-white/70 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-transform placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-teal transition-transform hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-2">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink/40">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/80 px-4 py-2.5 text-sm font-medium text-ink ring-1 ring-line transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p
          className="fade-rise mt-6 text-center text-sm text-ink/50"
          style={{ animationDelay: "0.14s" }}
        >
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-teal hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
