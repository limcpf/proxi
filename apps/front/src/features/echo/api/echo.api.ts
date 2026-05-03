import {
  type CreateEchoRequest,
  createEchoRequestSchema,
  type EchoAttachment,
  type EchoDetail,
  echoAttachmentSchema,
  echoDetailSchema,
  type ListEchoesRequest,
  type ListEchoesResponse,
  listEchoesResponseSchema,
  type UpdateEchoRequest,
  type UploadAttachmentRequest,
  updateEchoRequestSchema,
  uploadAttachmentRequestSchema,
} from "@proxi/shared";

const apiBaseUrl = import.meta.env.VITE_PROXI_API_BASE_URL ?? "/api";

export class EchoApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "EchoApiError";
  }
}

export async function listEchoes(
  request: ListEchoesRequest,
): Promise<ListEchoesResponse> {
  const search = new URLSearchParams();

  if (request.cursor !== undefined) {
    search.set("cursor", request.cursor);
  }

  if (request.q !== undefined) {
    search.set("q", request.q);
  }

  search.set("status", request.status ?? "published");

  const response = await requestJson(
    `/echoes${search.size > 0 ? `?${search.toString()}` : ""}`,
  );

  return listEchoesResponseSchema.parse(response);
}

export async function listArchivedEchoes(
  request: Omit<ListEchoesRequest, "status">,
): Promise<ListEchoesResponse> {
  const search = new URLSearchParams();

  if (request.cursor !== undefined) {
    search.set("cursor", request.cursor);
  }

  if (request.q !== undefined) {
    search.set("q", request.q);
  }

  const response = await requestJson(
    `/echoes/archive${search.size > 0 ? `?${search.toString()}` : ""}`,
  );

  return listEchoesResponseSchema.parse(response);
}

export async function getEcho(echoId: string): Promise<EchoDetail> {
  const response = await requestJson(`/echoes/${encodeURIComponent(echoId)}`);

  return echoDetailSchema.parse(response);
}

export async function createEcho(
  request: CreateEchoRequest,
): Promise<EchoDetail> {
  const response = await requestJson("/echoes", {
    method: "POST",
    body: JSON.stringify(createEchoRequestSchema.parse(request)),
  });

  return echoDetailSchema.parse(response);
}

export async function createEchoWithFiles(input: {
  body: string;
  files: File[];
}): Promise<EchoDetail> {
  return uploadFilesWithRollback(input.files, (attachmentIds) =>
    createEcho({
      body: input.body,
      attachmentIds,
    }),
  );
}

export async function updateEcho(
  echoId: string,
  request: UpdateEchoRequest,
): Promise<EchoDetail> {
  const response = await requestJson(`/echoes/${encodeURIComponent(echoId)}`, {
    method: "PATCH",
    body: JSON.stringify(updateEchoRequestSchema.parse(request)),
  });

  return echoDetailSchema.parse(response);
}

export async function archiveEcho(echoId: string): Promise<void> {
  await requestJson(`/echoes/${encodeURIComponent(echoId)}`, {
    method: "DELETE",
  });
}

export async function restoreEcho(echoId: string): Promise<EchoDetail> {
  const response = await requestJson(
    `/echoes/${encodeURIComponent(echoId)}/restore`,
    {
      method: "POST",
    },
  );

  return echoDetailSchema.parse(response);
}

export async function createReply(
  echoId: string,
  request: CreateEchoRequest,
): Promise<EchoDetail> {
  const response = await requestJson(
    `/echoes/${encodeURIComponent(echoId)}/replies`,
    {
      method: "POST",
      body: JSON.stringify(createEchoRequestSchema.parse(request)),
    },
  );

  return echoDetailSchema.parse(response);
}

export async function createReplyWithFiles(
  echoId: string,
  input: {
    body: string;
    files: File[];
  },
): Promise<EchoDetail> {
  return uploadFilesWithRollback(input.files, (attachmentIds) =>
    createReply(echoId, {
      body: input.body,
      attachmentIds,
    }),
  );
}

export async function uploadAttachment(
  request: UploadAttachmentRequest,
): Promise<EchoAttachment> {
  const response = await requestJson("/attachments", {
    method: "POST",
    body: JSON.stringify(uploadAttachmentRequestSchema.parse(request)),
  });

  return echoAttachmentSchema.parse(response);
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await requestJson(`/attachments/${encodeURIComponent(attachmentId)}`, {
    method: "DELETE",
  });
}

export async function uploadAttachmentFile(file: File) {
  const contentBase64 = toBase64(await file.arrayBuffer());

  return uploadAttachment({
    fileName: file.name,
    mimeType: file.type as UploadAttachmentRequest["mimeType"],
    sizeBytes: file.size,
    contentBase64,
  });
}

async function uploadFilesWithRollback<TResult>(
  files: File[],
  submit: (attachmentIds: string[]) => Promise<TResult>,
) {
  const uploadResults = await Promise.allSettled(
    files.map((file) => uploadAttachmentFile(file)),
  );
  const uploadedAttachments = uploadResults.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
  const uploadFailure = uploadResults.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (uploadFailure !== undefined) {
    await cleanupUploadedAttachments(uploadedAttachments);
    throw uploadFailure.reason;
  }

  try {
    return await submit(uploadedAttachments.map((attachment) => attachment.id));
  } catch (error) {
    await cleanupUploadedAttachments(uploadedAttachments);
    throw error;
  }
}

async function cleanupUploadedAttachments(attachments: EchoAttachment[]) {
  await Promise.allSettled(
    attachments.map((attachment) => deleteAttachment(attachment.id)),
  );
}

async function requestJson(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined;
  }

  const payload = await response.json().catch(() => undefined);

  if (!response.ok) {
    const error = parseApiError(payload);

    throw new EchoApiError(error.code, error.message, error.requestId);
  }

  return payload;
}

function parseApiError(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload &&
    typeof payload.code === "string" &&
    typeof payload.message === "string"
  ) {
    return {
      code: payload.code,
      message: payload.message,
      requestId:
        "requestId" in payload && typeof payload.requestId === "string"
          ? payload.requestId
          : undefined,
    };
  }

  return {
    code: "echo_api_error",
    message: "메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.",
    requestId: undefined,
  };
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 32_768;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}
