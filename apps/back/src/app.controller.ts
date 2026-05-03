import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get("health")
  getHealth() {
    return this.appService.getHealth();
  }

  @Get("shared-contract")
  getSharedContract() {
    return this.appService.getSharedContract();
  }
}
