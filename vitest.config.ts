import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 2000, // 2 second timeout for all tests
    hookTimeout: 2000, // 2 second timeout for hooks
    logHeapUsage: true, // Log memory usage
  },
}); 