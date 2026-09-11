import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wins Journal — Meridian" },
      {
        name: "description",
        content:
          "Log and track your professional achievements and their business impact.",
      },
      { property: "og:title", content: "Wins Journal — Meridian" },
      {
        property: "og:description",
        content:
          "Log and track your professional achievements and their business impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Win = {
  id: string;
  win_date: string;
  description: string;
  business_impact: string;
  created_at: string;
};

function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth" });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="size-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  return <Journal session={session} />;
}

function Journal({ session }: { session: Session }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");

  const { data: wins, isLoading } = useQuery({
    queryKey: ["wins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wins")
        .select("*")
        .order("win_date", { ascending: false });
      if (error) throw error;
      return data as Win[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      win_date: string;
      description: string;
      business_impact: string;
    }) => {
      const { data, error } = await supabase
        .from("wins")
        .insert({
          ...input,
          user_id: session.user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wins"] });
      setDescription("");
      setBusinessImpact("");
      toast.success("Win recorded");
    },
    onError: () => {
      toast.error("Could not save your win. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wins"] });
      toast.success("Entry removed");
    },
    onError: () => {
      toast.error("Could not remove entry. Please try again.");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !businessImpact.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate({
      win_date: date,
      description: description.trim(),
      business_impact: businessImpact.trim(),
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper font-sans">
      {/* frosted depth layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-[32rem] rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute -right-28 top-1/3 size-[30rem] rounded-full bg-white/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-teal/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 py-14 sm:py-20">
        {/* header */}
        <header className="fade-rise mb-10" style={{ animationDelay: "0.02s" }}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-white/60 ring-1 ring-white/40 backdrop-blur-xl">
                <span className="size-2.5 rounded-full bg-teal" />
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.18em] text-ink/50">
                Meridian
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-ink/40 transition-colors hover:text-ink/70"
            >
              Sign out
            </button>
          </div>
          <h1 className="text-balance font-serif text-4xl font-medium leading-none text-ink sm:text-5xl">
            Wins Journal
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-ink/55">
            A private record of what you moved, with the impact each win created. Nothing else.
          </p>
        </header>

        {/* log form */}
        <section
          className="fade-rise rounded-2xl bg-white/55 p-6 ring-1 ring-white/50 backdrop-blur-xl sm:p-8"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="mb-5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
              New entry
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="win-date"
                className="mb-1.5 block text-xs font-medium text-ink/50"
              >
                Date
              </label>
              <input
                id="win-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg bg-white/70 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-transform focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label
                htmlFor="win-desc"
                className="mb-1.5 block text-xs font-medium text-ink/50"
              >
                Description of the win
              </label>
              <textarea
                id="win-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you deliver or change?"
                className="w-full resize-none rounded-lg bg-white/70 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-transform placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <div>
              <label
                htmlFor="win-impact"
                className="mb-1.5 block text-xs font-medium text-ink/50"
              >
                Business impact
              </label>
              <textarea
                id="win-impact"
                rows={2}
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value)}
                placeholder="Revenue, time saved, risk reduced..."
                className="w-full resize-none rounded-lg bg-white/70 px-3.5 py-2.5 text-sm text-ink ring-1 ring-line transition-transform placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-teal transition-transform hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              <span className="grid size-4 place-items-center text-white/90">+</span>
              {createMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        </section>

        {/* entries feed */}
        <section className="fade-rise mt-12" style={{ animationDelay: "0.14s" }}>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-serif text-xl font-medium text-ink">Chronicle</h2>
            <span className="text-xs font-medium text-ink/40">
              {wins?.length ?? 0} {wins?.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
            </div>
          ) : !wins || wins.length === 0 ? (
            <div className="rounded-xl bg-white/40 p-8 text-center ring-1 ring-white/40 backdrop-blur-xl">
              <p className="text-sm text-ink/50">
                No wins recorded yet. Log your first achievement above.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {wins.map((win) => (
                <li
                  key={win.id}
                  className="group rounded-xl bg-white/55 p-5 ring-1 ring-white/50 backdrop-blur-xl sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 shrink-0 text-center">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-teal">
                        {format(parseISO(win.win_date), "MMM")}
                      </div>
                      <div className="font-serif text-2xl leading-none text-ink">
                        {format(parseISO(win.win_date), "dd")}
                      </div>
                    </div>
                    <div className="w-px self-stretch bg-line" />
                    <div className="min-w-0 flex-1">
                      <p className="text-pretty text-[15px] text-ink">{win.description}</p>
                      <div className="mt-3 flex items-start gap-2 text-sm text-ink/55">
                        <span className="mt-px grid size-4 shrink-0 place-items-center text-teal/70">
                          <span className="block size-1.5 rounded-full bg-current" />
                        </span>
                        <p className="text-pretty">{win.business_impact}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(win.id)}
                      className="mt-px shrink-0 text-xs text-ink/30 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="mt-14 flex items-center justify-between border-t border-line/70 pt-6 text-xs text-ink/40">
          <span>Private to you. Nothing is shared.</span>
          <span>Meridian · est. 2024</span>
        </footer>
      </div>
    </div>
  );
}
