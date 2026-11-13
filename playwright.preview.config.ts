import { defineConfig } from '@playwright/test';
import config from './playwright.config';

// Run the same acceptance criteria against the built application, including
// direct navigation and reloads of BrowserRouter routes.
export default defineConfig(config, {
  testMatch: 'behavior.spec.ts',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
