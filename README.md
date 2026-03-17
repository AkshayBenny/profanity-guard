# Clean Text Filter

A blazingly fast, zero-dependency, and highly extendable profanity filter for the modern web. Built with **TypeScript** for a seamless developer experience in **React**, **Next.js**, **Node.js**, and vanilla JavaScript.

[![npm version](https://img.shields.io/npm/v/clean-text-filter.svg)](https://www.npmjs.com/package/clean-text-filter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Performance-First:** Uses O(1) Set lookups and optimized tokenization.
- **Leet-Speak Detection:** Automatically catches bypasses like `b!tch`, `a$$hole`, or `f*ck`.
- **Scunthorpe Proof:** Smart logic prevents false positives for words like "button" or "classic".
- **Zero Dependencies:** Lightweight footprint for both frontend and backend.
- **First-class TypeScript:** Built-in type definitions for perfect autocompletion.
- **Fully Extendable:** Create custom instances to add your own banned words or whitelist specific terms.

---

## Installation

```bash
npm install clean-text-filter
# or
yarn add clean-text-filter
```

## Usage

### 1. Simple Usage (Default)

Import the ready-to-use function for standard filtering using the built-in dictionary of 300+ words.

```ts
import { profanityCheck } from 'clean-text-filter'

// Simple boolean checks
const isOffensive = profanityCheck('This is some bullsh!t')
console.log(isOffensive) // true

const isClean = profanityCheck('Have a wonderful day!')
console.log(isClean) // false
```

### 2. Custom Extension

Use the `ProfanityEngine` class to tailor the filter to your application's specific needs. This is useful for adding domain-specific slang or whitelisting words.

```ts
import { ProfanityEngine } from 'clean-text-filter'

const myGuard = new ProfanityEngine({
	addWords: ['custom-bad-word', 'competitor-name'], // Add unique banned words
	removeWords: ['hell', 'booty'], // Allow words filtered by default
})

export const checkText = (input: string) => myGuard.check(input)
```

## Framework Examples

### React (Real-time Validation)

Prevent inappropriate usernames or comments directly in the UI.

```tsx
import React, { useState } from 'react'
import { profanityCheck } from 'clean-text-filter'

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
import { profanityCheck } from 'clean-text-filter'

export async function POST(request: Request) {
	const { content } = await request.json()

	if (profanityCheck(content)) {
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

| Option        | Type       | Description                                              |
| ------------- | ---------- | -------------------------------------------------------- |
| `addWords`    | `string[]` | Array of words to add to the blacklist.                  |
| `removeWords` | `string[]` | Array of words to remove (whitelist) from the blacklist. |

## License

MIT © 2026 [Akshay Benny](https://akshaybenny.com)
