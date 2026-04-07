import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  /** GET /api/ai/enabled — évite un POST inutile quand LLM désactivé */
  @Get("enabled")
  llmEnabled() {
    return this.ai.isLlmEnabled();
  }

  /** POST /api/ai/insights — body : { metadata: RepositoryMetadata } */
  @Post("insights")
  async insights(@Body() body: { metadata?: unknown }) {
    if (body?.metadata === undefined) {
      throw new BadRequestException("Champ « metadata » requis");
    }
    return this.ai.generateInsights(body.metadata);
  }
}
