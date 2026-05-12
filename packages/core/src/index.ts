import { ProfanityEngine } from './engine'
import type { LanguageOption, SupportedLanguage } from './locales'

const engines = new Map<LanguageOption, ProfanityEngine>()

export const getProfanityEngine = (
	lang: LanguageOption = 'en',
): ProfanityEngine => {
	if (!engines.has(lang)) {
		engines.set(lang, new ProfanityEngine({ language: lang }))
	}
	return engines.get(lang)!
}

/**
 * Checks a string for profanity based on the specified language.
 * @param input The text to check
 * @param lang The language code or 'all' (defaults to 'en')
 */
export const profanityCheck = (
	input: string,
	lang: LanguageOption = 'en',
): boolean => {
	return getProfanityEngine(lang).check(input)
}

/**
 * Censors profanity in a string based on the specified language.
 * @param input The text to censor
 * @param lang The language code or 'all' (defaults to 'en')
 * @param replaceChar The character to replace bad words with (defaults to '*')
 */
export const profanityCensor = (
	input: string,
	lang: LanguageOption = 'en',
	replaceChar = '*',
): string => {
	return getProfanityEngine(lang).censor(input, replaceChar)
}

export { ProfanityEngine }

export type { LanguageOption, SupportedLanguage }
