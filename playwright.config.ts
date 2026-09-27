import {defineConfig, devices} from '@playwright/test';

const PORT = 3100;

// The tests run against the static export. Run `npm run build` first.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
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
