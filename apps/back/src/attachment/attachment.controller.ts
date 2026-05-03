import {
  Body,
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Post,
  StreamableFile,
} from "@nestjs/common";
import type { EchoAttachment } from "@proxi/shared";
import {
  CurrentActor,
  type RequestActor,
} from "../common/auth/current-actor.js";
import { AttachmentService } from "./attachment.service.js";

@Controller("attachments")
export class AttachmentController {
  constructor(
    @Inject(AttachmentService) private readonly attachments: AttachmentService,
  ) {}

  @Post()
  async uploadAttachment(@Body() body: unknown): Promise<EchoAttachment> {
    return this.attachments.upload(body);
  }

  @Get(":attachmentId/download")
  @Header("Cache-Control", "private, max-age=60")
  async downloadAttachment(
    @Param("attachmentId") attachmentId: string,
    @CurrentActor() actor: RequestActor,
  ) {
    const download = await this.attachments.openDownload(
      attachmentId,
      actor.id,
    );

    return new StreamableFile(download.stream, {
      disposition: createContentDisposition(download.fileName),
      length: download.sizeBytes,
      type: download.mimeType,
    });
  }
}

function createContentDisposition(fileName: string) {
  return `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
