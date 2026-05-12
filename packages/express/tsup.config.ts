import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	dts: true,
	clean: true,
	external: ['express', 'profanity-guard'],
	splitting: false,
	sourcemap: true,
})
