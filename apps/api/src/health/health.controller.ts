import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "devscope-api",
      at: new Date().toISOString(),
    };
  }
}
