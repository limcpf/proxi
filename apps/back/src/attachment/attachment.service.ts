import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type allowedAttachmentMimeTypes,
  type EchoAttachment,
  echoAttachmentSchema,
  type UploadAttachmentRequest,
  uploadAttachmentRequestSchema,
} from "@proxi/shared";
import { ownerActor } from "../echo/domain/echo.entity.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { createAttachmentDownloadUrl } from "./attachment-url.js";

const defaultUploadRoot = ".local/uploads";
type AttachmentMimeType = (typeof allowedAttachmentMimeTypes)[number];
const extensionByMimeType: Record<AttachmentMimeType, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
};

interface PreparedUpload {
  id: string;
  request: UploadAttachmentRequest;
  content: Buffer;
  checksum: string;
  relativePath: string;
  absolutePath: string;
}

interface DownloadAttachmentRecord {
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  relativePath: string;
  echoId: string | null;
  echo: {
    authorActorId: string;
  } | null;
}

@Injectable()
export class AttachmentService {
  private readonly uploadRoot = path.resolve(
    process.cwd(),
    process.env.PROXI_UPLOAD_ROOT ?? defaultUploadRoot,
  );

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async upload(input: unknown): Promise<EchoAttachment> {
    const upload = this.prepareUpload(input);

    await this.writeUploadFile(upload);

    try {
      const attachment = await this.createAttachmentRecord(upload);

      return this.toResponse(attachment);
    } catch (error) {
      await unlink(upload.absolutePath).catch(() => undefined);
      throw error;
    }
  }

  async openDownload(attachmentId: string) {
    const attachment = await this.findDownloadAttachment(attachmentId);

    this.assertCanOpenDownload(attachment);

    return {
      fileName: attachment.originalFileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      stream: createReadStream(this.toAbsolutePath(attachment.relativePath)),
    };
  }

  private prepareUpload(input: unknown): PreparedUpload {
    const request = this.parseUploadRequest(input);
    const content = Buffer.from(request.contentBase64, "base64");

    this.assertUploadSizeMatches(content, request.sizeBytes);

    const id = `attachment_${randomUUID()}`;
    const checksum = createHash("sha256").update(content).digest("hex");
    const relativePath = this.createRelativePath(id, request.mimeType);

    return {
      id,
      request,
      content,
      checksum,
      relativePath,
      absolutePath: this.toAbsolutePath(relativePath),
    };
  }

  private assertUploadSizeMatches(content: Buffer, sizeBytes: number) {
    if (content.byteLength !== sizeBytes) {
      throw new BadRequestException({
        code: "attachment_size_mismatch",
        message: "파일 크기가 요청 정보와 맞지 않아요.",
      });
    }
  }

  private async writeUploadFile(upload: PreparedUpload) {
    await mkdir(path.dirname(upload.absolutePath), { recursive: true });
    await writeFile(upload.absolutePath, upload.content);
  }

  private async createAttachmentRecord(upload: PreparedUpload) {
    return this.prisma.attachment.create({
      data: {
        id: upload.id,
        originalFileName: upload.request.fileName,
        mimeType: upload.request.mimeType,
        sizeBytes: upload.request.sizeBytes,
        checksum: upload.checksum,
        relativePath: upload.relativePath,
      },
    });
  }

  private async findDownloadAttachment(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
      include: {
        echo: {
          select: {
            authorActorId: true,
          },
        },
      },
    });

    if (attachment === null) {
      throw new NotFoundException({
        code: "attachment_not_found",
        message: "찾는 파일이 없어요.",
      });
    }

    return attachment;
  }

  private assertCanOpenDownload(attachment: DownloadAttachmentRecord) {
    if (attachment.echoId === null || attachment.echo === null) {
      throw new ForbiddenException({
        code: "attachment_not_attached",
        message: "아직 Echo 에 연결되지 않은 파일이에요.",
      });
    }

    if (attachment.echo.authorActorId !== ownerActor.id) {
      throw new ForbiddenException({
        code: "attachment_permission_denied",
        message: "이 파일을 내려받을 권한이 없어요.",
      });
    }
  }

  private parseUploadRequest(input: unknown): UploadAttachmentRequest {
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

  private createRelativePath(
    attachmentId: string,
    mimeType: AttachmentMimeType,
  ) {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");

    return `${year}/${month}/${attachmentId}${extensionByMimeType[mimeType]}`;
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
      downloadUrl: createAttachmentDownloadUrl(attachment.id),
      createdAt: attachment.createdAt.toISOString(),
    });
  }
}
