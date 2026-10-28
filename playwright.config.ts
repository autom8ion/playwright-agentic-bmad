import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
export const CUSTOMER_STATE = 'playwright/.auth/customer.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // Opt-in: ALLURE=1 npm test (or npm run test:allure), then npm run allure:report.
    ...(process.env.ALLURE ? [['allure-playwright', { resultsDir: 'allure-results' }] as const] : []),
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    // Toolshop is a shared public demo with occasional cold starts (seen: 17s first byte).
    navigationTimeout: 45_000,
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'api', testDir: './tests/api', use: { baseURL: API_URL } },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
});
