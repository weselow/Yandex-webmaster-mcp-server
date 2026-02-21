import { describe, it, expect } from 'vitest';
import {
  CHARACTER_LIMIT,
  formatAsMarkdownTable,
  formatToolResponse,
  truncateIfNeeded,
  formatDate,
  formatNumber,
} from '../../src/utils/formatting.js';

describe('CHARACTER_LIMIT', () => {
  it('is set to 25000', () => {
    expect(CHARACTER_LIMIT).toBe(25000);
  });
});

describe('formatAsMarkdownTable', () => {
  it('produces a valid markdown table', () => {
    const result = formatAsMarkdownTable(
      ['Name', 'Value'],
      [
        ['foo', '42'],
        ['bar', '99'],
      ],
    );

    expect(result).toContain('| Name | Value |');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('| foo | 42 |');
    expect(result).toContain('| bar | 99 |');
  });

  it('returns empty string for empty headers', () => {
    expect(formatAsMarkdownTable([], [])).toBe('');
  });

  it('handles single column', () => {
    const result = formatAsMarkdownTable(['Item'], [['one'], ['two']]);
    expect(result).toContain('| Item |');
    expect(result).toContain('| one |');
  });

  it('handles empty rows', () => {
    const result = formatAsMarkdownTable(['A', 'B'], []);
    expect(result).toContain('| A | B |');
    expect(result).toContain('| --- | --- |');
  });
});

describe('formatToolResponse', () => {
  it('returns both text and structured data', () => {
    const data = { count: 5, items: ['a', 'b'] };
    const result = formatToolResponse(data, (d) => `Found ${d.count} items`);

    expect(result.text).toBe('Found 5 items');
    expect(result.structured).toBe(data);
    expect(result.structured.count).toBe(5);
  });

  it('preserves original data reference', () => {
    const data = [1, 2, 3];
    const result = formatToolResponse(data, (d) => d.join(', '));

    expect(result.structured).toBe(data);
    expect(result.text).toBe('1, 2, 3');
  });
});

describe('truncateIfNeeded', () => {
  it('returns text unchanged if within limit', () => {
    const text = 'Short text';
    expect(truncateIfNeeded(text, 10, 10)).toBe(text);
  });

  it('truncates text exceeding CHARACTER_LIMIT', () => {
    const longText = 'a'.repeat(CHARACTER_LIMIT + 1000);
    const result = truncateIfNeeded(longText, 100, 50);

    expect(result.length).toBeLessThan(longText.length);
    expect(result).toContain('Truncated');
    expect(result).toContain('Showing 50 of 100 items');
  });

  it('cuts at last newline for clean truncation', () => {
    const lines = Array.from({ length: 5000 }, (_, i) => `Line ${i}`).join('\n');
    const result = truncateIfNeeded(lines, 5000, 2000);

    expect(result).toContain('Truncated');
    // Should end with a pagination note, not a partial line
    expect(result).toContain('Use pagination to see more');
  });

  it('returns text exactly at limit unchanged', () => {
    const text = 'x'.repeat(CHARACTER_LIMIT);
    expect(truncateIfNeeded(text, 1, 1)).toBe(text);
  });
});

describe('formatDate', () => {
  it('formats ISO date string to human-readable', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('returns original string for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousand separators', () => {
    const result = formatNumber(1234567);
    expect(result).toBe('1,234,567');
  });

  it('handles small numbers without separators', () => {
    expect(formatNumber(42)).toBe('42');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles decimal numbers', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234');
  });
});
