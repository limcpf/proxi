import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, CircleSlash, Layers3 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { frontBaselineQueryOptions } from "../api/front-harness.api";
import {
  emptyFrontPlanDraft,
  type FrontHarnessView,
  type FrontPlanDraftInput,
} from "../model";
import { FrontHarnessOverview } from "./front-harness-overview";
import { FrontHarnessPlanForm } from "./front-harness-plan-form";

interface FrontHarnessPageProps {
  onViewChange: (view: FrontHarnessView) => void;
  view: FrontHarnessView;
}

export function FrontHarnessPage({
  onViewChange,
  view,
}: FrontHarnessPageProps) {
  const baselineQuery = useQuery(frontBaselineQueryOptions());
  const deferredBaseline = useDeferredValue(baselineQuery.data);
  const baseline = baselineQuery.data ?? deferredBaseline;
  const [planDraft, setPlanDraft] =
    useState<FrontPlanDraftInput>(emptyFrontPlanDraft);

  return (
    <main className="page-shell">
      <section className="hero-shell flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <span className="kicker">proxi front</span>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h1 className="hero-title">
                React SPA 를 시작점으로 두고, 프런트 기준을 화면과 문서에 같이
                고정합니다.
              </h1>
              <p className="hero-copy">
                이 하네스는 URL 상태, Query, Form, Zod, local UI state 를 어디에
                둘지 한 번에 확인하기 위한 시작점입니다.
              </p>
            </div>
            <div className="action-strip">
              <Button
                variant={view === "overview" ? "primary" : "secondary"}
                onClick={() => onViewChange("overview")}
              >
                개요
              </Button>
              <Button
                variant={view === "plan" ? "primary" : "secondary"}
                onClick={() => onViewChange("plan")}
              >
                기준 점검
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="surface-panel-soft flex items-start gap-3">
            <Layers3
              className="mt-1 size-4 text-[color:var(--app-primary)]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">상태 책임 분리</p>
              <p className="muted-copy">
                URL, Query, Form, local UI state 를 섞지 않고 나눕니다.
              </p>
            </div>
          </div>
          <div className="surface-panel-soft flex items-start gap-3">
            <ArrowRight
              className="mt-1 size-4 text-[color:var(--app-accent)]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">하나의 중심 목적</p>
              <p className="muted-copy">
                한 페이지는 한 목적과 하나의 primary action 을 기준으로
                설계합니다.
              </p>
            </div>
          </div>
          <div className="surface-panel-soft flex items-start gap-3">
            <CircleSlash
              className="mt-1 size-4 text-[color:var(--app-danger)]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">지금 하지 않는 것</p>
              <p className="muted-copy">
                `Next.js`, 루트 `shared`, 전역 상태 기본값은 지금 도입하지
                않습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {baselineQuery.isLoading && !baseline ? (
        <section className="surface-panel flex items-center gap-3">
          <Badge tone="muted">loading</Badge>
          <p className="muted-copy">기준 스냅샷을 불러오는 중입니다.</p>
        </section>
      ) : null}

      {baselineQuery.isError ? (
        <section className="surface-panel flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-1 size-4 text-[color:var(--app-danger)]"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h2 className="section-heading">
                기준 스냅샷을 불러오지 못했습니다.
              </h2>
              <p className="muted-copy">
                하네스 데이터가 준비되지 않았습니다. 다시 불러와서 상태 경계를
                확인하세요.
              </p>
            </div>
          </div>
          <div className="action-strip">
            <Button onClick={() => baselineQuery.refetch()}>
              다시 불러오기
            </Button>
            <Button
              variant="secondary"
              onClick={() => onViewChange("overview")}
            >
              개요 유지
            </Button>
          </div>
        </section>
      ) : null}

      {baseline ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {view === "overview" ? (
              <FrontHarnessOverview
                baseline={baseline}
                onStartPlan={() => onViewChange("plan")}
              />
            ) : (
              <FrontHarnessPlanForm
                draft={planDraft}
                onComplete={() => onViewChange("overview")}
                onDraftChange={setPlanDraft}
              />
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <section className="surface-panel flex flex-col gap-5">
              <div className="space-y-2">
                <span className="kicker">ownership map</span>
                <h2 className="section-heading">상태 책임</h2>
                <p className="muted-copy">
                  같은 상태를 여러 도구에 중복 보관하지 않는 것이 기본
                  원칙입니다.
                </p>
              </div>

              <div className="list-grid">
                {baseline.stateOwnership.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-2xl border border-[color:var(--app-border)] bg-white px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <Badge tone="muted">{item.owner}</Badge>
                    </div>
                    <p className="muted-copy mt-2">{item.rule}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="surface-panel flex flex-col gap-4">
              <div className="space-y-2">
                <span className="kicker">latest draft</span>
                <h2 className="section-heading">마지막 저장 결과</h2>
              </div>

              {baseline.lastSavedDraft ? (
                <div className="status-note">
                  <p className="font-medium text-[color:var(--app-text)]">
                    {baseline.lastSavedDraft.goal}
                  </p>
                  <p className="mt-2">
                    primary action: {baseline.lastSavedDraft.primaryAction}
                  </p>
                  <p>URL 상태: {baseline.lastSavedDraft.urlState}</p>
                  <p>API 경계: {baseline.lastSavedDraft.apiBoundary}</p>
                  {baseline.lastSavedDraft.notes ? (
                    <p className="mt-2 whitespace-pre-wrap">
                      메모: {baseline.lastSavedDraft.notes}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs">
                    저장 시각:{" "}
                    {new Intl.DateTimeFormat("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(baseline.lastSavedDraft.updatedAt))}
                  </p>
                </div>
              ) : (
                <div className="status-note">
                  아직 저장된 초안이 없습니다. 기준 점검 탭에서 새 화면의 목적과
                  경계를 먼저 적어보세요.
                </div>
              )}
            </section>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
