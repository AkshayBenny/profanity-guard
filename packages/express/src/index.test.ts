import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { profanityGuard } from './index'

describe('Profanity Guard Express Middleware', () => {
	it('should block requests containing profanity', async () => {
		const app = express()
		app.use(express.json())
		app.post(
			'/test',
			profanityGuard({
				action: 'block',
				fields: ['body.text'],
			}),
			(req, res) => res.status(200).send('Success'),
		)

		const response = await request(app)
			.post('/test')
			.send({ text: 'you are a b!tch' })

		expect(response.status).toBe(400)
		expect(response.body.error).toBe('Profanity detected')
	})

	it('should censor profanity and allow the request', async () => {
		const app = express()
		app.use(express.json())
		app.post(
			'/censor',
			profanityGuard({
				action: 'censor',
				fields: ['body.message'],
			}),
			(req, res) => res.status(200).json({ clean: req.body.message }),
		)

		const response = await request(app)
			.post('/censor')
			.send({ message: 'this is sh!t' })

		expect(response.status).toBe(200)
		expect(response.body.clean).toContain('****')
	})
})
