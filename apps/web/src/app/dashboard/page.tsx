import Link from "next/link";
import { DashboardRepoView } from "@/components/dashboard/dashboard-repo-view";
import { loadRepositoryMetadata } from "@/lib/github-metadata";

type Props = { searchParams: Promise<{ repo?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const repo = params.repo?.trim() ?? "";

  if (!repo) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="mt-4 text-zinc-400">
          Aucune URL fournie. Saisissez un dépôt depuis l’accueil pour afficher le
          dashboard (score, activité, stack, analyse).
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-cyan-400"
        >
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  const result = await loadRepositoryMetadata(repo);

  if (!result.ok) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Analyse impossible</h1>
        <p
          className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-red-200"
          role="alert"
        >
          {result.message}
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          En local sans token, le quota GitHub est limité (≈60 req/h). Ajoutez{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">
            GITHUB_TOKEN
          </code>{" "}
          dans <code className="font-mono text-xs">.env</code> à la racine du projet
          (voir <code className="font-mono text-xs">.env.example</code>).
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-cyan-400 hover:underline">
          ← Accueil
        </Link>
      </div>
    );
  }

  return <DashboardRepoView data={result.data} />;
}
