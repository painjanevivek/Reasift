import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:8765",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1050 },
  },
  webServer: {
    command:
      '"..\\Backend\\.venv\\Scripts\\python.exe" -m uvicorn reasift.api:app --app-dir ../Backend --host 127.0.0.1 --port 8765',
    url: "http://127.0.0.1:8765/api/v1/health",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  workers: 1,
});
