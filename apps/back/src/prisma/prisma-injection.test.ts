import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, vi } from "vitest";
import { AttachmentModule } from "../attachment/attachment.module.js";
import { AttachmentService } from "../attachment/attachment.service.js";
import { ownerActor } from "../common/auth/current-actor.js";
import { PrismaEchoRepository } from "../echo/adapters/persistence/prisma-echo.repository.js";
import { EchoModule } from "../echo/echo.module.js";
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
      attachments.openDownload("attachment_missing", ownerActor.id),
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

  it("EchoModule 과 AttachmentModule 이 같은 PrismaService provider 를 공유한다", async () => {
    const prisma = {
      attachment: {
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };
    const module = await Test.createTestingModule({
      imports: [EchoModule, AttachmentModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    const repository = module.get(PrismaEchoRepository);
    const attachments = module.get(AttachmentService);
    const injectedPrisma = module.get(PrismaService, { strict: false });

    await expect(
      repository.countAttachableAttachments(["attachment_1"]),
    ).resolves.toBe(1);
    await expect(
      attachments.openDownload("attachment_missing", ownerActor.id),
    ).rejects.toThrow(NotFoundException);
    expect(injectedPrisma).toBe(prisma);
    expect(prisma.attachment.count).toHaveBeenCalledOnce();
    expect(prisma.attachment.findUnique).toHaveBeenCalledOnce();
  });
});
