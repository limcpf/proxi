import { type EchoDetail, echoDetailSchema } from "@proxi/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listArchivedEchoes, restoreEcho } from "../api/echo.api";
import { EchoArchivePage } from "./echo-archive-page";

vi.mock("../api/echo.api", () => ({
  listArchivedEchoes: vi.fn(),
  restoreEcho: vi.fn(),
}));

const now = "2026-04-28T00:00:00.000Z";

describe("EchoArchivePage", () => {
  beforeEach(() => {
    vi.mocked(listArchivedEchoes).mockReset();
    vi.mocked(restoreEcho).mockReset();
  });

  it("아카이브 목록을 보여주고 복구 요청을 보낸다", async () => {
    const user = userEvent.setup();
    const archived = createEchoDetail("echo_archived", "숨긴 Echo", {
      status: "archived",
      deletedAt: now,
    });

    vi.mocked(listArchivedEchoes)
      .mockResolvedValueOnce({
        items: [archived],
      })
      .mockResolvedValue({
        items: [],
      });
    vi.mocked(restoreEcho).mockResolvedValue(
      createEchoDetail("echo_archived", "숨긴 Echo"),
    );

    renderPage();

    expect(await screen.findByText("숨긴 Echo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "복구" }));

    expect(restoreEcho).toHaveBeenCalledWith("echo_archived");
    expect(
      await screen.findByText("아카이브된 Echo 가 없어요."),
    ).toBeInTheDocument();
  });
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EchoArchivePage />
    </QueryClientProvider>,
  );
}

function createEchoDetail(
  id: string,
  body: string,
  overrides: Partial<Record<keyof EchoDetail, unknown>> = {},
): EchoDetail {
  return echoDetailSchema.parse({
    id,
    body,
    status: "published",
    author: {
      id: "actor_owner",
      type: "owner",
      displayName: "Owner",
    },
    replyCount: 0,
    createdAt: now,
    updatedAt: now,
    replies: [],
    ...overrides,
  });
}
