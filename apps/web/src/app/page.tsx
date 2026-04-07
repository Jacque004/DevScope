import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
        DevScope
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Analysez un dépôt GitHub en local
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        Collez l’URL d’un dépôt public GitHub : les métadonnées sont récupérées
        via l’API officielle (backend NestJS).
      </p>
      <form
        className="mt-10 flex flex-col gap-3 sm:flex-row"
        action="/dashboard"
        method="get"
      >
        <input
          name="repo"
          type="url"
          required
          placeholder="https://github.com/owner/repo"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-6 py-3 font-medium text-zinc-950 transition hover:bg-cyan-400"
        >
          Analyser
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-400">
        <Link href="/compare" className="text-cyan-400 hover:underline">
          Comparer deux dépôts
        </Link>{" "}
        <span className="text-zinc-600">(phase 4)</span>
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        <Link href="/about" className="text-cyan-400 hover:underline">
          A propos du projet
        </Link>
      </p>
      <p className="mt-8 text-sm text-zinc-500">
        État du backend :{" "}
        <Link href="/api/health" className="text-cyan-400 hover:underline">
          /api/health
        </Link>
      </p>
    </main>
  );
}
