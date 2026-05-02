import { ar } from './ar'
import { en } from './en'
import { fr } from './fr'
import { hi } from './hi'
import { ru } from './ru'
import { zh } from './zh'

export const dictionaries = {
	en,
	fr,
	hi,
	ru,
	zh,
	ar,
} as const

export type SupportedLanguage = keyof typeof dictionaries
