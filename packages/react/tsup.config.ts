import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.tsx'],
	format: ['cjs', 'esm'],
	dts: true,
	clean: true,
	minify: true,
	external: ['react', 'profanity-guard'],
	esbuildOptions(options) {
		options.banner = {
			js: '"use client";',
		}
	},
})
