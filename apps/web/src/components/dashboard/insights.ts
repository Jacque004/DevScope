import type { RepositoryMetadata } from "@/types/github";

export type InsightLists = {
  strengths: string[];
  weaknesses: string[];
};

export function deriveInsights(m: RepositoryMetadata): InsightLists {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const daysSincePush =
    (Date.now() - new Date(m.pushedAt).getTime()) / 86_400_000;

  if (daysSincePush <= 7) strengths.push("Activité très récente (push < 7 jours)");
  else if (daysSincePush <= 30) strengths.push("Activité récente sur le dépôt");
  if (daysSincePush > 180) weaknesses.push("Peu d’activité récente sur la branche par défaut");

  if (m.stars >= 1_000) strengths.push("Forte visibilité (nombre d’étoiles élevé)");
  else if (m.stars < 5 && m.contributorsCount <= 2) {
    weaknesses.push("Visibilité limitée (peu d’étoiles, petit noyau)");
  }

  if (m.forks >= 50) strengths.push("Nombreux forks — intérêt de la communauté");
  if (m.contributorsCount >= 10) strengths.push("Communauté de contributeurs active");
  else if (m.contributorsCount === 1) weaknesses.push("Contribution concentrée sur peu de profils");

  if (m.languages.length >= 5) strengths.push("Stack technique diversifiée");
  if (m.commitsCount >= 500) strengths.push("Historique de commits substantiel");

  if (m.openIssues > 80) weaknesses.push("Beaucoup d’issues ouvertes (dette ou charge)");

  if (strengths.length === 0) strengths.push("Dépôt analysé — affinez le scoring en phase 2");
  if (weaknesses.length === 0) weaknesses.push("Aucun signal faible évident côté métadonnées");

  return { strengths, weaknesses };
}

/** Score indicatif 0–100 (heuristique MVP, phase 2 affinera les pondérations). */
export function computeMvpScore(m: RepositoryMetadata): number {
  let score = 35;
  const daysSincePush =
    (Date.now() - new Date(m.pushedAt).getTime()) / 86_400_000;

  if (daysSincePush < 7) score += 22;
  else if (daysSincePush < 30) score += 16;
  else if (daysSincePush < 90) score += 10;
  else if (daysSincePush < 365) score += 4;

  score += Math.min(18, Math.log10(m.stars + 1) * 7);
  score += Math.min(12, m.languages.length * 2.5);
  score += Math.min(15, Math.log10(m.commitsCount + 1) * 5);

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function subScores(m: RepositoryMetadata, global: number) {
  const daysSincePush =
    (Date.now() - new Date(m.pushedAt).getTime()) / 86_400_000;
  let activity = 40;
  if (daysSincePush < 14) activity = 92;
  else if (daysSincePush < 60) activity = 75;
  else if (daysSincePush < 180) activity = 55;
  else activity = 30;

  const popularity = Math.min(
    100,
    Math.round(15 + Math.log10(m.stars + m.forks * 2 + 1) * 18),
  );

  const structure = Math.min(
    100,
    Math.round(35 + m.languages.length * 8 + Math.min(25, m.contributorsCount)),
  );

  const readability = Math.min(
    100,
    Math.round(45 + (m.description ? 20 : 0) + (m.topics.length > 0 ? 15 : 0)),
  );

  return {
    activity: Math.min(100, activity),
    popularity: Math.min(100, popularity),
    structure: Math.min(100, structure),
    readability: Math.min(100, readability),
    global,
  };
}
