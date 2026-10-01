import { getServerEnv } from '@/server/env';
import { buildLivePost } from '@/server/mock/build';

/** Never prerender or cache: every request is its own live connection. */
export const dynamic = 'force-dynamic';

/** Serverless functions have time limits. The browser's EventSource reconnects on its own. */
const MAX_CONNECTION_MS = 55_000;
const FIRST_POST_DELAY_MS = 4_000;
const HEARTBEAT_MS = 15_000;

/**
 * GET /api/stream — Server-Sent Events. Emits a new mock social post every
 * STREAM_INTERVAL_MS. SSE runs on plain route handlers, so it works on
 * Vercel; WebSockets would need a separate long-running server.
 */
export async function GET(request: Request) {
  const interval = getServerEnv().STREAM_INTERVAL_MS;
  const encoder = new TextEncoder();
  const timers: ReturnType<typeof setTimeout>[] = [];
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        timers.forEach((timer) => clearTimeout(timer));
        try {
          controller.close();
        } catch {
          // Already closed by the client.
        }
      };

      let sequence = Math.floor(Date.now() / interval);
      const sendPost = () => {
        write(`event: post\ndata: ${JSON.stringify(buildLivePost(sequence))}\n\n`);
        sequence += 1;
      };

      write('retry: 5000\n\n');
      write(`event: ready\ndata: ${JSON.stringify({ interval })}\n\n`);
      timers.push(setTimeout(sendPost, Math.min(FIRST_POST_DELAY_MS, interval)));
      timers.push(setInterval(sendPost, interval));
      // Comment lines keep proxies from closing an idle connection.
      timers.push(setInterval(() => write(': ping\n\n'), HEARTBEAT_MS));
      timers.push(setTimeout(close, MAX_CONNECTION_MS));
      request.signal.addEventListener('abort', close);
    },
    cancel() {
      closed = true;
      timers.forEach((timer) => clearTimeout(timer));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
