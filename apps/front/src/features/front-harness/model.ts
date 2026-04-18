import { z } from "zod";

export type FrontHarnessView = "overview" | "plan";

const frontHarnessViewSchema = z.enum(["overview", "plan"]);

export function parseFrontHarnessSearch(
  search: Record<string, unknown>,
): { view: FrontHarnessView } {
  return {
    view: frontHarnessViewSchema.catch("overview").parse(search.view),
  };
}

export const frontPlanDraftSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(10, "화면 목적은 10자 이상으로 적어주세요."),
  primaryAction: z
    .string()
    .trim()
    .min(2, "primary action 을 적어주세요."),
  urlState: z
    .string()
    .trim()
    .min(2, "URL 로 올릴 상태를 적어주세요."),
  apiBoundary: z
    .string()
    .trim()
    .min(2, "query / mutation 경계를 적어주세요."),
  notes: z
    .string()
    .trim()
    .max(240, "메모는 240자 이하로 적어주세요."),
});

export type FrontPlanDraftInput = z.infer<typeof frontPlanDraftSchema>;

export interface FrontStackItem {
  label: string;
  value: string;
}

export interface FrontStateOwnership {
  label: string;
  owner: string;
  rule: string;
}

export interface FrontPlanDraftSummary {
  goal: string;
  primaryAction: string;
  urlState: string;
  apiBoundary: string;
  notes: string;
  updatedAt: string;
}

export interface FrontBaselineSnapshot {
  scopeNote: string;
  adoptedStack: FrontStackItem[];
  deferredItems: string[];
  stateOwnership: FrontStateOwnership[];
  lastSavedDraft: FrontPlanDraftSummary | null;
}
