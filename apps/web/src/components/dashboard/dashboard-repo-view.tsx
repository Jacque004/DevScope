import Link from "next/link";
import type { ReactNode } from "react";
import type { RepositoryMetadata } from "@/types/github";
import { CommitActivityChart } from "@/components/dashboard/commit-activity-chart";
import { LlmInsightsPanel } from "@/components/dashboard/llm-insights-panel";
import {
  computeMvpScore,
  deriveInsights,
  subScores,
} from "@/components/dashboard/insights";

/** UTC fixe — évite les écarts d’hydratation entre moteurs Intl Node / navigateur. */
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const y = d.getUTCFullYear();
    const h = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day}/${mo}/${y} ${h}:${min} UTC`;
  } catch {
    return iso;
  }
}

/** Entiers avec espaces (ASCII) — même rendu Node / navigateur (pas d’Intl). */
function formatInt(n: number): string {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

type Props = { data: RepositoryMetadata };

export function DashboardRepoView({ data: m }: Props) {
  const score = computeMvpScore(m);
  const subs = subScores(m, score);
  const { strengths, weaknesses } = deriveInsights(m);

  return (
    <div className="space-y-12">
      {/* En-tête + score */}
      <section className="flex flex-col gap-8 border-b border-zinc-800 pb-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Analyse du dépôt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {m.fullName}
          </h1>
          {m.description ? (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
              {m.description}
            </p>
          ) : (
            <p className="mt-4 text-zinc-500">Aucune description sur GitHub.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={m.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
            >
              Ouvrir sur GitHub
            </a>
            <Link
              href="/"
              className="inline-flex rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Nouvelle analyse
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900/50 px-8 py-6">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Score global (indicatif)
          </p>
          <p
            className="mt-2 text-5xl font-bold tabular-nums text-cyan-400"
            title="Heuristique MVP — phase 2 affinera les critères"
          >
            {score}
          </p>
          <p className="mt-1 text-center text-xs text-zinc-500">sur 100</p>
        </div>
      </section>

      {/* KPI */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Indicateurs clés
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Stars" value={m.stars} />
          <StatCard label="Forks" value={m.forks} />
          <StatCard label="Commits (approx.)" value={m.commitsCount} />
          <StatCard label="Contributeurs" value={m.contributorsCount} />
        </div>
      </section>

      {/* Sous-scores */}
      <section aria-labelledby="subscores-heading">
        <h2
          id="subscores-heading"
          className="text-sm font-medium uppercase tracking-wide text-zinc-500"
        >
          Détail du scoring (MVP)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SubScoreCard label="Activité" value={subs.activity} hint="Fréquence des pushes" />
          <SubScoreCard
            label="Popularité"
            value={subs.popularity}
            hint="Stars & forks"
          />
          <SubScoreCard
            label="Structure"
            value={subs.structure}
            hint="Langages & contributeurs"
          />
          <SubScoreCard
            label="Lisibilité"
            value={subs.readability}
            hint="Description & topics"
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Activité */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Activité & métadonnées
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Branche par défaut" value={<span className="font-mono text-cyan-300">{m.defaultBranch}</span>} />
            <Row label="Dernier push" value={formatDate(m.pushedAt)} />
            <Row label="Création" value={formatDate(m.createdAt)} />
            <Row label="Issues ouvertes" value={String(m.openIssues)} />
            {m.license ? <Row label="Licence" value={m.license} /> : null}
            {m.homepage ? (
              <div className="flex flex-col gap-1 pt-1">
                <dt className="text-zinc-500">Site</dt>
                <dd>
                  <a
                    href={m.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-cyan-400 hover:underline"
                  >
                    {m.homepage}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Commits par semaine (branche par défaut)
            </p>
            <div className="mt-3">
              <CommitActivityChart
                branch={m.defaultBranch}
                activity={m.commitActivity}
              />
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Technologies (répartition des octets)
          </h2>
          {m.languages.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Aucune statistique de langage.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {m.languages.map((lang) => (
                <li key={lang.name}>
                  <div className="flex justify-between text-sm">
                    <span>{lang.name}</span>
                    <span className="text-zinc-500">
                      {lang.percentage}% · {formatInt(lang.bytes)} o
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-cyan-500/90"
                      style={{ width: `${Math.min(100, lang.percentage)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Analyse intelligente : heuristique + LLM */}
      <section aria-labelledby="ai-heading" className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2
          id="ai-heading"
          className="text-sm font-medium uppercase tracking-wide text-zinc-500"
        >
          Analyse intelligente
        </h2>
        <p className="mt-2 text-xs text-zinc-600">
          Aperçu rapide basé sur des règles (sans coût), puis analyse générative à partir des
          mêmes métadonnées (OpenAI, clé côté serveur).
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-emerald-400">Points forts (heuristique)</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-300">
              {strengths.map((s, i) => (
                <li key={`s-${i}-${s.slice(0, 40)}`}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-400">Vigilance (heuristique)</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-300">
              {weaknesses.map((w, i) => (
                <li key={`w-${i}-${w.slice(0, 40)}`}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <LlmInsightsPanel metadata={m} />
      </section>

      {/* Détection & avancé */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Détection de problèmes
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li className="flex justify-between gap-4">
              <span>README présent</span>
              <span className="text-zinc-600">À détecter (clone / API)</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Fichiers volumineux</span>
              <span className="text-zinc-600">Phase ultérieure</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Activité faible</span>
              <span className="text-zinc-300">Voir score activité ci-dessus</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Fonctionnalités avancées
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            <li>
              <Link
                href="/compare"
                className="text-cyan-400 hover:underline"
              >
                Comparaison de dépôts
              </Link>
              <span className="text-zinc-500"> — phase 4 (vue côte à côte)</span>
            </li>
            <li>
              <span className="text-zinc-300">README généré</span>.
            </li>
          </ul>
        </div>
      </section>

      {m.topics.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Topics
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {m.topics.map((t) => (
              <li
                key={t}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-300"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {formatInt(value)}
      </p>
    </div>
  );
}

function SubScoreCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-100">{value}</p>
      <p className="mt-1 text-xs text-zinc-600">{hint}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-cyan-500/80"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
