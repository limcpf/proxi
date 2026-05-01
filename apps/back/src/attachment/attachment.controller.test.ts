import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
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
});
