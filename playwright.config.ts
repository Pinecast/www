import {defineConfig, devices} from '@playwright/test';

const PORT = 3100;

// The tests run against the static export. Run `npm run build` first.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // In CI, one worker for each core of the runner, which has four. The default
  // of Playwright is one for each two cores. With four workers the tests took
  // 5 to 7 minutes in three runs, and with two they took 8. On a laptop the
  // default stays: its cores are also for the person who uses it.
  workers: process.env.CI ? '100%' : undefined,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `serve out --listen ${PORT} --no-request-logging`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
