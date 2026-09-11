import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  timeframe: z.enum(["month", "quarter", "year"]),
});

const LABELS: Record<string, string> = {
  month: "the last month",
  quarter: "the last quarter",
  year: "the last year",
};

function startDate(timeframe: "month" | "quarter" | "year") {
  const d = new Date();
  if (timeframe === "month") d.setMonth(d.getMonth() - 1);
  else if (timeframe === "quarter") d.setMonth(d.getMonth() - 3);
  else d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export const generateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const from = startDate(data.timeframe);

    const { data: wins, error } = await context.supabase
      .from("wins")
      .select("win_date, description, business_impact")
      .gte("win_date", from)
      .order("win_date", { ascending: false });

    if (error) throw new Error("Could not read your entries.");
    if (!wins || wins.length === 0) {
      return { bullets: [] as string[], count: 0, timeframe: data.timeframe };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this app.");

    const entries = wins
      .map(
        (w) =>
          `- ${w.win_date}: ${w.description} | Impact: ${w.business_impact}`,
      )
      .join("\n");

    const prompt = `You are writing a professional achievement summary for a business professional, covering ${LABELS[data.timeframe]}.

Here are their logged wins:
${entries}

Write 3 to 5 concise bullet points. Each bullet describes one key accomplishment in clear, confident business language, quantifying impact where the entries provide it. Group or combine related wins so no bullet is trivial. Do not invent facts.

Return ONLY the bullet lines, one per line, each starting with "- ". No headings, no preamble.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low" },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted. Please add credits to continue.");
      if (res.status === 403)
        throw new Error("AI access is blocked for this workspace.");
      console.error("AI gateway error", res.status, body);
      throw new Error("Could not generate the summary. Please try again.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && event.delta) {
            text += event.delta;
          } else if (
            event.type === "response.completed" &&
            !text &&
            event.response?.output_text
          ) {
            text = event.response.output_text;
          }
        } catch {
          // ignore keepalive / partial payloads
        }
      }
    }

    const bullets = text
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    return { bullets, count: wins.length, timeframe: data.timeframe };
  });
