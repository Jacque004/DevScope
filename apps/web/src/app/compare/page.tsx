import Link from "next/link";
import { CompareRepoView } from "@/components/compare/compare-repo-view";
import { loadRepositoryMetadata } from "@/lib/github-metadata";

type Props = {
  searchParams: Promise<{ a?: string; b?: string }>;
};

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const rawA = params.a?.trim() ?? "";
  const rawB = params.b?.trim() ?? "";

  if (!rawA || !rawB) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Phase 4
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Comparaison de dépôts
          </h1>
          <p className="mt-3 text-zinc-400">
            Deux URL GitHub publiques — métadonnées via l’API (même source que le
            tableau de bord).
          </p>
        </div>
        <form
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
          action="/compare"
          method="get"
        >
          <div>
            <label htmlFor="cmp-a" className="block text-sm font-medium text-zinc-400">
              Dépôt A
            </label>
            <input
              id="cmp-a"
              name="a"
              type="url"
              required
              defaultValue={rawA}
              placeholder="https://github.com/owner/repo"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="cmp-b" className="block text-sm font-medium text-zinc-400">
              Dépôt B
            </label>
            <input
              id="cmp-b"
              name="b"
              type="url"
              required
              defaultValue={rawB}
              placeholder="https://github.com/owner/autre"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-medium text-zinc-950 transition hover:bg-cyan-400 sm:w-auto"
          >
            Comparer
          </button>
        </form>
        <p className="text-sm text-zinc-500">
          <Link href="/" className="text-cyan-400 hover:underline">
            ← Accueil
          </Link>
        </p>
      </div>
    );
  }

  const [left, right] = await Promise.all([
    loadRepositoryMetadata(rawA),
    loadRepositoryMetadata(rawB),
  ]);

  return (
    <CompareRepoView left={left} right={right} leftUrl={rawA} rightUrl={rawB} />
  );
}
