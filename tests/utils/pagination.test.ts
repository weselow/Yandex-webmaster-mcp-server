import { describe, it, expect } from 'vitest';
import {
  buildPaginationParams,
  buildDateRangeParams,
  mergeParams,
  buildQueryString,
} from '../../src/utils/pagination.js';

describe('buildPaginationParams', () => {
  it('returns empty params when called without arguments', () => {
    const params = buildPaginationParams();
    expect(params.toString()).toBe('');
  });

  it('returns empty params for empty object', () => {
    const params = buildPaginationParams({});
    expect(params.toString()).toBe('');
  });

  it('sets offset when greater than zero', () => {
    const params = buildPaginationParams({ offset: 10 });
    expect(params.get('offset')).toBe('10');
  });

  it('omits offset when zero', () => {
    const params = buildPaginationParams({ offset: 0 });
    expect(params.has('offset')).toBe(false);
  });

  it('sets limit when provided', () => {
    const params = buildPaginationParams({ limit: 50 });
    expect(params.get('limit')).toBe('50');
  });

  it('sets both offset and limit', () => {
    const params = buildPaginationParams({ offset: 20, limit: 50 });
    expect(params.get('offset')).toBe('20');
    expect(params.get('limit')).toBe('50');
  });
});

describe('buildDateRangeParams', () => {
  it('returns empty params when called without arguments', () => {
    const params = buildDateRangeParams();
    expect(params.toString()).toBe('');
  });

  it('returns empty params for empty object', () => {
    const params = buildDateRangeParams({});
    expect(params.toString()).toBe('');
  });

  it('sets date_from when provided', () => {
    const params = buildDateRangeParams({ date_from: '2024-01-01' });
    expect(params.get('date_from')).toBe('2024-01-01');
    expect(params.has('date_to')).toBe(false);
  });

  it('sets date_to when provided', () => {
    const params = buildDateRangeParams({ date_to: '2024-12-31' });
    expect(params.get('date_to')).toBe('2024-12-31');
    expect(params.has('date_from')).toBe(false);
  });

  it('sets both dates when provided', () => {
    const params = buildDateRangeParams({
      date_from: '2024-01-01',
      date_to: '2024-12-31',
    });
    expect(params.get('date_from')).toBe('2024-01-01');
    expect(params.get('date_to')).toBe('2024-12-31');
  });
});

describe('mergeParams', () => {
  it('returns empty params when called with no arguments', () => {
    const merged = mergeParams();
    expect(merged.toString()).toBe('');
  });

  it('merges single URLSearchParams', () => {
    const p1 = new URLSearchParams({ a: '1', b: '2' });
    const merged = mergeParams(p1);
    expect(merged.get('a')).toBe('1');
    expect(merged.get('b')).toBe('2');
  });

  it('merges multiple URLSearchParams', () => {
    const p1 = new URLSearchParams({ a: '1' });
    const p2 = new URLSearchParams({ b: '2' });
    const merged = mergeParams(p1, p2);
    expect(merged.get('a')).toBe('1');
    expect(merged.get('b')).toBe('2');
  });

  it('later params override earlier ones for same key', () => {
    const p1 = new URLSearchParams({ key: 'old' });
    const p2 = new URLSearchParams({ key: 'new' });
    const merged = mergeParams(p1, p2);
    expect(merged.get('key')).toBe('new');
  });
});

describe('buildQueryString', () => {
  it('returns empty string when no params provided', () => {
    expect(buildQueryString()).toBe('');
  });

  it('returns empty string for empty param objects', () => {
    expect(buildQueryString({}, {})).toBe('');
  });

  it('builds query string with pagination only', () => {
    const qs = buildQueryString({ offset: 10, limit: 50 });
    expect(qs).toContain('?');
    expect(qs).toContain('offset=10');
    expect(qs).toContain('limit=50');
  });

  it('builds query string with date range only', () => {
    const qs = buildQueryString(undefined, {
      date_from: '2024-01-01',
      date_to: '2024-12-31',
    });
    expect(qs).toContain('?');
    expect(qs).toContain('date_from=2024-01-01');
    expect(qs).toContain('date_to=2024-12-31');
  });

  it('combines pagination and date range', () => {
    const qs = buildQueryString(
      { offset: 5, limit: 25 },
      { date_from: '2024-06-01' },
    );
    expect(qs).toContain('offset=5');
    expect(qs).toContain('limit=25');
    expect(qs).toContain('date_from=2024-06-01');
  });
});
