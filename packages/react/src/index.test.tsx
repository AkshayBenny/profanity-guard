import { renderHook } from '@testing-library/react'
import { ProfanityProvider, useProfanity } from './index'
import { describe, it, expect } from 'vitest'

describe('useProfanity Hook', () => {
	it('should detect profanity when wrapped in provider', () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<ProfanityProvider>{children}</ProfanityProvider>
		)
		const { result } = renderHook(() => useProfanity(), { wrapper })
		expect(result.current.check('bullshit')).toBe(true)
	})
})
