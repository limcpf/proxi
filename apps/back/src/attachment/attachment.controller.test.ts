import { Readable } from "node:stream";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";
import { ownerActor } from "../common/auth/current-actor.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AttachmentController } from "./attachment.controller.js";
import { AttachmentService } from "./attachment.service.js";

describe("AttachmentController", () => {
  it("AttachmentService 런타임 토큰으로 의존성을 주입한다", async () => {
    const module = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        AttachmentService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    expect(module.get(AttachmentController)).toBeInstanceOf(
      AttachmentController,
    );
  });

  it("다운로드 요청 액터를 AttachmentService 에 전달한다", async () => {
    const attachments = {
      openDownload: vi.fn().mockResolvedValue({
        fileName: "memo.txt",
        mimeType: "text/plain",
        sizeBytes: 4,
        stream: Readable.from(["memo"]),
      }),
      deleteUnattached: vi.fn(),
    };
    const module = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        {
          provide: AttachmentService,
          useValue: attachments,
        },
      ],
    }).compile();

    const controller = module.get(AttachmentController);

    await controller.downloadAttachment("attachment_owner", ownerActor);

    expect(attachments.openDownload).toHaveBeenCalledWith(
      "attachment_owner",
      ownerActor.id,
    );
  });

  it("삭제 요청을 미연결 attachment 정리로 전달한다", async () => {
    const attachments = {
      deleteUnattached: vi.fn().mockResolvedValue(undefined),
    };
    const module = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        {
          provide: AttachmentService,
          useValue: attachments,
        },
      ],
    }).compile();

    const controller = module.get(AttachmentController);

    await controller.deleteAttachment("attachment_orphan");

    expect(attachments.deleteUnattached).toHaveBeenCalledWith(
      "attachment_orphan",
    );
  });
});
