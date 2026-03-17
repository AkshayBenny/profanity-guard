import { defaultDictionary } from './dictionary'

export interface ProfanityOptions {
	addWords?: string[]
	removeWords?: string[]
	whitelist?: string[]
}

export class ProfanityEngine {
	private dictionary: Set<string>
	private whitelist: Set<string>

	/**
	 * Leet map is intentionally conservative:
	 * - Only maps characters commonly used as substitutions.
	 * - Does NOT remap normal letters like v/w (that causes false negatives).
	 */
	private static readonly leetMap: Record<string, string> = {
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
	}

	private static readonly leetRegex = /[0134@5$7+!8]/g

	// Distinct dictionary word lengths (used for “f u c k” style bypass detection)
	private wordLengths: number[] = []
	private maxWordLength = 0

	constructor(options?: ProfanityOptions) {
		// Build canonical dictionary once (strip symbols, apply leet, collapse repeats).
		this.dictionary = new Set<string>()
		for (const w of defaultDictionary) {
			const canon = this.canonicalise(w)
			if (canon) this.dictionary.add(canon)
		}

		// With the matching strategy below, substring-matching is not used,
		// so “Scunthorpe”-style false positives are naturally reduced.
		// Whitelist remains supported as an override mechanism.
		this.whitelist = new Set<string>(
			[
				'classic',
				'class',
				'button',
				'analysis',
				'associate',
				'assassin',
				'cassette',
				// optional: add more safe terms here if your app needs them
			]
				.map((w) => this.canonicalise(w))
				.filter(Boolean),
		)

		if (options?.addWords) {
			for (const w of options.addWords) {
				const canon = this.canonicalise(w)
				if (canon) this.dictionary.add(canon)
			}
		}

		if (options?.removeWords) {
			for (const w of options.removeWords) {
				const canon = this.canonicalise(w)
				if (canon) this.dictionary.delete(canon)
			}
		}

		if (options?.whitelist) {
			for (const w of options.whitelist) {
				const canon = this.canonicalise(w)
				if (canon) this.whitelist.add(canon)
			}
		}

		this.recomputeLengths()
	}

	/**
	 * Normalise text while still keeping separators (spaces/punctuation) available
	 * for later stages.
	 */
	private normaliseText(input: string): string {
		// NFKC helps catch “fullwidth” and compatibility variants.
		let s = input.normalize('NFKC').toLowerCase()

		// Leet substitutions (single-char)
		s = s.replace(
			ProfanityEngine.leetRegex,
			(ch) => ProfanityEngine.leetMap[ch] ?? ch,
		)

		// Collapse repeated letters ONLY (e.g. "fuuuuuck" -> "fuck")
		s = s.replace(/([a-z])\1+/g, '$1')

		return s
	}

	/**
	 * Canonical form used in the Set:
	 * - lowercase + NFKC
	 * - leet substitutions
	 * - collapse repeated letters
	 * - strip all non-alphanumerics
	 */
	private canonicalise(input: string): string {
		const s = this.normaliseText(input).replace(/[^a-z0-9]/g, '')
		return s
	}

	private recomputeLengths(): void {
		const lens = new Set<number>()
		let max = 0
		for (const w of this.dictionary) {
			lens.add(w.length)
			if (w.length > max) max = w.length
		}
		this.wordLengths = Array.from(lens).sort((a, b) => b - a) // desc
		this.maxWordLength = max
	}

	private isBanned(canon: string): boolean {
		return (
			canon.length > 0 &&
			this.dictionary.has(canon) &&
			!this.whitelist.has(canon)
		)
	}

	/**
	 * Detect spaced-out bypasses like: "f u c k" or "w t f"
	 * by joining consecutive single-character tokens and checking suffixes.
	 */
	private runHasBannedSuffix(run: string): boolean {
		if (!run) return false

		// Bound run length for performance
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

	/**
	 * Core detection logic:
	 * - Stage A: fast token check (alphanumerics only)
	 * - Stage B: per-whitespace chunk compression (catches f*ck, sh*t, f.u.c.k, w.t.f)
	 * - Stage C: spaced-out letters run detection (catches "f u c k")
	 */
	public check(input: string): boolean {
		if (!input) return false

		const normalised = this.normaliseText(input)

		// Stage A: strict token check
		const tokens = normalised.match(/[a-z0-9]+/g) ?? []
		for (const t of tokens) {
			// tokens are already [a-z0-9]+, so canonical == token
			if (this.isBanned(t)) return true
		}

		// Stage B: compress within whitespace-separated chunks
		// This fixes your specific failure: "f*ck!" -> "fck" (matches dictionary)
		const chunks = normalised.split(/\s+/)
		for (const chunk of chunks) {
			if (!chunk) continue
			const compressed = chunk.replace(/[^a-z0-9]/g, '')
			if (this.isBanned(compressed)) return true
		}

		// Stage C: spaced-out letters ("f u c k")
		let run = ''
		for (const t of tokens) {
			if (t.length === 1) {
				run += t
				if (this.runHasBannedSuffix(run)) return true
			} else {
				run = ''
			}
		}

		return false
	}
}

// Default singleton for simple usage
const defaultEngine = new ProfanityEngine()

export const profanityCheck = (input: string): boolean =>
	defaultEngine.check(input)
