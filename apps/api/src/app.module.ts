import { Module } from "@nestjs/common";
import { AiModule } from "./ai/ai.module";
import { ApiRootController } from "./api-root.controller";
import { GithubModule } from "./github/github.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, GithubModule, AiModule],
  controllers: [ApiRootController],
})
export class AppModule {}
