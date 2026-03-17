import { defaultDictionary } from './dictionary'

export interface ProfanityOptions {
	addWords?: string[]
	removeWords?: string[]
	whitelist?: string[]
}

export class ProfanityEngine {
	private dictionary: Set<string>
	private whitelist: Set<string>
	private wordLengths: number[] = []
	private maxWordLength = 0

	/**
	 * Only characters that are commonly used as substitutions.
	 * Important: do NOT apply these blindly to full sentences,
	 * because punctuation like "!" at the end of a word is not leetspeak.
	 */
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
		'*': '',
	}

	/**
	 * Characters that may legitimately appear inside an obfuscated word segment.
	 * Example:
	 * - b!tch
	 * - a$$
	 * - f*ck
	 */
	private static readonly segmentRegex = /[a-z0-9@$+*!]+/gi

	constructor(options?: ProfanityOptions) {
		this.dictionary = new Set<string>()

		for (const word of defaultDictionary) {
			const canon = this.canonicaliseDictionaryWord(word)
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
				.map((word) => this.canonicaliseDictionaryWord(word))
				.filter(Boolean),
		)

		if (options?.addWords) {
			for (const word of options.addWords) {
				const canon = this.canonicaliseDictionaryWord(word)
				if (canon) this.dictionary.add(canon)
			}
		}

		if (options?.removeWords) {
			for (const word of options.removeWords) {
				const canon = this.canonicaliseDictionaryWord(word)
				if (canon) this.dictionary.delete(canon)
			}
		}

		if (options?.whitelist) {
			for (const word of options.whitelist) {
				const canon = this.canonicaliseDictionaryWord(word)
				if (canon) this.whitelist.add(canon)
			}
		}

		this.recomputeLengths()
	}

	/**
	 * Lowercase + unicode compatibility normalization only.
	 * Do NOT apply leet conversion here globally.
	 */
	private normaliseText(input: string): string {
		return input.normalize('NFKC').toLowerCase()
	}

	/**
	 * Canonicalize a dictionary word.
	 * Dictionary entries are allowed to contain variants like:
	 * - f*ck
	 * - b!tch
	 * - a$$
	 */
	private canonicaliseDictionaryWord(input: string): string {
		const s = this.normaliseText(input)
		let out = ''

		for (const ch of s) {
			if (/[a-z0-9]/.test(ch)) {
				out += ch
				continue
			}

			if (
				Object.prototype.hasOwnProperty.call(
					ProfanityEngine.leetMap,
					ch,
				)
			) {
				out += ProfanityEngine.leetMap[ch]
			}
		}

		return out
	}

	/**
	 * Canonicalize a candidate segment from user input.
	 * This is where leet mappings are applied safely, only inside candidate segments.
	 */
	private canonicaliseCandidate(input: string): string {
		const s = this.normaliseText(input)
		let out = ''

		for (const ch of s) {
			if (/[a-z0-9]/.test(ch)) {
				out += ch
				continue
			}

			if (
				Object.prototype.hasOwnProperty.call(
					ProfanityEngine.leetMap,
					ch,
				)
			) {
				out += ProfanityEngine.leetMap[ch]
			}
		}

		return out
	}

	/**
	 * Returns additional variants for exaggerated letter repetition.
	 * Example:
	 * - fuuuuuck -> fuck
	 * - biiitch -> bitch
	 *
	 * We keep the raw form too, so normal words like "class" are preserved.
	 */
	private buildCandidateForms(input: string): string[] {
		const raw = this.canonicaliseCandidate(input)
		if (!raw) return []

		const variants = new Set<string>()
		variants.add(raw)

		// collapse 3+ repeated letters -> 1
		variants.add(raw.replace(/([a-z])\1{2,}/g, '$1'))

		// collapse 2+ repeated letters -> 1
		variants.add(raw.replace(/([a-z])\1+/g, '$1'))

		return Array.from(variants).filter(Boolean)
	}

	private recomputeLengths(): void {
		const lengths = new Set<number>()
		let max = 0

		for (const word of this.dictionary) {
			lengths.add(word.length)
			if (word.length > max) max = word.length
		}

		this.wordLengths = Array.from(lengths).sort((a, b) => b - a)
		this.maxWordLength = max
	}

	private isBannedCanonical(value: string): boolean {
		return (
			value.length > 0 &&
			this.dictionary.has(value) &&
			!this.whitelist.has(value)
		)
	}

	private matchesAnyForm(input: string): boolean {
		const forms = this.buildCandidateForms(input)

		for (const form of forms) {
			if (this.isBannedCanonical(form)) return true
		}

		return false
	}

	/**
	 * Trim boundary punctuation that is almost certainly not part of the word.
	 * Important:
	 * - removes trailing "!" in "fuck!"
	 * - keeps internal symbols like b!tch or f*ck
	 * - keeps "$" because a$$ is a valid obfuscation
	 */
	private trimBoundaryNoise(chunk: string): string {
		return chunk
			.replace(/^[^a-z0-9@$+*!]+/i, '')
			.replace(/[^a-z0-9@$+*!]+$/i, '')
	}

	/**
	 * Check suffixes of a run of single-letter tokens.
	 * Catches:
	 * - f u c k
	 * - w t f
	 */
	private runHasBannedSuffix(run: string): boolean {
		if (!run) return false

		if (run.length > this.maxWordLength) {
			run = run.slice(-this.maxWordLength)
		}

		for (const len of this.wordLengths) {
			if (len > run.length) continue
			const candidate = run.slice(-len)
			if (this.isBannedCanonical(candidate)) return true
		}

		return false
	}

	public check(input: string): boolean {
		if (!input || !input.trim()) return false

		const normalised = this.normaliseText(input)
		const whitespaceChunks = normalised.split(/\s+/).filter(Boolean)

		/**
		 * Stage A:
		 * Check each whitespace chunk directly after boundary trimming.
		 * Catches:
		 * - fuck!
		 * - f*ck!
		 * - b!tch
		 * - a$$
		 */
		for (const rawChunk of whitespaceChunks) {
			const chunk = this.trimBoundaryNoise(rawChunk)
			if (!chunk) continue

			if (this.matchesAnyForm(chunk)) {
				return true
			}
		}

		/**
		 * Stage B:
		 * Split each chunk into word-like segments and test sliding joins.
		 * Catches:
		 * - f.u.c.k
		 * - the---f*ck??
		 * - sh-i-t
		 */
		for (const rawChunk of whitespaceChunks) {
			const chunk = this.trimBoundaryNoise(rawChunk)
			if (!chunk) continue

			const segments = chunk.match(ProfanityEngine.segmentRegex) ?? []
			if (segments.length === 0) continue

			// individual segments
			for (const segment of segments) {
				if (this.matchesAnyForm(segment)) {
					return true
				}
			}

			// joined windows of consecutive segments
			for (let i = 0; i < segments.length; i++) {
				let joined = ''

				for (let j = i; j < segments.length; j++) {
					joined += segments[j]

					const approxLength =
						this.canonicaliseCandidate(joined).length
					if (approxLength > this.maxWordLength) break

					if (this.matchesAnyForm(joined)) {
						return true
					}
				}
			}
		}

		/**
		 * Stage C:
		 * Spaced-out single letters across whitespace.
		 * Catches:
		 * - f u c k
		 * - w t f
		 */
		let run = ''

		for (const rawChunk of whitespaceChunks) {
			const chunk = this.trimBoundaryNoise(rawChunk)
			if (!chunk) {
				run = ''
				continue
			}

			const segments = chunk.match(ProfanityEngine.segmentRegex) ?? []
			if (segments.length !== 1) {
				run = ''
				continue
			}

			const forms = this.buildCandidateForms(segments[0])
			const single = forms.find((value) => value.length === 1)

			if (!single) {
				run = ''
				continue
			}

			run += single

			if (this.runHasBannedSuffix(run)) {
				return true
			}
		}

		return false
	}
}

const defaultEngine = new ProfanityEngine()

export const profanityCheck = (input: string): boolean => {
	return defaultEngine.check(input)
}
