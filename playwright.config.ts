import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const isCI = Boolean(process.env.CI);

/**
 * End-to-end tests run against a production build with demo data forced on,
 * so they never depend on API keys, rate limits or the network.
 * Set PW_CHROMIUM_PATH to use an already-installed Chromium instead of
 * Playwright's download.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1360, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile|a11y|theme/ },
  ],
  webServer: {
    command: isCI
      ? `npm run start -- --port ${PORT}`
      : `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: !isCI,
    env: { USE_MOCK_DATA: 'true', STREAM_INTERVAL_MS: '2000' },
  },
});
