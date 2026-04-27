export class EchoApplicationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "EchoApplicationError";
  }
}

export function badRequest(code: string, message: string) {
  return new EchoApplicationError(code, message, 400);
}

export function forbidden(code: string, message: string) {
  return new EchoApplicationError(code, message, 403);
}

export function notFound(code: string, message: string) {
  return new EchoApplicationError(code, message, 404);
}

export function conflict(code: string, message: string) {
  return new EchoApplicationError(code, message, 409);
}
