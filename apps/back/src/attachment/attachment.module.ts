import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AttachmentController } from "./attachment.controller.js";
import { AttachmentService } from "./attachment.service.js";

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, PrismaService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
