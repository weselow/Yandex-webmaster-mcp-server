/**
 * Error hierarchy for Yandex Webmaster API responses.
 */

export class YandexWebmasterError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'YandexWebmasterError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class AuthError extends YandexWebmasterError {
  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message, statusCode, code, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends YandexWebmasterError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 404, code, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends YandexWebmasterError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 400, code, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends YandexWebmasterError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 429, code, details);
    this.name = 'RateLimitError';
  }
}

export class ConflictError extends YandexWebmasterError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, 409, code, details);
    this.name = 'ConflictError';
  }
}

export class ServerError extends YandexWebmasterError {
  constructor(message: string, statusCode: number, code?: string, details?: unknown) {
    super(message, statusCode, code, details);
    this.name = 'ServerError';
  }
}

interface ApiErrorBody {
  error_code?: string;
  error_message?: string;
}

function extractErrorInfo(body: unknown): { code?: string; message: string } {
  if (body && typeof body === 'object') {
    const b = body as ApiErrorBody;
    return {
      code: b.error_code,
      message: b.error_message || 'Unknown API error',
    };
  }
  return { message: 'Unknown API error' };
}

/**
 * Factory function: maps HTTP status codes to the appropriate error class.
 */
export function createApiError(response: Response, body: unknown): YandexWebmasterError {
  const { code, message } = extractErrorInfo(body);
  const status = response.status;

  switch (status) {
    case 400:
      return new ValidationError(message, code, body);
    case 401:
    case 403:
      return new AuthError(message, status, code, body);
    case 404:
      return new NotFoundError(message, code, body);
    case 409:
      return new ConflictError(message, code, body);
    case 429:
      return new RateLimitError(message, code, body);
    default:
      if (status >= 500) {
        return new ServerError(message, status, code, body);
      }
      return new YandexWebmasterError(message, status, code, body);
  }
}
