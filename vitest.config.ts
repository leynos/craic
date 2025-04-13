/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig, // Extend the main Vite config
	defineConfig({
		test: {
			globals: true, // Use global APIs (describe, it, expect)
			environment: 'jsdom', // Simulate browser environment
			setupFiles: ['./src/test/setup.ts'], // Global setup file
			// Optional: Configure coverage reporting
			// coverage: {
			//   provider: 'v8', // or 'istanbul'
			//   reporter: ['text', 'json', 'html'],
			// },
		},
	})
); 