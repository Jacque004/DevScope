export type CommitActivityWeek = {
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
  languages: { name: string; bytes: number; percentage: number }[];
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
