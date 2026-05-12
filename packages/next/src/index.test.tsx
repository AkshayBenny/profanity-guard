import { describe, it, expect, vi, beforeEach } from 'vitest'
import { protectAction } from './index'
import { redirect } from 'next/navigation'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}))

describe('Next.js protectAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return true and call redirect when profanity is detected', () => {
		const input = 'this is bullshit'
		const destination = '/error'

		const result = protectAction(input, destination)

		expect(result).toBe(true)
		expect(redirect).toHaveBeenCalledWith(destination)
	})

	it('should return false and NOT redirect when content is clean', () => {
		const input = 'this is a clean message'

		const result = protectAction(input)

		expect(result).toBe(false)
		expect(redirect).not.toHaveBeenCalled()
	})
})
