/**
 * État de chargement du tableau de bord (remplace l’indicateur générique Next.js
 * pendant la résolution de la route / données).
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="flex flex-col gap-6 border-b border-zinc-800 pb-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl flex-1 space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800/80" />
          <div className="h-4 w-[80%] max-w-md animate-pulse rounded bg-zinc-800/60" />
        </div>
        <div className="h-36 w-40 shrink-0 animate-pulse rounded-2xl bg-zinc-800/90" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-800/80" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl bg-zinc-800/60" />
        <div className="h-72 animate-pulse rounded-xl bg-zinc-800/60" />
      </div>
      <p className="text-center text-sm text-zinc-500">
        Chargement de l’analyse GitHub…
      </p>
    </div>
  );
}
