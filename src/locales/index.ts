import { ar } from './ar'
import { de } from './de'
import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import { hi } from './hi'
import { ko } from './ko'
import { ru } from './ru'
import { zh } from './zh'

export const dictionaries = {
	ar,
	de,
	en,
	es,
	fr,
	hi,
	ko,
	ru,
	zh,

} as const

export type SupportedLanguage = keyof typeof dictionaries
