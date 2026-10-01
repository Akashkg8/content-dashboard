/**
 * jsdom removes Node's `setImmediate`, but Node's built-in fetch (undici) and
 * MSW's interceptors schedule work with it. Restore it from Node's timers.
 * Runs before the test framework loads, via `setupFiles` in jest.config.ts.
 */
import { clearImmediate, setImmediate } from 'node:timers';

Object.assign(globalThis, { setImmediate, clearImmediate });
