export type PaginatedResponse<T> = {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
};

export function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object' && 'results' in payload) {
    const results = (payload as PaginatedResponse<T>).results;
    if (Array.isArray(results)) {
      return results;
    }
  }

  return [];
}
