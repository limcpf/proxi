import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";
import { AttachmentService } from "../attachment/attachment.service.js";
import { PrismaEchoRepository } from "../echo/adapters/persistence/prisma-echo.repository.js";
import { PrismaService } from "./prisma.service.js";

describe("Prisma-backed providers", () => {
  it("PrismaEchoRepository 에 PrismaService 를 주입한다", async () => {
    const prisma = {
      attachment: {
        count: vi.fn().mockResolvedValue(1),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        PrismaEchoRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    const repository = module.get(PrismaEchoRepository);

    await expect(
      repository.countAttachableAttachments(["attachment_1"]),
    ).resolves.toBe(1);
    expect(prisma.attachment.count).toHaveBeenCalledWith({
      where: {
        id: {
          in: ["attachment_1"],
        },
        echoId: null,
      },
    });
  });

  it("AttachmentService 에 PrismaService 를 주입한다", async () => {
    const prisma = {
      attachment: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    const attachments = module.get(AttachmentService);

    await expect(
      attachments.openDownload("attachment_missing"),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.attachment.findUnique).toHaveBeenCalledWith({
      include: {
        echo: {
          select: {
            authorActorId: true,
          },
        },
      },
      where: {
        id: "attachment_missing",
      },
    });
  });
});
