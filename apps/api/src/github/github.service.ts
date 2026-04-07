import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";

const GITHUB_API = "https://api.github.com";
const ACCEPT = "application/vnd.github+json";
const API_VERSION = "2022-11-28";

type RepoResponse = {
  name: string;
  full_name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
  license: { name: string } | null;
};

export type LanguageSlice = {
  name: string;
  bytes: number;
  percentage: number;
};

export type CommitActivityWeek = {
  /** Lundi (UTC) au format YYYY-MM-DD */
  weekStart: string;
  count: number;
};

export type CommitActivity = {
  weeks: CommitActivityWeek[];
  source: "participation" | "commits_fallback" | "empty";
};

export type RepositoryMetadata = {
  name: string;
  fullName: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  languages: LanguageSlice[];
  contributorsCount: number;
  commitsCount: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  license: string | null;
  htmlUrl: string;
  commitActivity: CommitActivity;
};

@Injectable()
export class GithubService {
  private headers(): HeadersInit {
    const token = process.env.GITHUB_TOKEN?.trim();
    return {
      Accept: ACCEPT,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "DevScope/1.0",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  parseOwnerRepo(input: string): { owner: string; repo: string } {
    const raw = input.trim();
    let path: string;
    try {
      const u = new URL(raw);
      if (!/github\.com$/i.test(u.hostname)) {
        throw new BadRequestException("L’URL doit pointer vers github.com");
      }
      path = u.pathname.replace(/^\//, "").replace(/\.git$/, "");
    } catch {
      throw new BadRequestException("URL GitHub invalide");
    }
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new BadRequestException("Format attendu : https://github.com/propriétaire/dépôt");
    }
    const owner = parts[0];
    const repo = parts[1];
    if (!owner || !repo) {
      throw new BadRequestException("Propriétaire ou dépôt manquant");
    }
    return { owner, repo };
  }

  async getRepositoryMetadata(repoUrl: string): Promise<RepositoryMetadata> {
    const { owner, repo } = this.parseOwnerRepo(repoUrl);

    const [repoRes, langsRes, contribRes, commitsCount] = await Promise.all([
      this.fetchJson<RepoResponse>(`/repos/${owner}/${repo}`),
      this.fetchJson<Record<string, number>>(`/repos/${owner}/${repo}/languages`),
      this.countContributors(owner, repo),
      this.countCommits(owner, repo),
    ]);

    const languages = this.toLanguageSlices(langsRes);
    const commitActivity = await this.getCommitActivity(
      owner,
      repo,
      repoRes.default_branch,
    );

    return {
      name: repoRes.name,
      fullName: repoRes.full_name,
      description: repoRes.description,
      homepage: repoRes.homepage,
      stars: repoRes.stargazers_count,
      forks: repoRes.forks_count,
      openIssues: repoRes.open_issues_count,
      defaultBranch: repoRes.default_branch,
      languages,
      contributorsCount: contribRes,
      commitsCount,
      createdAt: repoRes.created_at,
      updatedAt: repoRes.updated_at,
      pushedAt: repoRes.pushed_at,
      topics: repoRes.topics ?? [],
      license: repoRes.license?.name ?? null,
      htmlUrl: `https://github.com/${repoRes.full_name}`,
      commitActivity,
    };
  }

  /**
   * 1) GET /stats/participation (52 semaines, ordre ancien → récent)
   * 2) Sinon agrégation des commits sur la branche par défaut (API commits + since)
   */
  private async getCommitActivity(
    owner: string,
    repo: string,
    defaultBranch: string,
  ): Promise<CommitActivity> {
    const participation = await this.tryParticipation(owner, repo);
    if (participation && participation.length > 0) {
      return {
        weeks: this.labelParticipationWeeks(participation),
        source: "participation",
      };
    }

    const fallback = await this.aggregateCommitsByWeek(
      owner,
      repo,
      defaultBranch,
    );
    if (fallback.length > 0) {
      return { weeks: fallback, source: "commits_fallback" };
    }

    return { weeks: [], source: "empty" };
  }

  /** Réponse 200 avec { all: number[] } ; 202 = stats en cours de calcul (retry court). */
  private async tryParticipation(
    owner: string,
    repo: string,
  ): Promise<number[] | null> {
    const path = `/repos/${owner}/${repo}/stats/participation`;
    const tryOnce = async (): Promise<Response> => {
      return fetch(`${GITHUB_API}${path}`, { headers: this.headers() });
    };

    let res = await tryOnce();
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await tryOnce();
    }

    if (res.status === 404) return null;
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") return null;
    }
    if (!res.ok) return null;

    try {
      const body = (await res.json()) as { all?: number[] };
      const all = body.all;
      if (!Array.isArray(all) || all.length === 0) return null;
      return all;
    } catch {
      return null;
    }
  }

