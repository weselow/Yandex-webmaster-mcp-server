import { describe, it, expect } from 'vitest';
import {
  YandexWebmasterError,
  AuthError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ConflictError,
  ServerError,
  createApiError,
} from '../../src/client/errors.js';

describe('Error classes', () => {
  it('YandexWebmasterError has correct properties', () => {
    const err = new YandexWebmasterError('test', 418, 'CODE', { extra: true });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('test');
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('CODE');
    expect(err.details).toEqual({ extra: true });
    expect(err.name).toBe('YandexWebmasterError');
  });

  it('AuthError extends YandexWebmasterError', () => {
    const err = new AuthError('unauthorized', 401, 'AUTH_ERR');
    expect(err).toBeInstanceOf(YandexWebmasterError);
    expect(err.name).toBe('AuthError');
    expect(err.statusCode).toBe(401);
  });

  it('NotFoundError defaults to 404', () => {
    const err = new NotFoundError('not found', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe('NotFoundError');
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe('ValidationError');
  });

  it('RateLimitError defaults to 429', () => {
    const err = new RateLimitError('slow down');
    expect(err.statusCode).toBe(429);
    expect(err.name).toBe('RateLimitError');
  });

  it('ConflictError defaults to 409', () => {
    const err = new ConflictError('conflict');
    expect(err.statusCode).toBe(409);
    expect(err.name).toBe('ConflictError');
  });

  it('ServerError preserves status code', () => {
    const err = new ServerError('internal', 502);
    expect(err.statusCode).toBe(502);
    expect(err.name).toBe('ServerError');
  });
});

describe('createApiError', () => {
  function mockResponse(status: number): Response {
    return { status, ok: false } as Response;
  }

  it('maps 400 to ValidationError', () => {
    const err = createApiError(
      mockResponse(400),
      { error_code: 'INVALID_PARAM', error_message: 'Bad parameter' },
    );
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('INVALID_PARAM');
    expect(err.message).toBe('Bad parameter');
  });

  it('maps 401 to AuthError', () => {
    const err = createApiError(
      mockResponse(401),
      { error_code: 'UNAUTHORIZED', error_message: 'Invalid token' },
    );
    expect(err).toBeInstanceOf(AuthError);
    expect(err.statusCode).toBe(401);
  });

  it('maps 403 to AuthError', () => {
    const err = createApiError(
      mockResponse(403),
      { error_message: 'Forbidden' },
    );
    expect(err).toBeInstanceOf(AuthError);
    expect(err.statusCode).toBe(403);
  });

  it('maps 404 to NotFoundError', () => {
    const err = createApiError(
      mockResponse(404),
      { error_message: 'Not found' },
    );
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.statusCode).toBe(404);
  });

  it('maps 409 to ConflictError', () => {
    const err = createApiError(
      mockResponse(409),
      { error_message: 'Conflict' },
    );
    expect(err).toBeInstanceOf(ConflictError);
    expect(err.statusCode).toBe(409);
  });

  it('maps 429 to RateLimitError', () => {
    const err = createApiError(
      mockResponse(429),
      { error_message: 'Too many requests' },
    );
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.statusCode).toBe(429);
  });

  it('maps 500 to ServerError', () => {
    const err = createApiError(
      mockResponse(500),
      { error_message: 'Internal error' },
    );
    expect(err).toBeInstanceOf(ServerError);
    expect(err.statusCode).toBe(500);
  });

  it('maps 502 to ServerError', () => {
    const err = createApiError(
      mockResponse(502),
      { error_message: 'Bad gateway' },
    );
    expect(err).toBeInstanceOf(ServerError);
    expect(err.statusCode).toBe(502);
  });

  it('maps unknown status to base YandexWebmasterError', () => {
    const err = createApiError(
      mockResponse(418),
      { error_message: 'Teapot' },
    );
    expect(err).toBeInstanceOf(YandexWebmasterError);
    expect(err).not.toBeInstanceOf(AuthError);
    expect(err).not.toBeInstanceOf(ServerError);
    expect(err.statusCode).toBe(418);
  });

  it('handles missing error body gracefully', () => {
    const err = createApiError(mockResponse(500), null);
    expect(err).toBeInstanceOf(ServerError);
    expect(err.message).toBe('Unknown API error');
  });

  it('handles non-object body gracefully', () => {
    const err = createApiError(mockResponse(500), 'plain text');
    expect(err).toBeInstanceOf(ServerError);
    expect(err.message).toBe('Unknown API error');
  });
});
