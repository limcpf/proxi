import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { actorIdSchema, attachmentMaxSizeBytes } from "@proxi/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ownerActor } from "../common/auth/current-actor.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { AttachmentService } from "./attachment.service.js";

describe("AttachmentService", () => {
  const previousUploadRoot = process.env.PROXI_UPLOAD_ROOT;
  let uploadRoot: string;

  beforeEach(async () => {
    uploadRoot = await mkdtemp(path.join(tmpdir(), "proxi-attachment-test-"));
    process.env.PROXI_UPLOAD_ROOT = uploadRoot;
  });

  afterEach(async () => {
    if (previousUploadRoot === undefined) {
      delete process.env.PROXI_UPLOAD_ROOT;
    } else {
      process.env.PROXI_UPLOAD_ROOT = previousUploadRoot;
    }

    await rm(uploadRoot, { force: true, recursive: true });
  });

  it("Echo 에 연결되지 않은 attachment 다운로드를 거부한다", async () => {
    const service = createService({
      echoId: null,
      echo: null,
    });

    await expect(
      service.openDownload("attachment_detached", ownerActor.id),
    ).rejects.toThrow(ForbiddenException);
  });

  it("owner Echo 에 연결된 attachment 다운로드를 허용한다", async () => {
    await writeFile(path.join(uploadRoot, "memo.txt"), "memo");
    const service = createService({
      echoId: "echo_owner",
      echo: {
        authorActorId: "actor_owner",
      },
    });

    const download = await service.openDownload(
      "attachment_owner",
      ownerActor.id,
    );

    expect(download.fileName).toBe("memo.txt");
    expect(download.mimeType).toBe("text/plain");
    expect(download.sizeBytes).toBe(4);
    download.stream.destroy();
  });

  it("Echo 에 연결되지 않은 attachment 레코드와 파일을 삭제한다", async () => {
    const filePath = path.join(uploadRoot, "memo.txt");
    await writeFile(filePath, "memo");
    const { attachment, service } = createServiceFixture({
      echoId: null,
      echo: null,
    });

    await service.deleteUnattached("attachment_owner");

    expect(attachment.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "attachment_owner",
        echoId: null,
      },
    });
    await expect(access(filePath)).rejects.toThrow();
  });

  it("Echo 에 연결된 attachment 삭제 요청은 파일을 유지한다", async () => {
    const filePath = path.join(uploadRoot, "memo.txt");
    await writeFile(filePath, "memo");
    const { attachment, service } = createServiceFixture({
      echoId: "echo_owner",
      echo: {
        authorActorId: "actor_owner",
      },
    });

    await service.deleteUnattached("attachment_owner");

    expect(attachment.deleteMany).not.toHaveBeenCalled();
    await expect(access(filePath)).resolves.toBeUndefined();
  });

  it("DB 레코드가 있어도 파일이 없으면 다운로드를 NotFound 로 거부한다", async () => {
    const service = createService({
      echoId: "echo_owner",
      echo: {
        authorActorId: "actor_owner",
      },
    });

    await expect(
      service.openDownload("attachment_owner", ownerActor.id),
    ).rejects.toThrow(NotFoundException);
  });

  it("owner 가 아닌 Echo 에 연결된 attachment 다운로드를 거부한다", async () => {
    const service = createService({
      echoId: "echo_agent",
      echo: {
        authorActorId: "actor_agent",
      },
    });

    await expect(
      service.openDownload(
        "attachment_agent",
        actorIdSchema.parse("actor_owner"),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("base64 payload 가 최대 파일 크기보다 크면 디코딩 전에 거부한다", async () => {
    const service = createService({
      echoId: null,
      echo: null,
    });
    const bufferFrom = vi.spyOn(Buffer, "from");

    try {
      await expect(
        service.upload({
          fileName: "memo.txt",
          mimeType: "text/plain",
          sizeBytes: 1,
          contentBase64: "A".repeat(
            Math.ceil(attachmentMaxSizeBytes / 3) * 4 + 4,
          ),
        }),
      ).rejects.toThrow(BadRequestException);
      expect(bufferFrom).not.toHaveBeenCalled();
    } finally {
      bufferFrom.mockRestore();
    }
  });
});

function createService(attachmentState: {
  echoId: string | null;
  echo: {
    authorActorId: string;
  } | null;
}) {
  return createServiceFixture(attachmentState).service;
}

function createServiceFixture(attachmentState: {
  echoId: string | null;
  echo: {
    authorActorId: string;
  } | null;
}) {
  const attachment = {
    create: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({
      count: attachmentState.echoId === null ? 1 : 0,
    }),
    findUnique: vi.fn().mockResolvedValue({
      id: "attachment_owner",
      originalFileName: "memo.txt",
      mimeType: "text/plain",
      sizeBytes: 4,
      checksum: "checksum",
      relativePath: "memo.txt",
      createdAt: new Date("2026-05-03T00:00:00.000Z"),
      ...attachmentState,
    }),
  };
  const prisma = {
    attachment,
  } as unknown as PrismaService;

  return {
    attachment,
    service: new AttachmentService(prisma),
  };
}
