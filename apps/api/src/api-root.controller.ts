import { Controller, Get } from "@nestjs/common";

/** Répond sur GET /api (préfixe global + contrôleur racine). */
@Controller()
export class ApiRootController {
  @Get()
  index() {
    return {
      service: "devscope-api",
      endpoints: {
        health: "GET /api/health",
        repository:
          "GET /api/github/repository?url=https://github.com/propriétaire/dépôt",
        insights:
          "POST /api/ai/insights — body { metadata } ; OpenAI si OPENAI_API_KEY, sinon Ollama ; LLM_PROVIDER=ollama pour forcer Ollama.",
      },
      ui: "http://localhost:3000",
    };
  }
}
