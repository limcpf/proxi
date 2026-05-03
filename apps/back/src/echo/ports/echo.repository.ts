import type { PersistedEchoStatus } from "@proxi/shared";
import type { EchoEntity, EchoWithReplyCount } from "../domain/echo.entity.js";

export const ECHO_REPOSITORY = Symbol("ECHO_REPOSITORY");

export interface ListRootEchoesQuery {
  cursor?: string;
  status: PersistedEchoStatus;
  search?: string;
  limit: number;
}

export interface EchoRepository {
  countAttachableAttachments(attachmentIds: string[]): Promise<number>;
  create(
    echo: EchoEntity,
    attachmentIds?: string[],
  ): Promise<EchoWithReplyCount>;
  findById(echoId: string): Promise<EchoWithReplyCount | undefined>;
  listRootEchoes(query: ListRootEchoesQuery): Promise<EchoWithReplyCount[]>;
  listReplies(rootEchoId: string): Promise<EchoWithReplyCount[]>;
  updateBody(
    echoId: string,
    body: string,
    updatedAt: Date,
  ): Promise<EchoWithReplyCount>;
  archive(
    echoId: string,
    deletedAt: Date,
    deletedByActorId: string,
  ): Promise<EchoWithReplyCount>;
  restore(echoId: string, restoredAt: Date): Promise<EchoWithReplyCount>;
}
