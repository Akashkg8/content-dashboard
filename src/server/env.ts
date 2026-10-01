import 'server-only';

import { z } from 'zod';

/** Treat empty strings from `.env` files as "not set". */
const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional(),
);

const envSchema = z.object({
  NEWS_API_KEY: optionalString,
  TMDB_API_KEY: optionalString,
  USE_MOCK_DATA: z.preprocess((value) => value === 'true' || value === '1', z.boolean()),
  STREAM_INTERVAL_MS: z.coerce.number().int().min(1000).max(600_000).catch(20_000),
});

export type ServerEnv = z.infer<typeof envSchema>;

/**
 * Read and validate server-only environment variables.
 * A function, not a module constant, so tests can change `process.env` between cases.
 * None of these values ever reach the browser: there are no NEXT_PUBLIC_ variables.
 */
export function getServerEnv(): ServerEnv {
  return envSchema.parse(process.env);
}
