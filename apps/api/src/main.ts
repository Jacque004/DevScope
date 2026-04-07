import { config } from "dotenv";
import { resolve } from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";

// Monorepo (DevScope/.env) puis apps/api/.env — pour GITHUB_TOKEN, PORT, etc.
config({ path: resolve(__dirname, "../../../.env") });
config({ path: resolve(__dirname, "../.env") });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api");

  // GET / sur le port API (3001) : évite un 404 trompeur — l’UI est sur le port Next.js
  app.getHttpAdapter().get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      service: "devscope-api",
      hint: "L’interface web DevScope est sur http://localhost:3000 (Next.js). Les routes REST sont sous /api.",
      health: "/api/health",
    });
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API NestJS : http://localhost:${port}/api — UI : http://localhost:3000`);
}

bootstrap();
