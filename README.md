# Profanity Guard

A fast, multi-language, and zero-dependency profanity filter. Protect your applications with a massive dictionary of 5,000+ words across English, French, Hindi, Russian, and Mandarin.

[![npm version](https://img.shields.io/npm/v/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/profanity-guard)](https://bundlephobia.com/package/profanity-guard)
[![Tests](https://github.com/AkshayBenny/profanity-guard/actions/workflows/test.yml/badge.svg)](https://github.com/AkshayBenny/profanity-guard/actions)
[![Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/profanity-guard)
[![Types included](https://img.shields.io/npm/types/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![npm downloads](https://img.shields.io/npm/dm/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![npm total downloads](https://img.shields.io/npm/dt/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
[![GitHub issues](https://img.shields.io/github/issues/AkshayBenny/profanity-guard.svg)](https://github.com/AkshayBenny/profanity-guard/issues)

## Features

- **Multilingual:** Out-of-the-box detection for 5,000+ offensive terms in English (`en`), French (`fr`), Hindi/Hinglish (`hi`), Russian (`ru`), and Mandarin (`zh`).
- **Performance-First:** Uses O(1) Set lookups and optimized tokenization.
- **Leet-Speak Detection:** Automatically catches bypasses like `b!tch`, `a$$hole`, or `f*ck`.
- **Scunthorpe Proof:** Smart logic prevents false positives for words like "button" or "classic".
- **Zero Dependencies:** Lightweight footprint for both frontend and backend.
- **First-class TypeScript:** Built-in type definitions for perfect autocompletion.
- **Fully Extendable:** Create custom instances to add your own banned words or whitelist specific terms.

---

## Installation

```bash
npm install profanity-guard
# or
yarn add profanity-guard
```

## Usage

### 1. Simple Usage (Default)

Import the ready-to-use function for standard filtering using the built-in dictionary of 5000+ words.

```ts
import { profanityCheck } from 'profanity-guard'

const isOffensive = profanityCheck('This is some bullsh!t')
console.log(isOffensive) // true

const isClean = profanityCheck('Have a wonderful day!')
console.log(isClean) // false

// English ('en' is the default)
console.log(profanityCheck("Don't be a d!ck")) // true

// French ('fr')
console.log(profanityCheck("C'est de la m*rde", 'fr')) // true

// Russian ('ru')
console.log(profanityCheck('прекрати это, бл**ь', 'ru')) // true

// Hindi / Hinglish ('hi')
console.log(profanityCheck('Stop being a b**nd', 'hi')) // true

// Mandarin ('zh')
console.log(profanityCheck('你这个**', 'zh')) // true
```

### 2. Custom Extension

Use the `ProfanityEngine` class to tailor the filter to your application's specific needs. You can target specific languages or completely overwrite the dictionary.

```ts
import { ProfanityEngine } from 'profanity-guard'

const myGuard = new ProfanityEngine({
	language: 'fr', // Base the engine on the French dictionary
	addWords: ['custom-bad-word', 'competitor-name'], // Add unique banned words
	removeWords: ['enfer'], // Remove specific words from the base dictionary
	whitelist: ['classique'], // Force specific words to always pass
})

export const checkText = (input: string) => myGuard.check(input)
```

### Real-World Use Case: Dynamic Chat Moderation

If your application supports multiple regions, you can dynamically instantiate the engine based on the user's region or channel settings to ensure accurate filtering.

```ts
import { ProfanityEngine, SupportedLanguage } from 'profanity-guard'

// Create a cache of engines for different regions
const regionGuards: Record<string, ProfanityEngine> = {
	'eu-west': new ProfanityEngine({
		language: 'fr',
		addWords: ['merde-locale'],
	}),
	'ap-south': new ProfanityEngine({ language: 'hi' }),
	'us-east': new ProfanityEngine({ language: 'en', whitelist: ['classic'] }),
}

export function moderateMessage(region: string, message: string): boolean {
	const guard = regionGuards[region] || regionGuards['us-east'] // Fallback to English

	if (guard.check(message)) {
		console.warn(`[Moderation] Flagged message in region: ${region}`)
		return false // Block message
	}

	return true // Allow message
}
```

## Framework Examples

### React (Real-time Validation)

Prevent inappropriate usernames or comments directly in the UI.

```tsx
import React, { useState } from 'react'
import { profanityCheck } from 'profanity-guard'

export function Registration() {
	const [error, setError] = useState('')

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		// Check for profanity on every keystroke
		if (profanityCheck(value)) {
			setError('Username contains inappropriate language.')
		} else {
			setError('')
		}
	}

	return (
		<div>
			<input
				type='text'
				onChange={handleInput}
				placeholder='Enter Username'
			/>
			{error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
		</div>
	)
}
```

### Next.js (API Route Protection)

Sanitize user-generated content on the server side before database entry.

```ts
// app/api/comment/route.ts
import { NextResponse } from 'next/server'
import { profanityCheck } from 'profanity-guard'

export async function POST(request: Request) {
	const { content, locale } = await request.json()

	// Pass the user's locale to the check
	if (profanityCheck(content, locale)) {
		return NextResponse.json(
			{ error: 'Content violates community guidelines.' },
			{ status: 400 },
		)
	}

	// Safe to proceed with database logic...
	return NextResponse.json({ success: true })
}
```

## Configuration Options

| Option        | Type                                   | Description                                                                 |
| ------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `language`    | `'en' \| 'fr' \| 'hi' \| 'ru' \| 'zh'` | The base dictionary to load. Defaults to `'en'`.                            |
| `dictionary`  | `string[]`                             | Completely override the built-in dictionary with your own custom array.     |
| `addWords`    | `string[]`                             | Array of words to add to the blacklist.                                     |
| `removeWords` | `string[]`                             | Array of words to remove (whitelist) from the blacklist.                    |
| `whitelist`   | `string[]`                             | Array of words that will always be allowed, overriding any blocked matches. |

## License

MIT © 2026 [Akshay Benny](https://akshaybenny.com)
