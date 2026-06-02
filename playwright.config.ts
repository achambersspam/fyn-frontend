import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  globalSetup: './e2e/global-setup',
  globalTeardown: './e2e/global-teardown',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/test-results/html-report' }],
  ],
  outputDir: 'e2e/test-results/artifacts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
