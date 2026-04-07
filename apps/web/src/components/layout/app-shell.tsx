import Link from "next/link";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-zinc-800 ring-1 ring-cyan-500/30"
              aria-hidden
            >
              <svg
                viewBox="0 0 32 32"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#22d3ee"
                  d="M8 9h3v14H8V9zm5.5 0h3v10h-3V9zm5.5 0h3v14h-3V9z"
                />
              </svg>
            </span>
            <div className="leading-tight">
              <span className="block text-lg font-semibold tracking-tight">DevScope</span>
              <span className="hidden text-xs text-zinc-500 sm:block">
                Qualité · Activité · Stack · Profil
              </span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-4">
            <Link
              href="/about"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
            >
              A propos
            </Link>
            <Link
              href="/compare"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
            >
              Comparer
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-cyan-500/50 hover:text-cyan-300"
            >
              Nouvelle analyse
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">{children}</main>
    </div>
  );
}
