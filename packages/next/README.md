Specialized utilities for Next.js applications, optimized for Server Components, Server Actions, and API Routes.

[![npm version](https://img.shields.io/npm/v/@profanity-guard/next.svg)](https://www.npmjs.com/package/@profanity-guard/next)

## Installation

```bash
pnpm add profanity-guard @profanity-guard/next
# or
npm install profanity-guard @profanity-guard/next
```

## Usage

### 1. Protecting Server Actions

Secure your forms by redirecting users if offensive content is submitted.

```ts
'use server'

import { protectAction } from '@profanity-guard/next'

export async function submitComment(formData: FormData) {
	const content = formData.get('content') as string

	// Blocks action and redirects if profanity is found
	protectAction(content, '/community-guidelines')

	// Proceed with DB logic
	await db.comment.create({ data: { content } })
}
```

### 2. Usage in API Routes (Route Handlers)

```ts
import { NextResponse } from 'next/server'
import { profanityCheck } from 'profanity-guard'

export async function POST(req: Request) {
	const { text } = await req.json()

	if (profanityCheck(text)) {
		return NextResponse.json(
			{ error: 'Inappropriate content' },
			{ status: 400 },
		)
	}

	return NextResponse.json({ success: true })
}
```
