import React, { createContext, useContext, useMemo } from 'react'
import { ProfanityEngine } from 'profanity-guard'

const ProfanityContext = createContext<ProfanityEngine | null>(null)

export const ProfanityProvider: React.FC<{
	// This correctly infers the types from the engine's constructor
	options?: ConstructorParameters<typeof ProfanityEngine>[0]
	children: React.ReactNode
}> = ({ options, children }) => {
	const engine = useMemo(() => new ProfanityEngine(options), [options])
	return (
		<ProfanityContext.Provider value={engine}>
			{children}
		</ProfanityContext.Provider>
	)
}

export const useProfanity = () => {
	const engine = useContext(ProfanityContext)
	if (!engine) {
		throw new Error('useProfanity must be used within a ProfanityProvider')
	}

	return {
		check: (input: string) => engine.check(input),
		censor: (input: string, char?: string) => engine.censor(input, char),
	}
}
