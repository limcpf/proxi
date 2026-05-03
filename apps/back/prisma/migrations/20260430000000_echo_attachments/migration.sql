CREATE TABLE "Attachment" (
  "id" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksum" TEXT NOT NULL,
  "relativePath" TEXT NOT NULL,
  "echoId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Attachment_echoId_idx" ON "Attachment"("echoId");

CREATE INDEX "Attachment_checksum_idx" ON "Attachment"("checksum");

ALTER TABLE "Attachment"
  ADD CONSTRAINT "Attachment_echoId_fkey"
  FOREIGN KEY ("echoId")
  REFERENCES "Echo"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
