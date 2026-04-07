import { Injectable } from "@nestjs/common";
import type { RepositoryMetadata } from "../github/github.service";
import type { LlmInsightsResult } from "./ai.types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `Tu es un expert en qualité logicielle et analyse de dépôts GitHub.
Tu reçois uniquement des métadonnées agrégées (pas le code source).
Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec exactement ces clés :
- "summary" : string, 2 à 4 phrases en français, ton professionnel.
- "recommendations" : tableau de 3 à 5 chaînes, recommandations concrètes et actionnables en français.
- "strengths" : tableau de 2 à 4 chaînes, points forts en français.
- "weaknesses" : tableau de 2 à 4 chaînes, risques ou axes d’amélioration en français.
Ne pas inclure de clés supplémentaires. Pas de texte hors du JSON.`;

type ParsedInsight = {
  summary?: string;
  recommendations?: string[];
  strengths?: string[];
  weaknesses?: string[];
};

@Injectable()
export class AiService {
  /** Indique si l’appel LLM est activé (même règle que generateInsights). */
  isLlmEnabled(): { enabled: boolean } {
    const llmOn = process.env.LLM_ENABLED?.trim().toLowerCase();
    return { enabled: llmOn === "true" || llmOn === "1" };
  }

  buildContextPayload(meta: RepositoryMetadata): Record<string, unknown> {
    const weeks = meta.commitActivity?.weeks ?? [];
    return {
      fullName: meta.fullName,
      description: meta.description,
      homepage: meta.homepage,
      htmlUrl: meta.htmlUrl,
      stars: meta.stars,
      forks: meta.forks,
      openIssues: meta.openIssues,
      defaultBranch: meta.defaultBranch,
      languages: meta.languages.slice(0, 12).map((l) => ({
        name: l.name,
        percentage: l.percentage,
      })),
      contributorsCount: meta.contributorsCount,
      commitsApprox: meta.commitsCount,
      topics: meta.topics.slice(0, 20),
      license: meta.license,
      createdAt: meta.createdAt,
      pushedAt: meta.pushedAt,
      activitySource: meta.commitActivity?.source ?? "empty",
      weeklyCommitsSample: weeks.slice(-16).map((w) => ({
        week: w.weekStart,
        commits: w.count,
      })),
    };
  }

  /**
   * OpenAI si OPENAI_API_KEY est défini ; Ollama si LLM_PROVIDER=ollama ou sans clé OpenAI.
   */
  private provider(): "ollama" | "openai" {
    const p = process.env.LLM_PROVIDER?.trim().toLowerCase();
    if (p === "ollama") return "ollama";
    if (p === "openai") return "openai";
    if (process.env.OPENAI_API_KEY?.trim()) return "openai";
    return "ollama";
  }

  async generateInsights(metadata: unknown): Promise<LlmInsightsResult> {
    /** Opt-in : pas d’Ollama ni d’OpenAI tant que LLM_ENABLED n’est pas explicitement activé. */
    const llmOn = process.env.LLM_ENABLED?.trim().toLowerCase();
    if (llmOn !== "true" && llmOn !== "1") {
      return {
        ok: false,
        code: "LLM_DISABLED",
        message: "off",
      };
    }

    if (!metadata || typeof metadata !== "object") {
      return {
        ok: false,
        code: "INVALID_METADATA",
        message: "Corps de requête invalide : attendu { metadata: { ... } }.",
      };
    }

    const m = metadata as Partial<RepositoryMetadata>;
    if (!m.fullName || !m.commitActivity) {
      return {
        ok: false,
        code: "INVALID_METADATA",
        message: "Métadonnées incomplètes (fullName, commitActivity requis).",
      };
    }

    const meta = m as RepositoryMetadata;
    const userContent = JSON.stringify(this.buildContextPayload(meta), null, 0);

    if (this.provider() === "openai") {
      return this.generateOpenAI(userContent);
    }
    return this.generateOllama(userContent);
  }

  private buildOllamaUnreachableMessage(basesTried: string[], model: string): string {
    return [
      `Aucun serveur Ollama joignable sur : ${basesTried.join(" ni ")}.`,
      "1) Installez Ollama (ollama.com), ouvrez l’application, puis en terminal : ollama pull " + model,
      "2) Test : curl http://127.0.0.1:11434/api/tags (doit répondre du JSON).",
      "3) Si Nest tourne dans WSL2 et Ollama sur Windows : sous Windows, ipconfig → adresse IPv4 (ex. 192.168.x.x), puis dans .env : OLLAMA_BASE_URL=http://CETTE_IP:11434",
      "4) Pour ne pas utiliser de LLM : ne mettez pas LLM_ENABLED=true (comportement par défaut).",
    ].join(" ");
  }

  private async generateOllama(userContent: string): Promise<LlmInsightsResult> {
    const model = process.env.OLLAMA_MODEL?.trim() || "llama3.2";
    const configured = process.env.OLLAMA_BASE_URL?.replace(/\/$/, "").trim();
    /** Sans URL explicite : essai 127.0.0.1 puis localhost (souvent utile sous Windows). */
    const bases = configured
      ? [configured]
      : ["http://127.0.0.1:11434", "http://localhost:11434"];

    const payload = JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Métadonnées du dépôt (JSON) :\n${userContent}`,
        },
      ],
      stream: false,
      format: "json",
    });

    let res: Response | undefined;
    for (const base of bases) {
      try {
        res = await fetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const isLast = base === bases[bases.length - 1];
        if (isLast) {
          return {
            ok: false,
            code: /ECONNREFUSED|fetch failed|network|aggregate/i.test(msg)
              ? "OLLAMA_UNREACHABLE"
              : "OLLAMA_ERROR",
            message: /ECONNREFUSED|fetch failed|network|aggregate/i.test(msg)
              ? this.buildOllamaUnreachableMessage(bases, model)
              : `Ollama : ${msg}`,
          };
        }
      }
    }

    if (!res) {
      return {
        ok: false,
        code: "OLLAMA_UNREACHABLE",
        message: this.buildOllamaUnreachableMessage(bases, model),
      };
    }

    if (!res.ok) {
      let detail = "";
      try {
        const err = (await res.json()) as { error?: string };
        detail = err.error ?? "";
      } catch {
        /* ignore */
      }
      return {
        ok: false,
        code: "OLLAMA_ERROR",
        message: `Ollama HTTP ${res.status}${detail ? ` — ${detail}` : ""}. Essayez : ollama pull ${model}`,
      };
    }

    const raw = (await res.json()) as {
      message?: { content?: string };
      model?: string;
    };
    const content = raw.message?.content;
    if (!content) {
      return {
        ok: false,
        code: "PARSE_ERROR",
        message: "Réponse Ollama vide ou inattendue.",
      };
    }

    return this.parseInsightJson(content, `ollama/${raw.model ?? model}`);
  }

  private async generateOpenAI(userContent: string): Promise<LlmInsightsResult> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        ok: false,
        code: "NO_API_KEY",
        message:
          "Mode OpenAI : OPENAI_API_KEY est absent. Ajoutez une clé ou passez en Ollama (LLM_PROVIDER=ollama).",
      };
    }

    const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
    const baseUrl = process.env.OPENAI_BASE_URL?.trim() || OPENAI_URL;

    let res: Response;
    try {
      res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Métadonnées du dépôt (JSON) :\n${userContent}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.35,
          max_tokens: 1800,
        }),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        code: "OPENAI_ERROR",
        message: `Appel OpenAI impossible : ${msg}`,
      };
    }

    if (!res.ok) {
      let detail = "";
      try {
        const err = (await res.json()) as { error?: { message?: string } };
        detail = err.error?.message ?? "";
      } catch {
        /* ignore */
      }
      const quota =
        res.status === 429 ||
        /quota|billing|insufficient funds|payment/i.test(detail);
      if (quota) {
        return {
          ok: false,
          code: "OPENAI_QUOTA",
          message:
            "Quota ou facturation OpenAI. Pour Ollama en local : LLM_PROVIDER=ollama (ou retirez OPENAI_API_KEY).",
        };
      }
      return {
        ok: false,
        code: "OPENAI_ERROR",
        message: `OpenAI HTTP ${res.status}${detail ? ` — ${detail}` : ""}`,
      };
    }

    const raw = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      model?: string;
    };
    const content = raw.choices?.[0]?.message?.content;
    if (!content) {
      return {
        ok: false,
        code: "PARSE_ERROR",
        message: "Réponse OpenAI vide ou inattendue.",
      };
    }

    return this.parseInsightJson(content, raw.model ?? model);
  }

  private parseInsightJson(
    content: string,
    modelLabel: string,
  ): LlmInsightsResult {
    let parsed: ParsedInsight;
    try {
      parsed = JSON.parse(content) as ParsedInsight;
    } catch {
      return {
        ok: false,
        code: "PARSE_ERROR",
        message: "Le modèle n’a pas renvoyé du JSON valide.",
      };
    }

    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((x) => typeof x === "string").map((s) => s.trim())
      : [];
    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((x) => typeof x === "string").map((s) => s.trim())
      : [];
    const weaknesses = Array.isArray(parsed.weaknesses)
      ? parsed.weaknesses.filter((x) => typeof x === "string").map((s) => s.trim())
      : [];

    if (!summary || recommendations.length === 0) {
      return {
        ok: false,
        code: "PARSE_ERROR",
        message: "Structure JSON incomplète (summary ou recommendations manquants).",
      };
    }

    return {
      ok: true,
      summary,
      recommendations,
      strengths,
      weaknesses,
      model: modelLabel,
    };
  }
}
