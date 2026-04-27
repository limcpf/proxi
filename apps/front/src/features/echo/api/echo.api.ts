import {
  type CreateEchoRequest,
  createEchoRequestSchema,
  type EchoDetail,
  echoDetailSchema,
  type ListEchoesRequest,
  type ListEchoesResponse,
  listEchoesResponseSchema,
  type UpdateEchoRequest,
  updateEchoRequestSchema,
} from "@proxi/shared";

const apiBaseUrl = import.meta.env.VITE_PROXI_API_BASE_URL ?? "";

export class EchoApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
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

  search.set("status", request.status ?? "published");

  const response = await requestJson(
    `/echoes${search.size > 0 ? `?${search.toString()}` : ""}`,
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

    throw new EchoApiError(error.code, error.message);
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
    };
  }

  return {
    code: "echo_api_error",
    message: "메아리가 길을 잃었어요. 잠시 뒤 다시 불러와 주세요.",
  };
}
