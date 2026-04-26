import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetFrontHarnessApiState } from "../api/front-harness.api";
import type { FrontHarnessView } from "../model";
import { FrontHarnessPage } from "./front-harness-page";

function renderPage(view: "overview" | "plan" = "overview") {
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
      <FrontHarnessPage onViewChange={vi.fn()} view={view} />
    </QueryClientProvider>,
  );
}

function renderInteractivePage(initialView: FrontHarnessView = "overview") {
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

  function Harness() {
    const [view, setView] = useState<FrontHarnessView>(initialView);

    return <FrontHarnessPage onViewChange={setView} view={view} />;
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>,
  );
}

describe("FrontHarnessPage", () => {
  beforeEach(() => {
    resetFrontHarnessApiState();
  });

  it("초기 렌더에서 로딩 뒤에 채택 스택을 보여준다", async () => {
    renderPage();

    expect(
      screen.getByText("기준 스냅샷을 불러오는 중입니다."),
    ).toBeInTheDocument();

    expect(await screen.findByText("채택 스택")).toBeInTheDocument();
  });

  it("기준 점검 폼에서 필수 입력 검증을 수행한다", async () => {
    const user = userEvent.setup();

    renderPage("plan");

    expect(
      await screen.findByText("새 화면을 만들기 전 체크"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초기 기준 저장" }));

    expect(
      await screen.findByText("화면 목적은 10자 이상으로 적어주세요."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("primary action 을 적어주세요."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("URL 로 올릴 상태를 적어주세요."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("query / mutation 경계를 적어주세요."),
    ).toBeInTheDocument();
  });

  it("저장한 API 경계와 메모를 마지막 저장 결과에 보존한다", async () => {
    const user = userEvent.setup();

    renderPage("plan");

    expect(
      await screen.findByText("새 화면을 만들기 전 체크"),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("화면 목적"),
      "연결 상태와 설정 저장 흐름을 한 화면에서 점검한다.",
    );
    await user.type(screen.getByLabelText("primary action"), "설정 저장");
    await user.type(screen.getByLabelText("URL 로 올릴 상태"), "탭, 필터");
    await user.type(
      screen.getByLabelText("query / mutation 경계"),
      "상태 조회 query, 설정 저장 mutation",
    );
    await user.click(screen.getByRole("button", { name: "고급 메모 열기" }));
    await user.type(
      screen.getByLabelText("보류 메모"),
      "Storybook 은 재사용 패턴이 늘어나면 도입 여부를 다시 본다.",
    );

    await user.click(screen.getByRole("button", { name: "초기 기준 저장" }));

    expect(
      await screen.findByText("API 경계: 상태 조회 query, 설정 저장 mutation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "메모: Storybook 은 재사용 패턴이 늘어나면 도입 여부를 다시 본다.",
      ),
    ).toBeInTheDocument();
  });

  it("탭을 전환해도 입력 중인 초안을 유지한다", async () => {
    const user = userEvent.setup();

    renderInteractivePage("plan");

    expect(
      await screen.findByText("새 화면을 만들기 전 체크"),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("화면 목적"),
      "연결 상태와 설정 저장 흐름을 한 화면에서 점검한다.",
    );
    await user.type(screen.getByLabelText("primary action"), "설정 저장");
    await user.type(screen.getByLabelText("URL 로 올릴 상태"), "탭, 필터");
    await user.type(
      screen.getByLabelText("query / mutation 경계"),
      "상태 조회 query, 설정 저장 mutation",
    );
    await user.click(screen.getByRole("button", { name: "고급 메모 열기" }));
    await user.type(
      screen.getByLabelText("보류 메모"),
      "이 메모는 탭 전환 뒤에도 남아야 한다.",
    );

    await user.click(screen.getByRole("button", { name: "개요 보기" }));
    await user.click(screen.getByRole("button", { name: "기준 점검" }));

    expect(await screen.findByLabelText("화면 목적")).toHaveValue(
      "연결 상태와 설정 저장 흐름을 한 화면에서 점검한다.",
    );
    expect(screen.getByLabelText("primary action")).toHaveValue("설정 저장");
    expect(screen.getByLabelText("URL 로 올릴 상태")).toHaveValue("탭, 필터");
    expect(screen.getByLabelText("query / mutation 경계")).toHaveValue(
      "상태 조회 query, 설정 저장 mutation",
    );
    expect(screen.getByLabelText("보류 메모")).toHaveValue(
      "이 메모는 탭 전환 뒤에도 남아야 한다.",
    );
  });

  it("메모를 접으면 숨은 검증 실패 없이 저장한다", async () => {
    const user = userEvent.setup();
    const longNote = "가".repeat(241);

    renderPage("plan");

    expect(
      await screen.findByText("새 화면을 만들기 전 체크"),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("화면 목적"),
      "연결 상태와 설정 저장 흐름을 한 화면에서 점검한다.",
    );
    await user.type(screen.getByLabelText("primary action"), "설정 저장");
    await user.type(screen.getByLabelText("URL 로 올릴 상태"), "탭, 필터");
    await user.type(
      screen.getByLabelText("query / mutation 경계"),
      "상태 조회 query, 설정 저장 mutation",
    );
    await user.click(screen.getByRole("button", { name: "고급 메모 열기" }));
    await user.type(screen.getByLabelText("보류 메모"), longNote);

    await user.click(screen.getByRole("button", { name: "초기 기준 저장" }));

    expect(
      await screen.findByText("메모는 240자 이하로 적어주세요."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "메모 접기" }));

    expect(
      screen.queryByText("메모는 240자 이하로 적어주세요."),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초기 기준 저장" }));

    expect(
      await screen.findByText("API 경계: 상태 조회 query, 설정 저장 mutation"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/메모:/)).not.toBeInTheDocument();
  });
});
