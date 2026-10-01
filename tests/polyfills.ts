/**
 * Fill gaps in the jsdom test environment. Runs before the test framework
 * loads, via `setupFiles` in jest.config.ts.
 */
import { clearImmediate, setImmediate } from 'node:timers';

// jsdom removes Node's `setImmediate`, but Node's built-in fetch (undici) and
// MSW's interceptors schedule work with it.
Object.assign(globalThis, { setImmediate, clearImmediate });

if (typeof window !== 'undefined') {
  // jsdom has no matchMedia. next-themes reads it to detect the system theme.
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  // jsdom has <dialog> but not its modal methods. Real browsers also trap focus
  // and handle Escape; the Playwright suite covers that part.
  const dialogProto = window.HTMLDialogElement.prototype;
  dialogProto.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  dialogProto.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
