"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { RepositoryMetadata } from "@/types/github";
import type { LlmInsightsResult } from "@/types/llm";

type Props = { metadata: RepositoryMetadata };

type Status =
  | { phase: "checking" | "disabled" }
  | { phase: "loading" }
  | { phase: "done"; data: LlmInsightsResult }
  | { phase: "error"; message: string };

function LlmBlock({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 border-t border-zinc-800 pt-8">
      <div>{children}</div>
    </div>
  );
}

export function LlmInsightsPanel({ metadata }: Props) {
  /** Évite tout écart SSR / premier rendu client (squelette, fetch) vs hydratation. */
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>({ phase: "checking" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    setStatus({ phase: "checking" });

    let cancelled = false;

    async function run() {
      try {
        const enRes = await fetch("/api/ai/enabled");
        const en = (await enRes.json()) as { enabled?: boolean };
        if (cancelled) return;
        if (!en.enabled) {
          setStatus({ phase: "disabled" });
          return;
        }

        setStatus({ phase: "loading" });
        const res = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata }),
        });
        const data = (await res.json()) as LlmInsightsResult;
        if (cancelled) return;
        setStatus({ phase: "done", data });
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus({ phase: "error", message: msg });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [mounted, metadata]);

  if (!mounted) {
    return null;
  }

  if (status.phase === "checking" || status.phase === "disabled") {
    return null;
  }

  if (status.phase === "loading") {
    return (
      <LlmBlock>
        <div className="animate-pulse space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="h-4 w-48 rounded bg-zinc-800" />
          <div className="h-20 w-full rounded bg-zinc-800/80" />
          <div className="h-4 w-full rounded bg-zinc-800/60" />
          <div className="h-4 w-[80%] max-w-md rounded bg-zinc-800/60" />
        </div>
      </LlmBlock>
    );
  }

  if (status.phase === "error") {
    return (
      <LlmBlock>
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {status.message}
        </p>
      </LlmBlock>
    );
  }

  if (status.phase !== "done") {
    return null;
  }

  const { data } = status;

  if (!data.ok && data.code === "LLM_DISABLED") {
    return null;
  }

  if (!data.ok) {
    return null;
  }

  return (
    <LlmBlock>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-cyan-400">Résumé</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{data.summary}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-emerald-400">Points forts (modèle)</h3>
            {data.strengths.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-300">
                {data.strengths.map((s, i) => (
                  <li key={`ls-${i}-${s.slice(0, 48)}`}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Non précisé par le modèle.</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-400">Points de vigilance (modèle)</h3>
            {data.weaknesses.length > 0 ? (
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-300">
                {data.weaknesses.map((w, i) => (
                  <li key={`lw-${i}-${w.slice(0, 48)}`}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Non précisé par le modèle.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400">Recommandations</h3>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-zinc-300">
            {data.recommendations.map((r, i) => (
              <li key={`rec-${i}-${r.slice(0, 48)}`} className="pl-1">
                {r}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-zinc-600">
          Modèle : {data.model} — réponse générée à partir des métadonnées uniquement (pas
          d’accès au code source).
        </p>
      </div>
    </LlmBlock>
  );
}
