# @profanity-guard/express

Official Express.js middleware for [profanity-guard](https://github.com/AkshayBenny/profanity-guard).

## Installation

`npm install @profanity-guard/express profanity-guard`

## Usage

### Option 1: Blocking Offensive Content

Stop the request before it hits your database.

```javascript
app.post(
	'/comments',
	profanityGuard({
		action: 'block',
		fields: ['body.comment'],
		errorMessage: 'Please keep the conversation civil.',
	}),
	(req, res) => {
		// Safe to save to DB
	},
)
```

### Option 2: Auto-Censoring

Automatically clean the input and proceed.

```javascript
app.post(
	'/chat',
	profanityGuard({
		action: 'censor',
		fields: ['body.message'],
		replacementChar: '#',
	}),
	(req, res) => {
		console.log(req.body.message) // "You are a #####"
	},
)
```
