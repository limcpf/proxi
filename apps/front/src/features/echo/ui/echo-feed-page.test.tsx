import { type EchoDetail, echoDetailSchema } from "@proxi/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEcho, listEchoes, uploadAttachmentFile } from "../api/echo.api";
import { EchoFeedPage } from "./echo-feed-page";

vi.mock("../api/echo.api", () => ({
  createEcho: vi.fn(),
  listEchoes: vi.fn(),
  uploadAttachmentFile: vi.fn(),
}));

const now = "2026-04-28T00:00:00.000Z";

describe("EchoFeedPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(createEcho).mockReset();
    vi.mocked(listEchoes).mockReset();
    vi.mocked(uploadAttachmentFile).mockReset();
  });

  it("로딩 뒤 empty 상태를 보여준다", async () => {
    vi.mocked(listEchoes).mockResolvedValue({
      items: [],
    });

    renderPage();

    expect(
      screen.queryByText("짧게 쓰고, 다시 이어받는 공간"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Echo 검색" })).toBeNull();
    expect(screen.getByText("메아리를 불러오는 중이에요.")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "아직 울린 메아리가 없어요. 첫 Echo 를 남겨볼까요?",
      ),
    ).toBeInTheDocument();
  });

  it("Echo 작성 후 목록을 invalidate 한다", async () => {
    const user = userEvent.setup();
    const echo = createEchoDetail("echo_first", "첫 Echo");

    vi.mocked(listEchoes)
      .mockResolvedValueOnce({
        items: [],
      })
      .mockResolvedValue({
        items: [echo],
      });
    vi.mocked(createEcho).mockResolvedValue(echo);

    renderPage();

    await user.type(screen.getByLabelText("새 Echo 본문"), "첫 Echo");
    await user.click(screen.getByRole("button", { name: "Echo 남기기" }));

    expect(createEcho).toHaveBeenCalledWith({
      body: "첫 Echo",
      attachmentIds: [],
    });
    expect(await screen.findByText("첫 Echo")).toBeInTheDocument();
  });

  it("검색은 보조 액션을 누른 뒤 노출한다", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    vi.mocked(listEchoes).mockResolvedValue({
      items: [],
    });

    renderPage({ onSearchChange });

    expect(screen.queryByRole("textbox", { name: "Echo 검색" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "검색" }));
    await user.type(screen.getByRole("textbox", { name: "Echo 검색" }), "첫");
    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(onSearchChange).toHaveBeenCalledWith("첫");
  });

  it("파일 input 은 숨기고 선택된 첨부 파일만 표시한다", async () => {
    const user = userEvent.setup();
    vi.mocked(listEchoes).mockResolvedValue({
      items: [],
    });

    renderPage();

    const fileInput = screen.getByLabelText("첨부 파일");
    expect(fileInput).toHaveClass("sr-only");

    await user.upload(
      fileInput,
      new File(["memo"], "memo.txt", { type: "text/plain" }),
    );

    expect(screen.getByText("memo.txt")).toBeInTheDocument();
  });
});

function renderPage(
  props: { onSearchChange?: (q: string) => void; searchTerm?: string } = {},
) {
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
      <EchoFeedPage {...props} />
    </QueryClientProvider>,
  );
}

function createEchoDetail(id: string, body: string): EchoDetail {
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
  });
}
