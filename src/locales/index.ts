import { en } from './en'
import { fr } from './fr'

export const dictionaries = {
	en,
	fr,
} as const

export type SupportedLanguage = keyof typeof dictionaries
