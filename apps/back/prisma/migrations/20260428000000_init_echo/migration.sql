CREATE TYPE "EchoStatus" AS ENUM ('published', 'archived');

CREATE TYPE "EchoAuthorType" AS ENUM ('owner', 'agent');

CREATE TABLE "Echo" (
  "id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "EchoStatus" NOT NULL DEFAULT 'published',
  "authorActorId" TEXT NOT NULL,
  "authorType" "EchoAuthorType" NOT NULL DEFAULT 'owner',
  "authorDisplayName" TEXT NOT NULL,
  "parentEchoId" TEXT,
  "rootEchoId" TEXT,
  "depth" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "deletedByActorId" TEXT,
  CONSTRAINT "Echo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EchoMention" (
  "id" TEXT NOT NULL,
  "echoId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "rangeStart" INTEGER NOT NULL,
  "rangeEnd" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EchoMention_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Echo_status_createdAt_idx" ON "Echo"("status", "createdAt");

CREATE INDEX "Echo_parentEchoId_createdAt_idx" ON "Echo"("parentEchoId", "createdAt");

CREATE INDEX "Echo_rootEchoId_createdAt_idx" ON "Echo"("rootEchoId", "createdAt");

CREATE INDEX "EchoMention_echoId_idx" ON "EchoMention"("echoId");

CREATE INDEX "EchoMention_agentId_idx" ON "EchoMention"("agentId");

ALTER TABLE "Echo"
  ADD CONSTRAINT "Echo_parentEchoId_fkey"
  FOREIGN KEY ("parentEchoId")
  REFERENCES "Echo"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "EchoMention"
  ADD CONSTRAINT "EchoMention_echoId_fkey"
  FOREIGN KEY ("echoId")
  REFERENCES "Echo"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
