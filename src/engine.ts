import { dictionaries, SupportedLanguage } from './locales'

export interface ProfanityOptions {
	language?: SupportedLanguage
	dictionary?: string[]
	addWords?: string[]
	removeWords?: string[]
	whitelist?: string[]
}

export class ProfanityEngine {
	private dictionary: Set<string>
	private whitelist: Set<string>
	private maxWordLength = 0
	private wordLengths: number[] = []

	// FIX: Added '!' to the leet map
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
		'!': 'i',
	}

	constructor(options?: ProfanityOptions) {
		this.dictionary = new Set()

		let baseWords: string[] = []
		if (options?.dictionary) {
			baseWords = options.dictionary
		} else {
			const lang = options?.language || 'en'
			baseWords = dictionaries[lang] || dictionaries['en']
		}

		for (const word of baseWords) {
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
		return input
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
	}

	private convertLeetChar(ch: string): string {
		return ProfanityEngine.leetMap[ch] ?? ch
	}

	private canonicalizeWord(input: string): string {
		const s = this.normalizeBase(input)
		let out = ''

		for (const ch of s) {
			// FIX: Use Unicode regex \p{L} and \p{N} for multi-language support
			if (/[\p{L}\p{N}]/u.test(ch)) {
				out += this.convertLeetChar(ch)
				continue
			}

			if (['*', '@', '$', '+', '!'].includes(ch)) {
				out += this.convertLeetChar(ch)
			}
		}

		return out
	}

	private buildForms(input: string): string[] {
		const base = this.normalizeBase(input)
		let out = ''

		for (const ch of base) {
			// FIX: Unicode regex
			if (/[\p{L}\p{N}]/u.test(ch)) {
				out += this.convertLeetChar(ch)
				continue
			}
			if (['*', '@', '$', '+', '!'].includes(ch)) {
				out += this.convertLeetChar(ch)
			}
		}

		if (!out) return []

		const forms = new Set<string>()
		forms.add(out)
		// FIX: Unicode regex for repeated character reduction
		forms.add(out.replace(/([\p{L}])\1{2,}/gu, '$1'))
		forms.add(out.replace(/([\p{L}])\1+/gu, '$1'))

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
			// 1. Fast O(1) Exact Match
			if (this.isBanned(form)) return true

			// 2. FIX: Dynamic Wildcard Match for '*'
			// If the user types "f*ck", we check the dictionary for matching 4-letter words
			if (form.includes('*')) {
				const regexPattern = new RegExp(
					'^' + form.replace(/\*/g, '[\\p{L}\\p{N}]') + '$',
					'iu',
				)
				for (const word of this.dictionary) {
					if (
						word.length === form.length &&
						regexPattern.test(word) &&
						!this.whitelist.has(word)
					) {
						return true
					}
				}
			}
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

		// FIX: Unicode tokenization
		const wordTokens = normalized.match(/[\p{L}\p{N}]+/gu) ?? []
		for (const token of wordTokens) {
			if (this.matchesCandidate(token)) return true
		}

		const chunks = normalized.split(/\s+/).filter(Boolean)

		for (const chunk of chunks) {
			// FIX: Unicode tokenization + new leet chars
			const candidates = chunk.match(/[\p{L}\p{N}@\$+\*!]+/gu) ?? []

			for (const candidate of candidates) {
				if (this.matchesCandidate(candidate)) return true
			}

			for (let i = 0; i < candidates.length; i++) {
				let joined = ''
				for (let j = i; j < candidates.length; j++) {
					joined += candidates[j]
					if (joined.length > this.maxWordLength + 4) break
					if (this.matchesCandidate(joined)) return true
				}
			}
		}

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
