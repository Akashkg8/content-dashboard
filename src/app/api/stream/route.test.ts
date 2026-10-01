/** @jest-environment node */
import { contentItemSchema } from '@/lib/schemas';

import { GET } from './route';

describe('/api/stream', () => {
  const ENV = { ...process.env };
  afterEach(() => {
    process.env = ENV;
  });

  it('streams Server-Sent Events with valid live posts', async () => {
    process.env = { ...ENV, STREAM_INTERVAL_MS: '1000' };
    const controller = new AbortController();
    const response = await GET(
      new Request('http://localhost/api/stream', { signal: controller.signal }),
    );

    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('cache-control')).toContain('no-cache');

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (!text.includes('event: post')) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    // Let the post's data line arrive too.
    while (!/event: post\ndata: .+\n\n/.test(text)) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    controller.abort();
    await reader.cancel();

    expect(text).toContain('retry: 5000');
    expect(text).toContain('event: ready');
    const data = /event: post\ndata: (.+)\n\n/.exec(text)?.[1];
    const post = contentItemSchema.parse(JSON.parse(data!));
    expect(post).toMatchObject({ source: 'social', ctaLabel: 'View Post' });
    expect(post.id).toMatch(/^social:live-/);
  });
});
