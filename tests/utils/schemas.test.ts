import { describe, it, expect } from 'vitest';
import {
  optionalHostIdSchema,
  deviceTypeSchema,
  queryIndicatorSchema,
} from '../../src/utils/schemas.js';

describe('optionalHostIdSchema', () => {
  it('accepts a string', () => {
    expect(optionalHostIdSchema.parse('https:example.com:443')).toBe('https:example.com:443');
  });

  it('accepts undefined', () => {
    expect(optionalHostIdSchema.parse(undefined)).toBeUndefined();
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
