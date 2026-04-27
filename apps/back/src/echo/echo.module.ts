import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { EchoController } from "./adapters/http/echo.controller.js";
import { PrismaEchoRepository } from "./adapters/persistence/prisma-echo.repository.js";
import { EchoApplicationService } from "./application/echo.application.service.js";
import { ECHO_REPOSITORY } from "./ports/echo.repository.js";

@Module({
  controllers: [EchoController],
  providers: [
    PrismaService,
    PrismaEchoRepository,
    EchoApplicationService,
    {
      provide: ECHO_REPOSITORY,
      useExisting: PrismaEchoRepository,
    },
  ],
})
export class EchoModule {}
