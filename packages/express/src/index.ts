import { Request, Response, NextFunction } from 'express'
import { profanityCheck, profanityCensor } from 'profanity-guard'
import type { LanguageOption } from 'profanity-guard';

interface GuardOptions {
	action: 'block' | 'censor'
	language?: LanguageOption
	fields: string[] // e.g., ['body.comment', 'query.search']
	replacementChar?: string
	errorMessage?: string
}

export const profanityGuard = (options: GuardOptions) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const {
			action,
			language = 'en',
			fields,
			replacementChar = '*',
			errorMessage = 'Profanity detected',
		} = options

		for (const field of fields) {
			// Simple path resolver (e.g., "body.message" -> req.body.message)
			const parts = field.split('.')
			let target: any = req
			let parent: any = null
			let lastKey = ''

			for (const key of parts) {
				parent = target
				lastKey = key
				target = target?.[key]
			}

			if (typeof target === 'string') {
				if (action === 'block' && profanityCheck(target, language)) {
					return res.status(400).json({ error: errorMessage, field })
				}

				if (action === 'censor') {
					parent[lastKey] = profanityCensor(
						target,
						language,
						replacementChar,
					)
				}
			}
		}

		next()
	}
}
