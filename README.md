# Profanity Guard

A fast, multi-language, and zero-dependency profanity filter. Protect your applications with a massive dictionary of 5,000+ words across English, Arabic, German, Spanish, French, Hindi, Korean, Russian, Mandarin.

[![npm version](https://img.shields.io/npm/v/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Package Size](https://packagephobia.com/badge?p=profanity-guard)](https://packagephobia.com/result?p=profanity-guard)
[![Tests](https://github.com/AkshayBenny/profanity-guard/actions/workflows/test.yml/badge.svg)](https://github.com/AkshayBenny/profanity-guard/actions)
[![Dependencies](https://img.shields.io/badge/dependencies-0-success.svg)](https://www.npmjs.com/package/profanity-guard)
[![Types included](https://img.shields.io/npm/types/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![npm downloads](https://img.shields.io/npm/dm/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![npm total downloads](https://img.shields.io/npm/dt/profanity-guard.svg)](https://www.npmjs.com/package/profanity-guard)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/AkshayBenny/profanity-guard/pulls)
[![GitHub issues](https://img.shields.io/github/issues/AkshayBenny/profanity-guard.svg)](https://github.com/AkshayBenny/profanity-guard/issues)

## Features

- **Multilingual:** Out-of-the-box detection for 5,000+ offensive terms in English (`en`), Arabic (`ar`), German (`de`), Spanish (`es`), French (`fr`), Hindi (`hi`), Korean (`ko`), Russian (`ru`), Mandarin (`zh`).
- **Performance-First:** Uses O(1) Set lookups and optimized tokenization.
- **Smart Censoring:** Automatically mask bad words while keeping surrounding punctuation and spacing perfectly intact.
- **Leet-Speak Detection:** Automatically catches bypasses like `b!tch`, `a$$hole`, or `f*ck`.
- **False-Positive Prevention:** Smart logic prevents false positives for words like "button" or "classic".
- **Zero Dependencies:** Lightweight footprint for both frontend and backend.
- **TypeScript:** Built-in type definitions for perfect autocompletion.
- **Fully Extendable:** Create custom instances to add your own banned words or whitelist specific terms.

---

## Installation

```bash
npm install profanity-guard
# or
yarn add profanity-guard
```

## Usage

### 1. Standard Detection

The default `profanityCheck` function evaluates strings against the built-in dictionaries, returning a boolean indicating the presence of profanity.

```ts
import { profanityCheck } from 'profanity-guard'

// Basic Evaluation
const isOffensive = profanityCheck('This is some bullsh!t')
console.log(isOffensive) // true

const isClean = profanityCheck('Have a wonderful day!')
console.log(isClean) // false

// Language-Specific Evaluation
console.log(profanityCheck("C'est de la m*rde", 'fr')) // true
console.log(profanityCheck('прекрати это, бл**ь', 'ru')) // true
console.log(profanityCheck('Stop being a b**nd', 'hi')) // true
console.log(profanityCheck('你这个**', 'zh')) // true
console.log(profanityCheck('ابنة متناكة', 'ar')) // true
console.log(profanityCheck('이 개새끼야!', 'ko')) // true
console.log(profanityCheck('¡vete a la mierda, campero!', 'es')) // true
console.log(profanityCheck('Das ist absolute scheiße!', 'de')) // true
```

### 2. Content Censoring

The `profanityCensor` function parses user input and replaces identified profanity with a designated character, leaving non-offensive tokens and punctuation intact.

**Real-World Use Case: Review Sanitization**
When displaying user-generated content such as product reviews, administrators can maintain the overall review context while masking terms that violate community guidelines.

```ts
import { profanityCensor } from 'profanity-guard'

const rawReview = 'The shipping was fast, but the product is absolute sh!t!!!'

// Default masking (asterisks)
const cleanReview = profanityCensor(rawReview)
console.log(cleanReview)
// Output: "The shipping was fast, but the product is absolute ****!!!"

// Custom replacement character
const customCensor = profanityCensor('You are a b!tch', 'en', '#')
console.log(customCensor)
// Output: "You are a #####"
```

### 3. Custom Extension

For domain-specific requirements, developers can instantiate the `ProfanityEngine` class directly to manipulate the base dictionaries or configure strict whitelists.

**Real-World Use Case: Localized Server Moderation**
Applications operating distributed servers across multiple regions can initialize localized engines with customized vocabulary constraints.

```ts
import { ProfanityEngine, SupportedLanguage } from 'profanity-guard'

// Initialize independent engines per region with specific configurations
const regionGuards: Record<string, ProfanityEngine> = {
	'eu-west': new ProfanityEngine({
		language: 'fr',
		addWords: ['merde-locale'],
	}),
	'ap-south': new ProfanityEngine({ language: 'hi' }),
	'us-east': new ProfanityEngine({ language: 'en', whitelist: ['classic'] }),
}

export function moderateMessage(region: string, message: string): boolean {
	const guard = regionGuards[region] || regionGuards['us-east'] // Fallback to EN

	if (guard.check(message)) {
		console.warn(`[Moderation] Flagged message in region: ${region}`)
		return false // Block transmission
	}

	return true // Allow transmission
}
```

## Framework Examples

### React (Synchronous Validation)

**Real-World Use Case: Form Input Constraints**
Because the engine is highly performant, it can safely execute synchronously on the React rendering thread during user input events without causing UI latency.

```tsx
import React, { useState } from 'react'
import { profanityCheck } from 'profanity-guard'

export function RegistrationForm() {
	const [error, setError] = useState('')

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		// Executes validation on keystroke
		if (profanityCheck(value)) {
			setError('Input contains restricted vocabulary.')
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

### Next.js (API Route Middleware)

**Real-World Use Case: Database Insertion Protection**
Sanitize incoming payloads on the server-side to ensure compliance before executing database write operations.

```ts
// app/api/comment/route.ts
import { NextResponse } from 'next/server'
import { profanityCheck } from 'profanity-guard'

export async function POST(request: Request) {
	const { content, locale } = await request.json()

	// Validate payload against localized dictionary
	if (profanityCheck(content, locale)) {
		return NextResponse.json(
			{ error: 'Payload violates community standards.' },
			{ status: 400 },
		)
	}

	// Proceed with safe data
	return NextResponse.json({ success: true })
}
```

## Performance Metrics

`profanity-guard` is optimized to operate efficiently in both high-frequency UI layers and data-heavy backend pipelines. Benchmarks conducted on a standard Node.js environment yield the following baseline metrics:

- Operation Time: ~0.02 milliseconds per validation check.

- Throughput: ~45,000 operations per second (single thread).

These tolerances allow the library to function synchronously within the 16ms frontend render budget or process large datasets without impeding the Node.js event loop.

## Configuration API Reference

When instantiating a new `ProfanityEngine(options)`, the constructor accepts the following properties:

| Option        | Type                                                                   | Description                                                                 |
| ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `language`    | `'en' \| 'fr' \| 'hi' \| 'ru' \| 'zh' \| 'ar' \| 'de' \| 'es' \| 'ko'` | The base dictionary to load. Defaults to `'en'`.                            |
| `dictionary`  | `string[]`                                                             | Completely override the built-in dictionary with your own custom array.     |
| `addWords`    | `string[]`                                                             | Array of words to add to the blacklist.                                     |
| `removeWords` | `string[]`                                                             | Array of words to remove (whitelist) from the blacklist.                    |
| `whitelist`   | `string[]`                                                             | Array of words that will always be allowed, overriding any blocked matches. |

## License

MIT © 2026 [Akshay Benny](https://akshaybenny.com)
