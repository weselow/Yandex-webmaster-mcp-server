/**
 * Build URLSearchParams from pagination parameters.
 */
export function buildPaginationParams(
  params?: { offset?: number; limit?: number },
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.offset !== undefined && params.offset > 0) {
    searchParams.set('offset', String(params.offset));
  }
  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  return searchParams;
}

/**
 * Build URLSearchParams from date range parameters.
 */
export function buildDateRangeParams(
  params?: { date_from?: string; date_to?: string },
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.date_from) {
    searchParams.set('date_from', params.date_from);
  }
  if (params?.date_to) {
    searchParams.set('date_to', params.date_to);
  }

  return searchParams;
}

/**
 * Merge multiple URLSearchParams into a single URLSearchParams instance.
 * Later entries override earlier ones for the same key.
 */
export function mergeParams(...paramSets: URLSearchParams[]): URLSearchParams {
  const merged = new URLSearchParams();

  for (const params of paramSets) {
    for (const [key, value] of params) {
      merged.set(key, value);
    }
  }

  return merged;
}

/**
 * Build a complete query string from pagination and date range parameters.
 * Returns a string with leading '?' if there are any parameters, or empty string.
 */
export function buildQueryString(
  pagination?: { offset?: number; limit?: number },
  dateRange?: { date_from?: string; date_to?: string },
): string {
  const merged = mergeParams(
    buildPaginationParams(pagination),
    buildDateRangeParams(dateRange),
  );

  const qs = merged.toString();
  return qs ? `?${qs}` : '';
}
