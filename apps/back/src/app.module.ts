import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AttachmentModule } from "./attachment/attachment.module.js";
import { EchoModule } from "./echo/echo.module.js";

@Module({
  imports: [AttachmentModule, EchoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
