import { startTransition, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  frontBaselineQueryOptions,
  frontHarnessKeys,
  saveFrontPlanDraft,
} from "../api/front-harness.api";
import {
  emptyFrontPlanDraft,
  frontPlanDraftSchema,
  type FrontPlanDraftInput,
} from "../model";

interface FrontHarnessPlanFormProps {
  draft: FrontPlanDraftInput;
  onComplete: () => void;
  onDraftChange: (draft: FrontPlanDraftInput) => void;
}

export function FrontHarnessPlanForm({
  draft,
  onComplete,
  onDraftChange,
}: FrontHarnessPlanFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(() => draft.notes.length > 0);
  const queryClient = useQueryClient();
  const form = useForm<FrontPlanDraftInput>({
    defaultValues: draft,
    resolver: zodResolver(frontPlanDraftSchema),
  });

  const mutation = useMutation({
    mutationFn: saveFrontPlanDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: frontHarnessKeys.baseline(),
      });
      await queryClient.ensureQueryData(frontBaselineQueryOptions());
      form.reset(emptyFrontPlanDraft);
      onDraftChange(emptyFrontPlanDraft);
      setShowAdvanced(false);
      startTransition(() => {
        onComplete();
      });
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      onDraftChange({
        ...emptyFrontPlanDraft,
        ...values,
        notes: showAdvanced ? values.notes ?? "" : "",
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [form, onDraftChange, showAdvanced]);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const handleAdvancedToggle = () => {
    if (showAdvanced) {
      form.setValue("notes", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
      form.clearErrors("notes");
      setShowAdvanced(false);
      return;
    }

    setShowAdvanced(true);
  };

  const handleValidSubmit = (values: FrontPlanDraftInput) => {
    mutation.mutate({
      ...emptyFrontPlanDraft,
      ...values,
      notes: showAdvanced ? values.notes ?? "" : "",
    });
  };

  return (
    <section className="surface-panel flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="kicker">planning capture</span>
        <div className="space-y-2">
          <h2 className="section-heading">새 화면을 만들기 전 체크</h2>
          <p className="muted-copy">
            중심 목적, primary action, URL 상태와 API 경계를 먼저 적어서 기준을
            고정합니다.
          </p>
        </div>
      </div>

      <form className="field-grid" onSubmit={handleSubmit(handleValidSubmit)}>
        <label className="field-grid gap-2" htmlFor="goal">
          <span className="text-sm font-medium">화면 목적</span>
          <Input
            id="goal"
            placeholder="예: 연결 상태를 한 화면에서 점검하고 기본 설정을 저장한다."
            {...register("goal")}
          />
          {errors.goal ? (
            <span className="text-sm text-[color:var(--app-danger)]">
              {errors.goal.message}
            </span>
          ) : null}
        </label>

        <label className="field-grid gap-2" htmlFor="primaryAction">
          <span className="text-sm font-medium">primary action</span>
          <Input
            id="primaryAction"
            placeholder="예: 설정 저장"
            {...register("primaryAction")}
          />
          {errors.primaryAction ? (
            <span className="text-sm text-[color:var(--app-danger)]">
              {errors.primaryAction.message}
            </span>
          ) : null}
        </label>

        <label className="field-grid gap-2" htmlFor="urlState">
          <span className="text-sm font-medium">URL 로 올릴 상태</span>
          <Input
            id="urlState"
            placeholder="예: 탭, 필터, 페이지네이션"
            {...register("urlState")}
          />
          {errors.urlState ? (
            <span className="text-sm text-[color:var(--app-danger)]">
              {errors.urlState.message}
            </span>
          ) : null}
        </label>

        <label className="field-grid gap-2" htmlFor="apiBoundary">
          <span className="text-sm font-medium">query / mutation 경계</span>
          <Input
            id="apiBoundary"
            placeholder="예: 목록 조회 query, 저장 mutation"
            {...register("apiBoundary")}
          />
          {errors.apiBoundary ? (
            <span className="text-sm text-[color:var(--app-danger)]">
              {errors.apiBoundary.message}
            </span>
          ) : null}
        </label>

        <div className="surface-panel-soft flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Info className="mt-1 size-4 text-[color:var(--app-accent)]" aria-hidden="true" />
              <p className="muted-copy">
                고급 메모는 자주 바뀌는 예외나 보류 사유를 적는 용도로만 사용합니다.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleAdvancedToggle}
            >
              {showAdvanced ? "메모 접기" : "고급 메모 열기"}
            </Button>
          </div>

          {showAdvanced ? (
            <label className="field-grid gap-2" htmlFor="notes">
              <span className="text-sm font-medium">보류 메모</span>
              <Textarea
                id="notes"
                placeholder="예: Storybook 은 실제 재사용 패턴이 늘어나면 도입 검토"
                {...register("notes")}
              />
              {errors.notes ? (
                <span className="text-sm text-[color:var(--app-danger)]">
                  {errors.notes.message}
                </span>
              ) : null}
            </label>
          ) : null}
        </div>

        <div className="action-strip pt-2">
          <Button disabled={mutation.isPending} size="lg" type="submit">
            <Sparkles className="size-4" aria-hidden="true" />
            {mutation.isPending ? "기준 저장 중" : "초기 기준 저장"}
          </Button>
          <Button type="button" variant="secondary" onClick={onComplete}>
            개요 보기
          </Button>
        </div>

        {mutation.isError ? (
          <p className="text-sm text-[color:var(--app-danger)]">
            저장에 실패했습니다. 다시 시도해주세요.
          </p>
        ) : null}
      </form>
    </section>
  );
}
