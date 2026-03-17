import { defaultDictionary } from './dictionary'

export interface ProfanityOptions {
	addWords?: string[]
	removeWords?: string[]
	whitelist?: string[]
}

export class ProfanityEngine {
	private dictionary: Set<string>
	private whitelist: Set<string>
	private maxWordLength = 0
	private wordLengths: number[] = []

	private static readonly leetMap: Record<string, string> = {
		'0': 'o',
		'1': 'i',
		'3': 'e',
		'4': 'a',
		'5': 's',
		'7': 't',
		'8': 'b',
		'@': 'a',
		$: 's',
		'+': 't',
	}

	constructor(options?: ProfanityOptions) {
		this.dictionary = new Set()

		for (const word of defaultDictionary) {
			const canon = this.canonicalizeWord(word)
			if (canon) this.dictionary.add(canon)
		}

		this.whitelist = new Set(
			[
				'classic',
				'class',
				'button',
				'analysis',
				'associate',
				'assassin',
				'cassette',
			]
				.map((word) => this.canonicalizeWord(word))
				.filter(Boolean),
		)

		if (options?.addWords) {
			for (const word of options.addWords) {
				const canon = this.canonicalizeWord(word)
				if (canon) this.dictionary.add(canon)
			}
		}

		if (options?.removeWords) {
			for (const word of options.removeWords) {
				const canon = this.canonicalizeWord(word)
				if (canon) this.dictionary.delete(canon)
			}
		}

		if (options?.whitelist) {
			for (const word of options.whitelist) {
				const canon = this.canonicalizeWord(word)
				if (canon) this.whitelist.add(canon)
			}
		}

		this.recomputeLengths()
	}

	private recomputeLengths(): void {
		const lengths = new Set<number>()

		for (const word of this.dictionary) {
			lengths.add(word.length)
			if (word.length > this.maxWordLength) {
				this.maxWordLength = word.length
			}
		}

		this.wordLengths = Array.from(lengths).sort((a, b) => b - a)
	}

	private normalizeBase(input: string): string {
		return input.normalize('NFKC').toLowerCase()
	}

	private convertLeetChar(ch: string): string {
		return ProfanityEngine.leetMap[ch] ?? ch
	}

	private canonicalizeWord(input: string): string {
		const s = this.normalizeBase(input)
		let out = ''

		for (const ch of s) {
			if (/[a-z0-9]/.test(ch)) {
				out += this.convertLeetChar(ch)
				continue
			}

			if (ch === '*' || ch === '@' || ch === '$' || ch === '+') {
				out += this.convertLeetChar(ch)
			}
		}

		return out
	}

	private buildForms(input: string): string[] {
		const base = this.normalizeBase(input)
		let out = ''

		for (const ch of base) {
			if (/[a-z0-9]/.test(ch)) {
				out += this.convertLeetChar(ch)
				continue
			}

			// only allow symbol substitutions when they are internal obfuscation chars
			if (ch === '*' || ch === '@' || ch === '$' || ch === '+') {
				out += this.convertLeetChar(ch)
			}
		}

		if (!out) return []

		const forms = new Set<string>()
		forms.add(out)
		forms.add(out.replace(/([a-z])\1{2,}/g, '$1'))
		forms.add(out.replace(/([a-z])\1+/g, '$1'))

		return Array.from(forms).filter(Boolean)
	}

	private isBanned(word: string): boolean {
		return (
			word.length > 0 &&
			this.dictionary.has(word) &&
			!this.whitelist.has(word)
		)
	}

	private matchesCandidate(input: string): boolean {
		const forms = this.buildForms(input)
		for (const form of forms) {
			if (this.isBanned(form)) return true
		}
		return false
	}

	private runHasBannedSuffix(run: string): boolean {
		if (!run) return false

		if (run.length > this.maxWordLength) {
			run = run.slice(-this.maxWordLength)
		}

		for (const len of this.wordLengths) {
			if (len > run.length) continue
			const candidate = run.slice(-len)
			if (this.isBanned(candidate)) return true
		}

		return false
	}

	public check(input: string): boolean {
		if (!input || !input.trim()) return false

		const normalized = this.normalizeBase(input)

		// Stage 1: normal words + leet digits
		const wordTokens = normalized.match(/[a-z0-9]+/g) ?? []
		for (const token of wordTokens) {
			if (this.matchesCandidate(token)) return true
		}

		// Stage 2: scan whitespace chunks for obfuscated profanity
		// keep only characters that could plausibly belong to a disguised token
		const chunks = normalized.split(/\s+/).filter(Boolean)

		for (const chunk of chunks) {
			const candidates = chunk.match(/[a-z0-9@\$+\*]+/g) ?? []

			// individual candidates
			for (const candidate of candidates) {
				if (this.matchesCandidate(candidate)) return true
			}

			// joined sliding windows: f.u.c.k / sh-i-t / the---f*ck
			for (let i = 0; i < candidates.length; i++) {
				let joined = ''
				for (let j = i; j < candidates.length; j++) {
					joined += candidates[j]
					if (joined.length > this.maxWordLength + 4) break
					if (this.matchesCandidate(joined)) return true
				}
			}
		}

		// Stage 3: spaced letters across words
		let run = ''
		for (const token of wordTokens) {
			if (token.length === 1) {
				run += token
				if (this.runHasBannedSuffix(run)) return true
			} else {
				run = ''
			}
		}

		return false
	}
}

const defaultEngine = new ProfanityEngine()

export const profanityCheck = (input: string): boolean => {
	return defaultEngine.check(input)
}
