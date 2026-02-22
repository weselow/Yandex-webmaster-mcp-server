export function jsonResult(data: unknown): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(error: unknown): { content: [{ type: 'text'; text: string }]; isError: true } {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true as const };
}

export function textResult(message: string): { content: [{ type: 'text'; text: string }] } {
  return { content: [{ type: 'text' as const, text: message }] };
}
