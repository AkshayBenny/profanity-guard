import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		clearMocks: true, // Automatically clears mock history before every test
		mockReset: true, // Resets mock implementation to default before every test
		include: ['packages/*/src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		alias: {
			'profanity-guard': path.resolve(
				__dirname,
				'./packages/core/src/index.ts',
			),
			'@profanity-guard/react': path.resolve(
				__dirname,
				'./packages/react/src/index.tsx',
			),
		},
	},
})
