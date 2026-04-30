import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  webServer: [
    {
      command: "corepack pnpm --filter @proxi/back dev",
      env: {
        ...process.env,
        PROXI_CORS_ORIGINS: "http://localhost:5173,http://127.0.0.1:5173",
      },
      reuseExistingServer: true,
      timeout: 120_000,
      url: "http://127.0.0.1:3000/health",
    },
    {
      command: "corepack pnpm --filter @proxi/front dev -- --host 127.0.0.1",
      reuseExistingServer: true,
      timeout: 120_000,
      url: "http://127.0.0.1:5173",
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
