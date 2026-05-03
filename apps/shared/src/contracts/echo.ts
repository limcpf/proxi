import { z } from "zod";

export const echoIdSchema = z
  .string()
  .trim()
  .min(1, "echo id must not be empty.")
  .max(128, "echo id must be 128 characters or fewer.")
  .regex(/^echo_[A-Za-z0-9][A-Za-z0-9_-]*$/, {
    message: "echo id must start with echo_ and contain safe id characters.",
  })
  .brand<"EchoId">();

export const actorIdSchema = z
  .string()
  .trim()
  .min(1, "actor id must not be empty.")
  .max(128, "actor id must be 128 characters or fewer.")
  .regex(/^actor_[A-Za-z0-9][A-Za-z0-9_-]*$/, {
    message: "actor id must start with actor_ and contain safe id characters.",
  })
  .brand<"ActorId">();

export const agentIdSchema = z
  .string()
  .trim()
  .min(1, "agent id must not be empty.")
  .max(128, "agent id must be 128 characters or fewer.")
  .regex(/^agent_[A-Za-z0-9][A-Za-z0-9_-]*$/, {
    message: "agent id must start with agent_ and contain safe id characters.",
  })
  .brand<"AgentId">();

export const attachmentIdSchema = z
  .string()
  .trim()
  .min(1, "attachment id must not be empty.")
  .max(128, "attachment id must be 128 characters or fewer.")
  .regex(/^attachment_[A-Za-z0-9][A-Za-z0-9_-]*$/, {
    message:
      "attachment id must start with attachment_ and contain safe id characters.",
  })
  .brand<"AttachmentId">();

export const attachmentMaxSizeBytes = 10 * 1024 * 1024;

export const allowedAttachmentMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
] as const;

export const attachmentMimeTypeSchema = z.enum(allowedAttachmentMimeTypes);

export const echoStatusSchema = z.enum(["draft", "published", "archived"]);

export const persistedEchoStatusSchema = z.enum(["published", "archived"]);

export const echoAuthorTypeSchema = z.enum(["owner", "agent"]);

export const echoValidationErrorSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "error code must not be empty.")
    .max(64, "error code must be 64 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(1, "error message must not be empty.")
    .max(240, "error message must be 240 characters or fewer."),
  details: z.unknown().optional(),
  requestId: z.string().trim().min(1).max(128).optional(),
});

const echoBodySchema = z.string().trim().min(1, "Echo 본문을 입력해 주세요.");

const attachmentIdsSchema = z.array(attachmentIdSchema).default([]);

export const createEchoRequestSchema = z.object({
  body: echoBodySchema,
  parentEchoId: echoIdSchema.optional(),
  mentionedAgentIds: z.array(agentIdSchema).default([]),
  referencedEchoIds: z.array(echoIdSchema).default([]),
  attachmentIds: attachmentIdsSchema,
});

export const updateEchoRequestSchema = z.object({
  body: echoBodySchema,
  mentionedAgentIds: z.array(agentIdSchema).default([]),
  referencedEchoIds: z.array(echoIdSchema).default([]),
});

export const uploadAttachmentRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "파일 이름을 확인해 주세요.")
    .max(240, "파일 이름은 240자 이하여야 해요."),
  mimeType: attachmentMimeTypeSchema,
  sizeBytes: z
    .number()
    .int()
    .positive("빈 파일은 업로드할 수 없어요.")
    .max(attachmentMaxSizeBytes, "10MB 이하 파일만 업로드할 수 있어요."),
  contentBase64: z
    .string()
    .trim()
    .min(1, "파일 내용이 비어 있어요.")
    .regex(/^[A-Za-z0-9+/]+={0,2}$/, "파일 내용을 base64 로 보내 주세요."),
});

export const echoAuthorSchema = z.object({
  id: actorIdSchema,
  type: echoAuthorTypeSchema,
  displayName: z.string().trim().min(1).max(80),
});

export const echoAttachmentSchema = z.object({
  id: attachmentIdSchema,
  originalFileName: z.string().trim().min(1).max(240),
  mimeType: attachmentMimeTypeSchema,
  sizeBytes: z.number().int().positive().max(attachmentMaxSizeBytes),
  checksum: z.string().trim().min(1).max(128),
  downloadUrl: z.string().trim().min(1),
  createdAt: z.string().datetime({ offset: true }),
});

const echoSummaryShape = {
  id: echoIdSchema,
  body: z.string(),
  status: echoStatusSchema,
  author: echoAuthorSchema,
  attachments: z.array(echoAttachmentSchema).default([]),
  parentEchoId: echoIdSchema.optional(),
  rootEchoId: echoIdSchema.optional(),
  replyCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: z.string().datetime({ offset: true }).optional(),
} satisfies z.ZodRawShape;

export const echoSummarySchema = z.object(echoSummaryShape);

export const echoDetailSchema = echoSummarySchema.extend({
  replies: z.array(echoSummarySchema),
});

export const listEchoesRequestSchema = z.object({
  cursor: echoIdSchema.optional(),
  status: persistedEchoStatusSchema.optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const listEchoesResponseSchema = z.object({
  items: z.array(echoSummarySchema),
  nextCursor: z.string().optional(),
});
