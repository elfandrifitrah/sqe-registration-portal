import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The GitHub Pages deploy supplies its own base path via `npm run build:pages`
// (--base=/sqe-registration-portal/), so dev, tests and preview all stay at '/'.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
