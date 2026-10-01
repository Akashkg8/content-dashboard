import 'server-only';

import type { z } from 'zod';

/** Provider responses are cached for 5 minutes. Protects NewsAPI's 100 requests/day limit. */
export const PROVIDER_REVALIDATE_SECONDS = 300;
const PROVIDER_TIMEOUT_MS = 6000;

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

/**
 * Fetch JSON from a third-party API and validate its shape. Any failure
 * (network, timeout, non-2xx, unexpected shape) throws `ProviderError`, which
 * callers turn into a mock-data fallback.
 */
export async function fetchProviderJson<T>(
  url: URL,
  schema: z.ZodType<T>,
  headers: Record<string, string> = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      next: { revalidate: PROVIDER_REVALIDATE_SECONDS },
    });
  } catch (error) {
    throw new ProviderError(`Request to ${url.hostname} failed: ${String(error)}`);
  }
  if (!response.ok) {
    throw new ProviderError(`${url.hostname} responded ${response.status}`, response.status);
  }
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ProviderError(`${url.hostname} returned an unexpected shape`);
  return parsed.data;
}

/** Only https links reach the browser. Anything else becomes null. */
export function httpsOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:') url.protocol = 'https:';
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Log provider failures on the server without leaking them to the client. */
export function logFallback(source: string, error: unknown) {
  console.warn(
    `[${source}] falling back to mock data:`,
    error instanceof Error ? error.message : error,
  );
}
