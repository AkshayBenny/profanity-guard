import { defaultDictionary } from './dictionary'

export class ProfanityEngine {
	private dictionary: Set<string>

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
	}

	constructor(options?: { addWords?: string[]; removeWords?: string[] }) {
		this.dictionary = new Set(defaultDictionary)

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
	}

	private normalize(input: string): string {
		let normalized = input.toLowerCase()
		for (const [leet, standard] of Object.entries(this.leetMap)) {
			normalized = normalized.split(leet).join(standard)
		}
		return normalized
	}

	public check(input: string): boolean {
		if (!input) return false

		const normalized = this.normalize(input)
		const cleaned = normalized.replace(/[^a-z0-9\s]/g, ' ')
		const words = cleaned.split(/\s+/)

		// 1. Check strict word boundaries
		for (const word of words) {
			if (this.dictionary.has(word)) {
				return true
			}
		}

		// 2. Check compound/hidden words (e.g. "mybadwordhere")
		const rawNoSpaces = normalized.replace(/[^a-z0-9]/g, '')
		for (const badWord of this.dictionary) {
			if (badWord.length > 3 && rawNoSpaces.includes(badWord)) {
				return true
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
