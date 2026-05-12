The official React integration for `profanity-guard`. Provides high-performance hooks and context providers for real-time profanity filtering in your React applications.

[![npm version](https://img.shields.io/npm/v/@profanity-guard/react.svg)](https://www.npmjs.com/package/@profanity-guard/react)

## Installation

```bash
pnpm add profanity-guard @profanity-guard/react
# or
npm install profanity-guard @profanity-guard/react
```

## Quick Setup

Wrap your application (or a specific feature branch) with the `ProfanityProvider`.

```jsx
import { ProfanityProvider } from '@profanity-guard/react';

function App() {
  return (
    <ProfanityProvider 'en' language: options="{{" }}>
      <YourComponent/>
    </ProfanityProvider>
  );
}
```

## Usage

Use the `useProfanity` hook to validate or censor text dynamically.

```jsx
import React, { useState } from 'react'
import { useProfanity } from '@profanity-guard/react'

export const CommentBox = () => {
	const [text, setText] = useState('')
	const { check, censor } = useProfanity()

	const isBad = check(text)

	return (
		<div>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			{isBad && (
				<p style={{ color: 'red' }}>Please avoid offensive language.</p>
			)}

			<h3>Preview:</h3>
			<p>{censor(text)}</p>
		</div>
	)
}
```

## API Reference

`ProfanityProvider`:

- `options`: Same as `ProfanityEngine` constructor (language, whitelist, addWords).

`useProfanity()`

Returns an object with:

- `check(text: string)`: Returns `true` if profanity is detected.
- `censor(text: string, char?: string)`: Returns the string with bad words masked.
