export const CHARACTER_LIMIT = 25000;

/**
 * Format data as a Markdown table.
 */
export function formatAsMarkdownTable(headers: string[], rows: string[][]): string {
  if (headers.length === 0) return '';

  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');

  return [headerRow, separatorRow, dataRows].filter(Boolean).join('\n');
}

/**
 * Format API response for MCP tool output.
 * Returns both a human-readable markdown string and the raw structured data.
 */
export function formatToolResponse<T>(
  data: T,
  formatter: (data: T) => string,
): { text: string; structured: T } {
  return {
    text: formatter(data),
    structured: data,
  };
}

/**
 * Truncate response text if it exceeds CHARACTER_LIMIT.
 * Appends a note indicating how many items were truncated.
 */
export function truncateIfNeeded(
  text: string,
  totalItems: number,
  shownItems: number,
): string {
  if (text.length <= CHARACTER_LIMIT) {
    return text;
  }

  const truncated = text.slice(0, CHARACTER_LIMIT);
  const lastNewline = truncated.lastIndexOf('\n');
  const cleanCut = lastNewline > 0 ? truncated.slice(0, lastNewline) : truncated;

  return `${cleanCut}\n\n... Truncated. Showing ${shownItems} of ${totalItems} items. Use pagination to see more.`;
}

/**
 * Format an ISO date string for human-readable display.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number with locale-aware thousand separators.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}
