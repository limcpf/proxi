import { zodResolver } from "@hookform/resolvers/zod";
import { createEchoRequestSchema } from "@proxi/shared";
import { useEffect, useId, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = disabled || isSubmitting;

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.reset({ body: "" });
  });

  return (
    <form
      className={cn(
        "echo-composer field-grid",
        mode === "create" && "echo-composer-minimal",
      )}
      onSubmit={handleSubmit}
    >
      <label className="composer-field grid gap-2" htmlFor={bodyFieldId}>
        <span className={cn("field-label", mode !== "edit" && "sr-only")}>
          {labels.label}
        </span>
        <Textarea
          aria-invalid={form.formState.errors.body !== undefined}
          className={cn(mode === "edit" ? "min-h-24" : "min-h-16")}
          disabled={isDisabled}
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
        <div className="composer-attachments">
          <input
            aria-label="첨부 파일"
            className="sr-only"
            disabled={isDisabled}
            id={fileFieldId}
            multiple
            onChange={(event) =>
              setFiles(Array.from(event.currentTarget.files ?? []))
            }
            ref={fileInputRef}
            type="file"
          />
          <Button
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            type="button"
            variant="ghost"
          >
            첨부
          </Button>
          {files.length > 0 ? (
            <div className="composer-file-list">
              {files.map((file) => (
                <span
                  className="composer-file-chip"
                  key={`${file.name}-${file.lastModified}`}
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}
      <div className="composer-actions action-strip">
        <Button disabled={isDisabled} type="submit">
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
