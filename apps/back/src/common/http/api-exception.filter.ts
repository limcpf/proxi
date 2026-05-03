import { randomUUID } from "node:crypto";
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
}

interface HttpRequest {
  header(name: string): string | undefined;
}

interface HttpResponse {
  status(status: number): {
    json(payload: unknown): void;
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<HttpRequest>();
    const response = context.getResponse<HttpResponse>();
    const requestId = getRequestId(request) ?? randomUUID();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = normalizeException(exception, status, requestId);

    if (status >= 500) {
      console.error("api.unexpected_error", {
        requestId,
        error:
          exception instanceof Error ? exception.message : String(exception),
      });
    }

    response.status(status).json(payload);
  }
}

function getRequestId(request: HttpRequest) {
  const rawRequestId = request.header("x-request-id");

  return rawRequestId?.trim() || undefined;
}

function normalizeException(
  exception: unknown,
  status: number,
  requestId: string,
): ApiErrorPayload {
  if (exception instanceof HttpException) {
    return {
      ...normalizeHttpExceptionResponse(exception.getResponse(), status),
      requestId,
    };
  }

  return {
    code: "internal_server_error",
    message: "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    requestId,
  };
}

function normalizeHttpExceptionResponse(
  response: string | object,
  status: number,
): Omit<ApiErrorPayload, "requestId"> {
  if (typeof response === "string") {
    return {
      code: codeFromStatus(status),
      message: response,
    };
  }

  const record = response as Record<string, unknown>;
  const code =
    typeof record.code === "string" && record.code.trim().length > 0
      ? record.code
      : codeFromStatus(status);
  const message =
    typeof record.message === "string" && record.message.trim().length > 0
      ? record.message
      : messageFromStatus(status);

  return {
    code,
    message,
    details: record.details,
  };
}

function codeFromStatus(status: number) {
  if (status === HttpStatus.BAD_REQUEST) {
    return "bad_request";
  }

  if (status === HttpStatus.FORBIDDEN) {
    return "forbidden";
  }

  if (status === HttpStatus.NOT_FOUND) {
    return "not_found";
  }

  if (status === HttpStatus.CONFLICT) {
    return "conflict";
  }

  return "http_error";
}

function messageFromStatus(status: number) {
  if (status === HttpStatus.NOT_FOUND) {
    return "찾는 리소스가 없어요.";
  }

  if (status >= 500) {
    return "요청을 처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
  }

  return "요청을 확인해 주세요.";
}
