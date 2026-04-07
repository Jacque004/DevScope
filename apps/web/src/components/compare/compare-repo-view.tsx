import Link from "next/link";
import type { RepositoryMetadata } from "@/types/github";
import { computeMvpScore } from "@/components/dashboard/insights";

type Result =
  | { ok: true; data: RepositoryMetadata }
  | { ok: false; message: string };

type Props = {
  left: Result;
  right: Result;
  leftUrl: string;
  rightUrl: string;
};

function formatInt(n: number): string {
  const s = String(Math.round(n));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDateUtc(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
    const y = d.getUTCFullYear();
    return `${day}/${mo}/${y} UTC`;
  } catch {
    return iso;
  }
}

function topLangs(m: RepositoryMetadata, n: number): string {
  return m.languages
    .slice(0, n)
    .map((l) => `${l.name} (${l.percentage}%)`)
    .join(" · ") || "—";
}

function Cell({ result }: { result: Result }) {
  if (!result.ok) {
    return (
      <td className="bg-zinc-950/30 px-4 py-3 text-sm text-red-300/90">
        {result.message}
      </td>
    );
  }
  const m = result.data;
  return (
    <td className="bg-zinc-950/30 px-4 py-3 text-sm text-zinc-200">
      <Link
        href={m.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-cyan-400 hover:underline"
      >
        {m.fullName}
      </Link>
    </td>
  );
}

export function CompareRepoView({ left, right, leftUrl, rightUrl }: Props) {
  const lScore = left.ok ? computeMvpScore(left.data) : null;
  const rScore = right.ok ? computeMvpScore(right.data) : null;

  const cmpNum = (
    a: number | null,
    b: number | null,
    higherIsBetter: boolean,
  ): { L: "better" | "worse" | "neutral"; R: "better" | "worse" | "neutral" } => {
    if (a == null || b == null) return { L: "neutral", R: "neutral" };
    if (a === b) return { L: "neutral", R: "neutral" };
    const aWins = higherIsBetter ? a > b : a < b;
    return {
      L: aWins ? "better" : "worse",
      R: aWins ? "worse" : "better",
    };
  };

  const stars = cmpNum(
    left.ok ? left.data.stars : null,
    right.ok ? right.data.stars : null,
    true,
  );
  const forks = cmpNum(
    left.ok ? left.data.forks : null,
    right.ok ? right.data.forks : null,
    true,
  );
  const issues = cmpNum(
    left.ok ? left.data.openIssues : null,
    right.ok ? right.data.openIssues : null,
    false,
  );
  const contrib = cmpNum(
    left.ok ? left.data.contributorsCount : null,
    right.ok ? right.data.contributorsCount : null,
    true,
  );
  const commits = cmpNum(
    left.ok ? left.data.commitsCount : null,
    right.ok ? right.data.commitsCount : null,
    true,
  );
  const s1 = lScore ?? 0;
  const s2 = rScore ?? 0;
  const scoreHL = cmpNum(left.ok ? s1 : null, right.ok ? s2 : null, true);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Phase 4
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Comparaison de dépôts
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Vue côte à côte des métadonnées publiques (API GitHub). Les scores sont
          heuristiques, comme sur le tableau de bord.
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          Entrées :{" "}
          <span className="font-mono text-zinc-500">{leftUrl}</span>
          {" · "}
          <span className="font-mono text-zinc-500">{rightUrl}</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Indicateur
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-cyan-500/90">
                Dépôt A
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-cyan-500/90">
                Dépôt B
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/90">
            <tr>
              <th className="px-4 py-3 text-sm font-normal text-zinc-500">Dépôt</th>
              <Cell result={left} />
              <Cell result={right} />
            </tr>
            {left.ok && right.ok ? (
              <>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Score global (indicatif)
                  </th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${scoreHL.L === "better" ? "bg-emerald-950/25 ring-1 ring-emerald-500/30" : scoreHL.L === "worse" ? "bg-zinc-950/50" : ""}`}
                  >
                    {lScore}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${scoreHL.R === "better" ? "bg-emerald-950/25 ring-1 ring-emerald-500/30" : scoreHL.R === "worse" ? "bg-zinc-950/50" : ""}`}
                  >
                    {rScore}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">Étoiles</th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums text-zinc-200 ${stars.L === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(left.data.stars)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums text-zinc-200 ${stars.R === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(right.data.stars)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">Forks</th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${forks.L === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(left.data.forks)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${forks.R === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(right.data.forks)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Issues ouvertes
                  </th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${issues.L === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(left.data.openIssues)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${issues.R === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(right.data.openIssues)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Contributeurs (approx.)
                  </th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${contrib.L === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(left.data.contributorsCount)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${contrib.R === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(right.data.contributorsCount)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Commits (approx.)
                  </th>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${commits.L === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(left.data.commitsCount)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm tabular-nums ${commits.R === "better" ? "bg-emerald-950/20" : ""}`}
                  >
                    {formatInt(right.data.commitsCount)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Branche par défaut
                  </th>
                  <td className="px-4 py-3 font-mono text-sm text-zinc-300">
                    {left.data.defaultBranch}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-zinc-300">
                    {right.data.defaultBranch}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500">
                    Dernier push
                  </th>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {formatDateUtc(left.data.pushedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {formatDateUtc(right.data.pushedAt)}
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 text-sm font-normal text-zinc-500 align-top">
                    Langages (top 3)
                  </th>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {topLangs(left.data, 3)}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {topLangs(right.data, 3)}
                  </td>
                </tr>
              </>
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-4 text-sm text-zinc-500"
                >
                  Le détail des indicateurs s’affiche lorsque les deux dépôts sont
                  chargés correctement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600">
        Prochaines étapes possibles : graphiques d’activité superposés, tendance des
        issues, export — toujours sur métadonnées ou données agrégées.
      </p>
    </div>
  );
}
