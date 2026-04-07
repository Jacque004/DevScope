import type { RepositoryMetadata } from "@/types/github";

export async function loadRepositoryMetadata(repoUrl: string): Promise<
  | { ok: true; data: RepositoryMetadata }
  | { ok: false; message: string; status: number }
> {
  const base =
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3001";
  const qs = new URLSearchParams({ url: repoUrl });
  const res = await fetch(`${base}/api/github/repository?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(", ");
      else if (typeof body.message === "string") message = body.message;
    } catch {
      /* ignore */
    }
    return { ok: false, message, status: res.status };
  }
  const data = (await res.json()) as RepositoryMetadata;
  return { ok: true, data };
}
