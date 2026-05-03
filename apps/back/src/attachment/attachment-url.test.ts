import { afterEach, describe, expect, it } from "vitest";
import { createAttachmentDownloadUrl } from "./attachment-url.js";

describe("createAttachmentDownloadUrl", () => {
  const previousPublicApiBaseUrl = process.env.PROXI_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (previousPublicApiBaseUrl === undefined) {
      delete process.env.PROXI_PUBLIC_API_BASE_URL;
      return;
    }

    process.env.PROXI_PUBLIC_API_BASE_URL = previousPublicApiBaseUrl;
  });

  it("public API base URL 이 없으면 기존 상대 경로를 반환한다", () => {
    delete process.env.PROXI_PUBLIC_API_BASE_URL;

    expect(createAttachmentDownloadUrl("attachment_one")).toBe(
      "/attachments/attachment_one/download",
    );
  });

  it("public API base URL 이 있으면 API origin 기준 URL 을 반환한다", () => {
    process.env.PROXI_PUBLIC_API_BASE_URL = "https://api.example.com/";

    expect(createAttachmentDownloadUrl("attachment_one")).toBe(
      "https://api.example.com/attachments/attachment_one/download",
    );
  });

  it("attachment id 를 URL path segment 로 인코딩한다", () => {
    process.env.PROXI_PUBLIC_API_BASE_URL = "https://api.example.com/api";

    expect(createAttachmentDownloadUrl("attachment_one/two")).toBe(
      "https://api.example.com/api/attachments/attachment_one%2Ftwo/download",
    );
  });
});
