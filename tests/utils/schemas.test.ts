import { describe, it, expect } from 'vitest';
import {
  hostIdSchema,
  optionalHostIdSchema,
  dateRangeSchema,
  paginationSchema,
  deviceTypeSchema,
  queryIndicatorSchema,
} from '../../src/utils/schemas.js';

describe('hostIdSchema', () => {
  it('accepts valid host ID strings', () => {
    expect(hostIdSchema.parse('https:example.com:443')).toBe('https:example.com:443');
    expect(hostIdSchema.parse('http:my-site.ru:80')).toBe('http:my-site.ru:80');
  });

  it('rejects non-string values', () => {
    expect(() => hostIdSchema.parse(123)).toThrow();
    expect(() => hostIdSchema.parse(undefined)).toThrow();
    expect(() => hostIdSchema.parse(null)).toThrow();
  });
});

describe('optionalHostIdSchema', () => {
  it('accepts a string', () => {
    expect(optionalHostIdSchema.parse('https:example.com:443')).toBe('https:example.com:443');
  });

  it('accepts undefined', () => {
    expect(optionalHostIdSchema.parse(undefined)).toBeUndefined();
  });
});

describe('dateRangeSchema', () => {
  it('validates correct date formats', () => {
    const result = dateRangeSchema.parse({
      date_from: '2024-01-15',
      date_to: '2024-02-15',
    });
    expect(result.date_from).toBe('2024-01-15');
    expect(result.date_to).toBe('2024-02-15');
  });

  it('allows both fields to be omitted', () => {
    const result = dateRangeSchema.parse({});
    expect(result.date_from).toBeUndefined();
    expect(result.date_to).toBeUndefined();
  });

  it('allows partial date range (only date_from)', () => {
    const result = dateRangeSchema.parse({ date_from: '2024-01-01' });
    expect(result.date_from).toBe('2024-01-01');
    expect(result.date_to).toBeUndefined();
  });

  it('rejects invalid date formats', () => {
    expect(() => dateRangeSchema.parse({ date_from: '2024/01/15' })).toThrow();
    expect(() => dateRangeSchema.parse({ date_from: '15-01-2024' })).toThrow();
    expect(() => dateRangeSchema.parse({ date_from: 'not-a-date' })).toThrow();
    expect(() => dateRangeSchema.parse({ date_to: '2024-1-5' })).toThrow();
  });
});

describe('paginationSchema', () => {
  it('applies default values when fields are omitted', () => {
    const result = paginationSchema.parse({});
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(100);
  });

  it('accepts valid pagination values', () => {
    const result = paginationSchema.parse({ offset: 10, limit: 50 });
    expect(result.offset).toBe(10);
    expect(result.limit).toBe(50);
  });

  it('rejects negative offset', () => {
    expect(() => paginationSchema.parse({ offset: -1 })).toThrow();
  });

  it('rejects limit below 1', () => {
    expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
  });

  it('rejects limit above 500', () => {
    expect(() => paginationSchema.parse({ limit: 501 })).toThrow();
  });

  it('rejects non-integer values', () => {
    expect(() => paginationSchema.parse({ offset: 1.5 })).toThrow();
    expect(() => paginationSchema.parse({ limit: 10.5 })).toThrow();
  });
});

describe('deviceTypeSchema', () => {
  it('accepts all valid enum values', () => {
    const values = ['ALL', 'DESKTOP', 'MOBILE_AND_TABLET', 'MOBILE', 'TABLET'] as const;
    for (const value of values) {
      expect(deviceTypeSchema.parse(value)).toBe(value);
    }
  });

  it('defaults to ALL when undefined', () => {
    expect(deviceTypeSchema.parse(undefined)).toBe('ALL');
  });

  it('rejects invalid values', () => {
    expect(() => deviceTypeSchema.parse('INVALID')).toThrow();
    expect(() => deviceTypeSchema.parse('desktop')).toThrow();
  });
});

describe('queryIndicatorSchema', () => {
  it('accepts valid indicators', () => {
    const values = ['TOTAL_SHOWS', 'TOTAL_CLICKS', 'AVG_SHOW_POSITION', 'AVG_CLICK_POSITION'] as const;
    for (const value of values) {
      expect(queryIndicatorSchema.parse(value)).toBe(value);
    }
  });

  it('rejects invalid indicators', () => {
    expect(() => queryIndicatorSchema.parse('INVALID')).toThrow();
    expect(() => queryIndicatorSchema.parse(undefined)).toThrow();
  });
});
