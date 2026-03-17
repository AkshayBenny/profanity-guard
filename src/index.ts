import { defaultDictionary } from './dictionary'

export interface ProfanityOptions {
	addWords?: string[]
	removeWords?: string[]
	whitelist?: string[]
}

export class ProfanityEngine {
	private dictionary: Set<string>
	private whitelist: Set<string>

	private leetMap: Record<string, string> = {
		'0': 'o',
		'1': 'i',
		'3': 'e',
		'4': 'a',
		'@': 'a',
		'5': 's',
		$: 's',
		'7': 't',
		'+': 't',
		'!': 'i',
		'8': 'b',
		v: 'u',
		w: 'uu',
	}

	constructor(options?: ProfanityOptions) {
		this.dictionary = new Set(defaultDictionary)
		// Default whitelist to prevent the Scunthorpe problem
		this.whitelist = new Set([
			'classic',
			'class',
			'button',
			'analysis',
			'associate',
			'assassin',
			'cassette',
		])

		if (options?.addWords) {
			options.addWords.forEach((word) =>
				this.dictionary.add(word.toLowerCase()),
			)
		}

		if (options?.removeWords) {
			options.removeWords.forEach((word) =>
				this.dictionary.delete(word.toLowerCase()),
			)
		}

		if (options?.whitelist) {
			options.whitelist.forEach((word) =>
				this.whitelist.add(word.toLowerCase()),
			)
		}
	}

	private normalize(input: string): string {
		let normalized = input.toLowerCase()

		// 1. Apply Leet-speak mapping
		for (const [leet, standard] of Object.entries(this.leetMap)) {
			normalized = normalized.split(leet).join(standard)
		}

		// 2. Collapse repeated characters (e.g., "fuuuuuuck" -> "fuck")
		// This is a common bypass for filters
		normalized = normalized.replace(/(.)\1+/g, '$1')

		return normalized
	}

	/**
	 * The core detection logic
	 */
	public check(input: string): boolean {
		if (!input) return false

		const originalNormalized = input.toLowerCase()
		const leetNormalized = this.normalize(input)

		// 1. Prepare word arrays for checking
		// We split by anything that isn't a letter or number
		const words = leetNormalized.split(/[^a-z0-9]/)
		const rawWords = originalNormalized.split(/[^a-z0-9]/)

		// 2. STAGE 1: Strict word check (The fastest check)
		for (const word of words) {
			if (
				word.length > 0 &&
				this.dictionary.has(word) &&
				!this.whitelist.has(word)
			) {
				return true
			}
		}

		// 3. STAGE 2: Deep symbol/space bypass check
		// We strip EVERY symbol and space to find hidden words: "f.u.c.k" -> "fuck"
		const compressed = leetNormalized.replace(/[^a-z0-9]/g, '')

		// To avoid false positives (Scunthorpe), we only check substrings
		// if the compressed string itself isn't in the whitelist.
		if (!this.whitelist.has(compressed)) {
			for (const badWord of this.dictionary) {
				// We only perform substring matches on words longer than 3 chars
				// to avoid flagging "ass" inside "classic"
				if (badWord.length > 3 && compressed.includes(badWord)) {
					return true
				}
				// If it's a short bad word, it must be an exact match
				// in the compressed string to be caught here
				if (badWord.length <= 3 && compressed === badWord) {
					return true
				}
			}
		}

		return false
	}
}

// Default export for immediate, simple use
const defaultEngine = new ProfanityEngine()

export const profanityCheck = (input_value: string): boolean => {
	return defaultEngine.check(input_value)
}
