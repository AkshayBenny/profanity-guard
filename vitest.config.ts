import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	test: {
		include: ['packages/*/src/**/*.{test,spec}.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		// This is the magic part
		alias: {
			'profanity-guard': path.resolve(
				__dirname,
				'./packages/core/src/index.ts',
			),
		},
	},
})
