import { queryOptions } from "@tanstack/react-query";
import type {
  FrontBaselineSnapshot,
  FrontPlanDraftInput,
  FrontPlanDraftSummary,
} from "../model";

const frontHarnessKeys = {
  baseline: () => ["front-harness", "baseline"] as const,
};

const initialBaseline: FrontBaselineSnapshot = {
  scopeNote:
    "현재 화면은 실제 백엔드 연동 대신 스택 기준과 상태 책임을 확인하기 위한 프런트 하네스입니다.",
  adoptedStack: [
    { label: "app type", value: "React SPA" },
    { label: "runtime", value: "React + Vite + TypeScript" },
    { label: "router / data", value: "TanStack Router + TanStack Query" },
    { label: "form / validation", value: "react-hook-form + zod" },
    { label: "styling / ui", value: "Tailwind CSS + shadcn/ui + Radix UI" },
    { label: "testing", value: "Vitest + Testing Library" },
  ],
  deferredItems: [
    "OpenAPI 기반 타입/클라이언트 생성",
    "Storybook",
    "E2E 테스트 도구",
    "다국어 시스템",
    "디자인 token 자동 생성 파이프라인",
  ],
  stateOwnership: [
    {
      label: "URL 상태",
      owner: "TanStack Router",
      rule: "필터, 정렬, 탭, 페이지네이션처럼 화면을 재현해야 하는 상태를 올린다.",
    },
    {
      label: "서버 비동기 상태",
      owner: "TanStack Query",
      rule: "캐시, invalidation, 재요청 정책이 필요한 데이터를 둔다.",
    },
    {
      label: "폼 입력 상태",
      owner: "react-hook-form + zod",
      rule: "입력 중 값과 동기 검증 규칙을 같이 관리한다.",
    },
    {
      label: "로컬 UI 상태",
      owner: "component state",
      rule: "모달, 드롭다운, 고급 옵션처럼 짧은 상태만 둔다.",
    },
  ],
  lastSavedDraft: null,
};

let currentBaseline: FrontBaselineSnapshot = initialBaseline;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function frontBaselineQueryOptions() {
  return queryOptions({
    queryKey: frontHarnessKeys.baseline(),
    queryFn: fetchFrontBaseline,
  });
}

export async function fetchFrontBaseline() {
  await delay(180);

  return currentBaseline;
}

export async function saveFrontPlanDraft(
  payload: FrontPlanDraftInput,
): Promise<FrontPlanDraftSummary> {
  await delay(160);

  const savedDraft = {
    goal: payload.goal,
    primaryAction: payload.primaryAction,
    urlState: payload.urlState,
    updatedAt: new Date().toISOString(),
  };

  currentBaseline = {
    ...currentBaseline,
    lastSavedDraft: savedDraft,
  };

  return savedDraft;
}

export function resetFrontHarnessApiState() {
  currentBaseline = initialBaseline;
}

export { frontHarnessKeys };
