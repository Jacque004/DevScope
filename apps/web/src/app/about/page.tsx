import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A propos | DevScope",
  description: "Objectif et utilite du projet DevScope",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          DevScope
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">A propos</h1>
        <p className="mt-4 text-zinc-300">
          DevScope aide a evaluer rapidement un depot GitHub public a partir de ses
          metadonnees: activite recente, technologies detectees, structure generale
          et signaux de qualite.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">But du projet</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          L&apos;objectif est de gagner du temps lors d&apos;une revue initiale de
          repository: recrutement, audit technique, benchmark, due diligence ou
          simple exploration d&apos;un projet open source.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">A quoi ca sert ?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>Obtenir un apercu clair d&apos;un depot en quelques secondes.</li>
          <li>Comparer deux depots sur une base coherente.</li>
          <li>Identifier rapidement points forts et zones de vigilance.</li>
          <li>Appuyer une decision technique avec des indicateurs concrets.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Comment ca fonctionne</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Le frontend Next.js envoie l&apos;URL du depot au backend NestJS, qui
          interroge l&apos;API GitHub pour recuperer les donnees utiles, puis
          construit les vues dashboard et comparaison.
        </p>
      </section>

      <p className="text-sm text-zinc-500">
        <Link href="/" className="text-cyan-400 hover:underline">
          ← Retour a l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
