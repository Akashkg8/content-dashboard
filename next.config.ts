import type { NextConfig } from 'next';

/** Basic hardening headers for every route. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  images: {
    // News images come from thousands of publisher domains. Optimizing them would
    // turn the image endpoint into an open proxy and burn the hosting quota, so
    // images load straight from their source, lazily and with fixed sizes.
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
