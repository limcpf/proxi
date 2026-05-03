import type { EchoAuthorType, PersistedEchoStatus } from "@proxi/shared";

export interface EchoEntity {
  id: string;
  body: string;
  status: PersistedEchoStatus;
  authorActorId: string;
  authorType: EchoAuthorType;
  authorDisplayName: string;
  parentEchoId?: string;
  rootEchoId?: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedByActorId?: string;
}

export interface EchoAttachmentEntity {
  id: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  relativePath: string;
  createdAt: Date;
}

export interface EchoWithReplyCount extends EchoEntity {
  replyCount: number;
  attachments: EchoAttachmentEntity[];
}
