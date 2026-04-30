import type { z } from "zod";
import type {
  actorIdSchema,
  agentIdSchema,
  attachmentIdSchema,
  createEchoRequestSchema,
  echoAttachmentSchema,
  echoAuthorSchema,
  echoAuthorTypeSchema,
  echoDetailSchema,
  echoIdSchema,
  echoStatusSchema,
  echoSummarySchema,
  echoValidationErrorSchema,
  listEchoesRequestSchema,
  listEchoesResponseSchema,
  persistedEchoStatusSchema,
  updateEchoRequestSchema,
  uploadAttachmentRequestSchema,
} from "../contracts/index";

export type EchoId = z.infer<typeof echoIdSchema>;

export type ActorId = z.infer<typeof actorIdSchema>;

export type AgentId = z.infer<typeof agentIdSchema>;

export type AttachmentId = z.infer<typeof attachmentIdSchema>;

export type EchoStatus = z.infer<typeof echoStatusSchema>;

export type PersistedEchoStatus = z.infer<typeof persistedEchoStatusSchema>;

export type EchoAuthorType = z.infer<typeof echoAuthorTypeSchema>;

export type EchoValidationError = z.infer<typeof echoValidationErrorSchema>;

export type EchoAuthor = z.infer<typeof echoAuthorSchema>;

export type EchoAttachment = z.infer<typeof echoAttachmentSchema>;

export type CreateEchoRequest = z.input<typeof createEchoRequestSchema>;

export type UpdateEchoRequest = z.input<typeof updateEchoRequestSchema>;

export type UploadAttachmentRequest = z.input<
  typeof uploadAttachmentRequestSchema
>;

export type EchoSummary = z.infer<typeof echoSummarySchema>;

export type EchoDetail = z.infer<typeof echoDetailSchema>;

export type ListEchoesRequest = z.input<typeof listEchoesRequestSchema>;

export type ListEchoesResponse = z.infer<typeof listEchoesResponseSchema>;
