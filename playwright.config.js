import { loadEnvFile } from 'node:process';
import { defineConfig } from '@playwright/test';

for (const file of ['.env.playwright.local', '.env']) {
  try {
    loadEnvFile(new URL(file, import.meta.url));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const port = '3100';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests',
  use: { baseURL, browserName: 'chromium', channel: 'chromium' },
  webServer: {
    command: 'npm start',
    env: { PORT: port },
    url: `${baseURL}/health`,
  },
});
