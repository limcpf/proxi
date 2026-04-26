import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { FrontBaselineSnapshot } from "../model";

interface FrontHarnessOverviewProps {
  baseline: FrontBaselineSnapshot;
  onStartPlan: () => void;
}

export function FrontHarnessOverview({
  baseline,
  onStartPlan,
}: FrontHarnessOverviewProps) {
  return (
    <section className="surface-panel flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="kicker">stack baseline</span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="section-heading">채택 스택</h2>
            <p className="muted-copy">{baseline.scopeNote}</p>
          </div>
          <Button onClick={onStartPlan} size="lg">
            초기 기준 점검 시작
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {baseline.adoptedStack.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[color:var(--app-border)] bg-white px-4 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--app-text-muted)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--app-text)]">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="surface-panel-soft flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge tone="success">현재 기준</Badge>
          <p className="text-sm font-medium">
            보류 항목은 문서로만 고정하고 코드에는 넣지 않는다.
          </p>
        </div>
        <div className="list-grid">
          {baseline.deferredItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2
                className="mt-1 size-4 text-[color:var(--app-success)]"
                aria-hidden="true"
              />
              <p className="muted-copy">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
