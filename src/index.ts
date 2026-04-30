import { ProfanityEngine } from './engine'
import { SupportedLanguage } from './locales'

// Cache engines by language to prevent rebuilding Sets on every check
const engines = new Map<SupportedLanguage, ProfanityEngine>()

export const getProfanityEngine = (
	lang: SupportedLanguage = 'en',
): ProfanityEngine => {
	if (!engines.has(lang)) {
		engines.set(lang, new ProfanityEngine({ language: lang }))
	}
	return engines.get(lang)!
}

/**
 * Checks a string for profanity based on the specified language.
 * @param input The text to check
 * @param lang The language code (defaults to 'en')
 */
export const profanityCheck = (
	input: string,
	lang: SupportedLanguage = 'en',
): boolean => {
	return getProfanityEngine(lang).check(input)
}

export { ProfanityEngine }
