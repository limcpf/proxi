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
});

const echoBodySchema = z.string().trim().min(1, "Echo 본문을 입력해 주세요.");

export const createEchoRequestSchema = z.object({
  body: echoBodySchema,
  parentEchoId: echoIdSchema.optional(),
  mentionedAgentIds: z.array(agentIdSchema).default([]),
  referencedEchoIds: z.array(echoIdSchema).default([]),
});

export const updateEchoRequestSchema = z.object({
  body: echoBodySchema,
  mentionedAgentIds: z.array(agentIdSchema).default([]),
  referencedEchoIds: z.array(echoIdSchema).default([]),
});

export const echoAuthorSchema = z.object({
  id: actorIdSchema,
  type: echoAuthorTypeSchema,
  displayName: z.string().trim().min(1).max(80),
});

const echoSummaryShape = {
  id: echoIdSchema,
  body: z.string(),
  status: echoStatusSchema,
  author: echoAuthorSchema,
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
  cursor: z.string().trim().min(1).optional(),
  status: persistedEchoStatusSchema.default("published"),
});

export const listEchoesResponseSchema = z.object({
  items: z.array(echoSummarySchema),
  nextCursor: z.string().optional(),
});
