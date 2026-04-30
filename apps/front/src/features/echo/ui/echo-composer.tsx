import { zodResolver } from "@hookform/resolvers/zod";
import { createEchoRequestSchema } from "@proxi/shared";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/cn";
import { clearDraft, readDraft, writeDraft } from "../lib/draft-storage";

type EchoComposerMode = "create" | "reply" | "edit";

interface EchoComposerProps {
  draftKey: string;
  disabled?: boolean;
  initialBody?: string;
  mode: EchoComposerMode;
  onCancel?: () => void;
  onSubmit: (body: string, files: File[]) => Promise<unknown>;
}

interface EchoComposerFormValues {
  body: string;
}

const echoComposerSchema = createEchoRequestSchema.pick({
  body: true,
});

const modeLabels: Record<
  EchoComposerMode,
  {
    button: string;
    label: string;
    placeholder: string;
  }
> = {
  create: {
    button: "Echo 남기기",
    label: "새 Echo 본문",
    placeholder: "지금 떠오른 생각을 Echo 로 남겨보세요.",
  },
  edit: {
    button: "수정 저장",
    label: "Echo 수정 본문",
    placeholder: "Echo 본문을 다듬어 주세요.",
  },
  reply: {
    button: "댓글 남기기",
    label: "댓글 본문",
    placeholder: "이 Echo 에 이어지는 메아리를 남겨보세요.",
  },
};

export function EchoComposer({
  disabled = false,
  draftKey,
  initialBody,
  mode,
  onCancel,
  onSubmit,
}: EchoComposerProps) {
  const savedDraft = readDraft(draftKey);
  const form = useForm<EchoComposerFormValues>({
    resolver: zodResolver(echoComposerSchema),
    defaultValues: {
      body: savedDraft || initialBody || "",
    },
  });
  const labels = modeLabels[mode];
  const [files, setFiles] = useState<File[]>([]);
  const isSubmitting = form.formState.isSubmitting;
  const body = form.watch("body");
  const bodyFieldId = useId();
  const fileFieldId = useId();

  useEffect(() => {
    form.reset({
      body: readDraft(draftKey) || initialBody || "",
    });
  }, [draftKey, form, initialBody]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      writeDraft(draftKey, value.body ?? "");
    });

    return () => subscription.unsubscribe();
  }, [draftKey, form]);

  useEffect(() => {
    if (body.trim().length === 0) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [body]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values.body, files);
    clearDraft(draftKey);
    setFiles([]);
    form.reset({ body: "" });
  });

  return (
    <form className="echo-composer field-grid" onSubmit={handleSubmit}>
      <label className="composer-field grid gap-2" htmlFor={bodyFieldId}>
        <span className="field-label">{labels.label}</span>
        <Textarea
          aria-invalid={form.formState.errors.body !== undefined}
          className={cn(mode === "create" ? "min-h-20 py-2.5" : "min-h-24")}
          disabled={disabled || isSubmitting}
          id={bodyFieldId}
          placeholder={labels.placeholder}
          {...form.register("body")}
        />
      </label>
      {form.formState.errors.body ? (
        <p className="caption-copy text-[var(--echo-danger)]">
          {form.formState.errors.body.message}
        </p>
      ) : null}
      {mode === "edit" ? null : (
        <label className="composer-field grid gap-2" htmlFor={fileFieldId}>
          <span className="field-label">첨부 파일</span>
          <input
            className={cn(
              "ui-input w-full text-sm",
              mode === "create" ? "composer-file-input px-3" : "px-4",
            )}
            disabled={disabled || isSubmitting}
            id={fileFieldId}
            multiple
            onChange={(event) =>
              setFiles(Array.from(event.currentTarget.files ?? []))
            }
            type="file"
          />
          {files.length > 0 ? (
            <span className="caption-copy">
              {files.map((file) => file.name).join(", ")}
            </span>
          ) : null}
        </label>
      )}
      <div className="composer-actions action-strip">
        <Button disabled={disabled || isSubmitting} type="submit">
          {isSubmitting
            ? "저장 중이에요. 잠깐만 기다려 주세요."
            : labels.button}
        </Button>
        {onCancel ? (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="ghost"
          >
            취소
          </Button>
        ) : null}
      </div>
    </form>
  );
}
