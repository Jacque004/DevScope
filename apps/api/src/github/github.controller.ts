import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from "@nestjs/common";
import { GithubService } from "./github.service";

@Controller("github")
export class GithubController {
  constructor(private readonly github: GithubService) {}

  /** GET /api/github/repository?url=https://github.com/owner/repo */
  @Get("repository")
  async repository(@Query("url") url: string | undefined) {
    if (!url?.trim()) {
      throw new BadRequestException("Paramètre url requis");
    }
    return this.github.getRepositoryMetadata(url);
  }
}
