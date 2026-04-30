import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type EchoAttachment,
  echoAttachmentSchema,
  uploadAttachmentRequestSchema,
} from "@proxi/shared";
import type { PrismaService } from "../prisma/prisma.service.js";

const defaultUploadRoot = ".local/uploads";
const extensionByMimeType: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
};

@Injectable()
export class AttachmentService {
  private readonly uploadRoot = path.resolve(
    process.cwd(),
    process.env.PROXI_UPLOAD_ROOT ?? defaultUploadRoot,
  );

  constructor(private readonly prisma: PrismaService) {}

  async upload(input: unknown): Promise<EchoAttachment> {
    const request = this.parseUploadRequest(input);
    const content = Buffer.from(request.contentBase64, "base64");

    if (content.byteLength !== request.sizeBytes) {
      throw new BadRequestException({
        code: "attachment_size_mismatch",
        message: "파일 크기가 요청 정보와 맞지 않아요.",
      });
    }

    const id = `attachment_${randomUUID()}`;
    const checksum = createHash("sha256").update(content).digest("hex");
    const relativePath = this.createRelativePath(id, request.mimeType);
    const absolutePath = this.toAbsolutePath(relativePath);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);

    try {
      const attachment = await this.prisma.attachment.create({
        data: {
          id,
          originalFileName: request.fileName,
          mimeType: request.mimeType,
          sizeBytes: request.sizeBytes,
          checksum,
          relativePath,
        },
      });

      return this.toResponse(attachment);
    } catch (error) {
      await unlink(absolutePath).catch(() => undefined);
      throw error;
    }
  }

  async openDownload(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
    });

    if (attachment === null) {
      throw new NotFoundException({
        code: "attachment_not_found",
        message: "찾는 파일이 없어요.",
      });
    }

    if (attachment.echoId === null) {
      throw new ForbiddenException({
        code: "attachment_not_attached",
        message: "아직 Echo 에 연결되지 않은 파일이에요.",
      });
    }

    return {
      fileName: attachment.originalFileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      stream: createReadStream(this.toAbsolutePath(attachment.relativePath)),
    };
  }

  private parseUploadRequest(input: unknown) {
    const parsed = uploadAttachmentRequestSchema.safeParse(input);

    if (!parsed.success) {
      throw new BadRequestException({
        code: "attachment_validation_failed",
        message:
          parsed.error.issues[0]?.message ?? "업로드할 파일을 확인해 주세요.",
        details: parsed.error.issues,
      });
    }

    return parsed.data;
  }

  private createRelativePath(attachmentId: string, mimeType: string) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");

    return `${year}/${month}/${attachmentId}${extensionByMimeType[mimeType] ?? ".bin"}`;
  }

  private toAbsolutePath(relativePath: string) {
    const absolutePath = path.resolve(this.uploadRoot, relativePath);
    const relativeToRoot = path.relative(this.uploadRoot, absolutePath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new BadRequestException({
        code: "attachment_path_invalid",
        message: "파일 저장 경로를 확인해 주세요.",
      });
    }

    return absolutePath;
  }

  private toResponse(attachment: {
    id: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    checksum: string;
    createdAt: Date;
  }) {
    return echoAttachmentSchema.parse({
      id: attachment.id,
      originalFileName: attachment.originalFileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      checksum: attachment.checksum,
      downloadUrl: `/attachments/${encodeURIComponent(attachment.id)}/download`,
      createdAt: attachment.createdAt.toISOString(),
    });
  }
}
