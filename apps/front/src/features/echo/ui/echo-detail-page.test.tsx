import { type EchoDetail, echoDetailSchema } from "@proxi/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { archiveEcho, createReply, getEcho, updateEcho } from "../api/echo.api";
import { EchoDetailPage } from "./echo-detail-page";

vi.mock("../api/echo.api", () => ({
  archiveEcho: vi.fn(),
  createReply: vi.fn(),
  getEcho: vi.fn(),
  updateEcho: vi.fn(),
}));

const now = "2026-04-28T00:00:00.000Z";

describe("EchoDetailPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(archiveEcho).mockReset();
    vi.mocked(createReply).mockReset();
    vi.mocked(getEcho).mockReset();
    vi.mocked(updateEcho).mockReset();
  });

  it("상세와 댓글을 보여준다", async () => {
    vi.mocked(getEcho).mockResolvedValue(
      createEchoDetail("echo_root", "root", {
        replies: [createEchoSummary("echo_reply", "reply")],
      }),
    );

    renderPage();

    expect(screen.getByText("메아리를 불러오는 중이에요.")).toBeInTheDocument();
    expect(await screen.findByText("root")).toBeInTheDocument();
    expect(screen.getByText("reply")).toBeInTheDocument();
  });

  it("수정 성공 후 상세를 다시 불러온다", async () => {
    const user = userEvent.setup();

    vi.mocked(getEcho)
      .mockResolvedValueOnce(createEchoDetail("echo_root", "root"))
      .mockResolvedValue(createEchoDetail("echo_root", "updated"));
    vi.mocked(updateEcho).mockResolvedValue(
      createEchoDetail("echo_root", "updated"),
    );

    renderPage();

    await screen.findByText("root");
    await user.click(screen.getByRole("button", { name: "수정" }));
    await user.clear(screen.getByLabelText("Echo 수정 본문"));
    await user.type(screen.getByLabelText("Echo 수정 본문"), "updated");
    await user.click(screen.getByRole("button", { name: "수정 저장" }));

    expect(updateEcho).toHaveBeenCalledWith("echo_root", { body: "updated" });
    expect(await screen.findByText("updated")).toBeInTheDocument();
  });

  it("삭제 확인 후 archived read-only 상태를 보여준다", async () => {
    const user = userEvent.setup();

    vi.mocked(getEcho)
      .mockResolvedValueOnce(createEchoDetail("echo_root", "root"))
      .mockResolvedValue(
        createEchoDetail("echo_root", "root", { status: "archived" }),
      );
    vi.mocked(archiveEcho).mockResolvedValue(undefined);

    renderPage();

    await screen.findByText("root");
    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(
      screen.getByText("이 Echo 를 아카이브로 보낼까요?"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "아카이브로 보내기" }));

    expect(archiveEcho).toHaveBeenCalledWith("echo_root");
    expect(
      await screen.findByText("아카이브된 Echo 입니다."),
    ).toBeInTheDocument();
  });

  it("댓글 작성 후 상세를 다시 불러온다", async () => {
    const user = userEvent.setup();
    const reply = createEchoSummary("echo_reply", "reply");

    vi.mocked(getEcho)
      .mockResolvedValueOnce(createEchoDetail("echo_root", "root"))
      .mockResolvedValue(
        createEchoDetail("echo_root", "root", { replies: [reply] }),
      );
    vi.mocked(createReply).mockResolvedValue(
      createEchoDetail("echo_reply", "reply", {
        parentEchoId: "echo_root",
        rootEchoId: "echo_root",
      }),
    );

    renderPage();

    await screen.findByText("root");
    await user.type(screen.getByLabelText("댓글 본문"), "reply");
    await user.click(screen.getByRole("button", { name: "댓글 남기기" }));

    expect(createReply).toHaveBeenCalledWith("echo_root", { body: "reply" });
    expect(await screen.findByText("reply")).toBeInTheDocument();
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
      <EchoDetailPage echoId="echo_root" />
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
    replyCount: Array.isArray(overrides.replies) ? overrides.replies.length : 0,
    createdAt: now,
    updatedAt: now,
    replies: [],
    ...overrides,
  });
}

function createEchoSummary(id: string, body: string) {
  return {
    id,
    body,
    status: "published",
    author: {
      id: "actor_owner",
      type: "owner",
      displayName: "Owner",
    },
    parentEchoId: "echo_root",
    rootEchoId: "echo_root",
    replyCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
