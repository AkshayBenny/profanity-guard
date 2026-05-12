import { profanityCheck } from 'profanity-guard'
import { redirect } from 'next/navigation'

/**
 * Server-side protection for Next.js Server Actions
 */
export const protectAction = (input: string, redirectTo?: string) => {
	const isBad = profanityCheck(input)
	if (isBad && redirectTo) {
		redirect(redirectTo)
	}
	return isBad
}
