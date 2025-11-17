import { ApiError } from './apiError';
import { resolveApiPath } from '../config';

type ApiFetchOptions = RequestInit & { skipJson?: boolean };

type MaybeJson = Record<string, unknown> | Array<unknown> | null;

export async function apiFetch<TResponse = MaybeJson>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { skipJson, headers, ...rest } = options;
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };

  const response = await fetch(resolveApiPath(path), {
    credentials: 'include',
    headers: requestHeaders,
    ...rest,
  });

  const contentType = response.headers.get('content-type');
  const canParseJson = contentType?.includes('application/json') ?? false;
  const payload = canParseJson && !skipJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = resolveErrorMessage(payload, response.statusText);
    throw new ApiError(message, response.status, payload ?? undefined);
  }

  return (payload as TResponse) ?? ({} as TResponse);
}

function resolveErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const payloadRecord = payload as Record<string, unknown>;
    if (typeof payloadRecord.message === 'string') {
      return payloadRecord.message;
    }
    if (typeof payloadRecord.detail === 'string') {
      return payloadRecord.detail;
    }
    if (
      payloadRecord.detail &&
      typeof payloadRecord.detail === 'object' &&
      'message' in payloadRecord.detail &&
      typeof (payloadRecord.detail as Record<string, unknown>).message === 'string'
    ) {
      return String((payloadRecord.detail as Record<string, unknown>).message);
    }
  }
  return fallback || 'Request failed';
}