  private labelParticipationWeeks(all: number[]): CommitActivityWeek[] {
    const lastMonday = this.startOfUtcMonday(new Date());
    return all.map((count, i) => {
      const d = new Date(lastMonday);
      d.setUTCDate(d.getUTCDate() - (all.length - 1 - i) * 7);
      return {
        weekStart: d.toISOString().slice(0, 10),
        count,
      };
    });
  }

  private startOfUtcMonday(d: Date): Date {
    const x = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const day = x.getUTCDay() || 7;
    x.setUTCDate(x.getUTCDate() - (day - 1));
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private async aggregateCommitsByWeek(
    owner: string,
    repo: string,
    branch: string,
  ): Promise<CommitActivityWeek[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 366);
    const sinceIso = since.toISOString();
    const sha = encodeURIComponent(branch);

    type CommitItem = {
      commit?: { author?: { date?: string }; committer?: { date?: string } };
    };

    const buckets = new Map<string, number>();
    let page = 1;
    const maxPages = 15;

    while (page <= maxPages) {
      const path =
        `/repos/${owner}/${repo}/commits?sha=${sha}&since=${encodeURIComponent(sinceIso)}&per_page=100&page=${page}`;
      const res = await fetch(`${GITHUB_API}${path}`, {
        headers: this.headers(),
      });
      if (res.status === 404 || res.status === 422) break;
      if (res.status === 403) break;
      if (!res.ok) break;

      const data = (await res.json()) as CommitItem[];
      if (!Array.isArray(data) || data.length === 0) break;

      for (const item of data) {
        const iso =
          item.commit?.author?.date ?? item.commit?.committer?.date ?? null;
        if (!iso) continue;
        const key = this.startOfUtcMonday(new Date(iso)).toISOString().slice(0, 10);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      const link = res.headers.get("link");
      if (!link?.includes('rel="next"')) break;
      page += 1;
    }

    const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([weekStart, count]) => ({ weekStart, count }));
  }

  private toLanguageSlices(raw: Record<string, number>): LanguageSlice[] {
    const entries = Object.entries(raw);
    const total = entries.reduce((s, [, b]) => s + b, 0);
    if (total === 0) return [];
    return entries
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / total) * 1000) / 10,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  private async countCommits(owner: string, repo: string): Promise<number> {
    const path = `/repos/${owner}/${repo}/commits?per_page=1`;
    const { data, link } = await this.fetchJsonWithLink<unknown[]>(path);
    if (!Array.isArray(data)) return 0;
    if (data.length === 0) return 0;
    const last = this.parseLastPage(link);
    if (last != null) return last;
    return data.length;
  }

  private parseLastPage(linkHeader: string | null): number | null {
    if (!linkHeader) return null;
    const segments = linkHeader.split(/,\s*</);
    for (const seg of segments) {
      if (seg.includes('rel="last"')) {
        const m = seg.match(/[?&]page=(\d+)/);
        if (m) return parseInt(m[1], 10);
      }
    }
    return null;
  }

  private async countContributors(owner: string, repo: string): Promise<number> {
    let page = 1;
    let total = 0;
    const maxPages = 20;
    while (page <= maxPages) {
      const path = `/repos/${owner}/${repo}/contributors?per_page=100&page=${page}&anon=1`;
      const { data, link } = await this.fetchJsonWithLink<
        { id?: number; login?: string }[]
      >(path);
      if (!Array.isArray(data)) break;
      total += data.length;
      if (data.length < 100) break;
      if (!link || !link.includes('rel="next"')) break;
      page += 1;
    }
    return total;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: this.headers(),
    });
    this.ensureOk(res, path);
    return res.json() as Promise<T>;
  }

  private async fetchJsonWithLink<T>(
    path: string,
  ): Promise<{ data: T; link: string | null }> {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: this.headers(),
    });
    this.ensureOk(res, path);
    const link = res.headers.get("link");
    const data = (await res.json()) as T;
    return { data, link };
  }

  private ensureOk(res: Response, path: string): void {
    if (res.status === 404) {
      throw new NotFoundException("Dépôt introuvable ou privé (sans accès)");
    }
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        const reset = res.headers.get("x-ratelimit-reset");
        const msg = reset
          ? `Quota API GitHub épuisé. Réessayez après ${new Date(
              parseInt(reset, 10) * 1000,
            ).toISOString()} ou définissez GITHUB_TOKEN.`
          : "Quota API GitHub épuisé. Définissez GITHUB_TOKEN dans .env.";
        throw new ServiceUnavailableException(msg);
      }
      throw new BadRequestException("Accès refusé par l’API GitHub");
    }
    if (res.status === 422) {
      throw new BadRequestException("Requête GitHub invalide (dépôt vide ?)");
    }
    if (!res.ok) {
      throw new BadRequestException(`GitHub API erreur ${res.status} (${path})`);
    }
  }
}
