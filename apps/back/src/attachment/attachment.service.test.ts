import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ForbiddenException } from "@nestjs/common";
import { actorIdSchema } from "@proxi/shared";
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
});

function createService(attachmentState: {
  echoId: string | null;
  echo: {
    authorActorId: string;
  } | null;
}) {
  const prisma = {
    attachment: {
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
    },
  } as unknown as PrismaService;

  return new AttachmentService(prisma);
}
