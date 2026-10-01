import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';

import { AppShell } from '@/components/layout/AppShell';

import { Providers } from './providers';

import type { Metadata, Viewport } from 'next';
import './globals.css';

/** Headlines: a soft, high-contrast serif with real personality. */
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
});

/** Body and UI text. */
const instrumentSans = Instrument_Sans({ variable: '--font-instrument', subsets: ['latin'] });

/** Kickers, badges and metadata. */
const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: { default: 'Dispatch', template: '%s | Dispatch' },
  description: 'Your personal edition: news, movie picks and social posts in one feed.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e6' },
    { media: '(prefers-color-scheme: dark)', color: '#12110e' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // next-themes sets the theme class on <html> before hydration, so React would
    // otherwise warn that the attribute differs from the server render.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}
    >
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
