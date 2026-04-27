import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { EchoModule } from "./echo/echo.module.js";

@Module({
  imports: [EchoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
