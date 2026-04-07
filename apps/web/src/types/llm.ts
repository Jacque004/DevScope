export type LlmInsightsSuccess = {
  ok: true;
  summary: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  model: string;
};

export type LlmInsightsFailure = {
  ok: false;
  code:
    | "NO_API_KEY"
    | "OPENAI_ERROR"
    | "OPENAI_QUOTA"
    | "OLLAMA_ERROR"
    | "OLLAMA_UNREACHABLE"
    | "LLM_DISABLED"
    | "INVALID_METADATA"
    | "PARSE_ERROR";
  message: string;
};

export type LlmInsightsResult = LlmInsightsSuccess | LlmInsightsFailure;
