import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

describe("AppService", () => {
  it("health 응답을 반환한다", () => {
    const service = new AppService();

    expect(service.getHealth()).toEqual({
      service: "proxi-back",
      status: "ok",
    });
  });

  it("shared public API 를 workspace 의존성으로 소비한다", () => {
    const service = new AppService();

    expect(service.getSharedContract()).toEqual({
      ok: true,
      data: {
        service: "proxi-back",
        sharedContractVersion: "0.1.0",
      },
    });
  });
});

describe("AppController", () => {
  it("Nest testing module 에서 controller 를 구성한다", async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    const controller = moduleRef.get(AppController);

    expect(controller.getHealth()).toEqual({
      service: "proxi-back",
      status: "ok",
    });
  });
});
