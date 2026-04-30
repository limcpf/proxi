import "reflect-metadata";
import { HttpException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EchoApplicationService } from "../../application/echo.application.service.js";
import { ECHO_REPOSITORY } from "../../ports/echo.repository.js";
import { InMemoryEchoRepository } from "../persistence/in-memory-echo.repository.js";
import { EchoController } from "./echo.controller.js";

describe("EchoController", () => {
  let controller: EchoController;

  beforeEach(async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);

    const moduleRef = await Test.createTestingModule({
      controllers: [EchoController],
      providers: [
        EchoApplicationService,
        {
          provide: ECHO_REPOSITORY,
          useClass: InMemoryEchoRepository,
        },
      ],
    }).compile();

    controller = moduleRef.get(EchoController);
  });

  it("create/list/detail/update/archive/reply 흐름을 제공한다", async () => {
    const root = await controller.createEcho({ body: "root" });
    const listed = await controller.listEchoes({});
    const reply = await controller.createReply(root.id, { body: "reply" });
    const detail = await controller.getEcho(root.id);
    const updated = await controller.updateEcho(root.id, { body: "updated" });

    await controller.archiveEcho(root.id);

    const archived = await controller.listArchivedEchoes({});
    const archivedDetail = await controller.getEcho(root.id);
    const restored = await controller.restoreEcho(root.id);

    expect(listed.items[0]?.id).toBe(root.id);
    expect(reply.parentEchoId).toBe(root.id);
    expect(detail.replies).toHaveLength(1);
    expect(updated.body).toBe("updated");
    expect(archived.items[0]?.id).toBe(root.id);
    expect(archivedDetail.status).toBe("archived");
    expect(restored.status).toBe("published");
  });

  it("애플리케이션 오류를 HTTP 예외로 매핑한다", async () => {
    await expect(controller.createEcho({ body: "" })).rejects.toBeInstanceOf(
      HttpException,
    );

    await expect(controller.createEcho({ body: "" })).rejects.toMatchObject({
      response: {
        code: "echo_validation_failed",
      },
      status: 400,
    });
  });
});
