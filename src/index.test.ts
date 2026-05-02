import { describe, it, expect } from 'vitest'
import { profanityCheck, profanityCensor, ProfanityEngine } from './index'

describe('profanityCheck (Default English)', () => {
	it('returns true for standard English profanity', () => {
		expect(profanityCheck('This is some bullshit')).toBe(true)
	})

	it('returns false for clean text', () => {
		expect(profanityCheck('Have a wonderful day!')).toBe(false)
		expect(profanityCheck('')).toBe(false)
		expect(profanityCheck('   ')).toBe(false)
	})

	it('catches leet-speak bypasses', () => {
		expect(profanityCheck('You are a b!tch')).toBe(true)
		expect(profanityCheck('What an a$$hole')).toBe(true)
		expect(profanityCheck('f*ck this')).toBe(true)
	})

	it('prevents Scunthorpe problem (false positives)', () => {
		expect(profanityCheck('Click the submit button')).toBe(false)
		expect(profanityCheck('Reading a classic book')).toBe(false)
		expect(profanityCheck('He works as an assassin')).toBe(false)
		expect(profanityCheck('Data analysis is fun')).toBe(false)
	})

	it('handles mixed casing and punctuation', () => {
		expect(profanityCheck('BULLSHIT!!!')).toBe(true)
		// Assuming your tokenizer handles dots separating letters
		expect(profanityCheck('b.u.l.l.s.h.i.t')).toBe(true)
	})
})

describe('Multi-Language Support & Logic', () => {
	it('detects French profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['merde'] })
		expect(engine.check("C'est de la m*rde")).toBe(true)
	})

	it('detects Russian Cyrillic profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['блядь'] })
		expect(engine.check('прекрати это, бл**ь')).toBe(true)
	})

	it('detects Hindi/Hinglish profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['bhand'] })
		expect(engine.check('Stop being a b**nd')).toBe(true)
	})

	it('detects Mandarin profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['你这个傻逼'] })
		expect(engine.check('你这个**')).toBe(true)
	})

	it('detects Arabic profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['متناكة'] })
		expect(engine.check('ابنة متناكة')).toBe(true)
	})

	it('detects German profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['scheiße'] })
		expect(engine.check('Das ist absolute scheiße!')).toBe(true)
	})

	it('detects Spanish profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['mierda'] })
		expect(engine.check('¡vete a la mierda, campero!')).toBe(true)
	})

	it('detects Korean profanity', () => {
		const engine = new ProfanityEngine({ dictionary: ['개새끼'] })
		expect(engine.check('이 개새끼야!')).toBe(true)
	})
})

describe('Censoring (profanityCensor & engine.censor)', () => {
	it('censors standard profanity with default asterisks', () => {
		// 'bullshit' is 8 characters long
		expect(profanityCensor('This is some bullshit')).toBe(
			'This is some ********',
		)
	})

	it('returns the original string if no profanity is found', () => {
		expect(profanityCensor('Have a wonderful day!')).toBe(
			'Have a wonderful day!',
		)
	})

	it('preserves surrounding punctuation and whitespace', () => {
		expect(profanityCensor('Hello, bullshit!')).toBe('Hello, ********!')
		expect(profanityCensor('What the f*ck?!?')).toBe('What the ****?!?')
	})

	it('supports custom replacement characters', () => {
		// 5 characters in 'b!tch'
		expect(profanityCensor('You are a b!tch', 'en', '#')).toBe(
			'You are a #####',
		)
	})

	it('works correctly with custom ProfanityEngine instances', () => {
		const engine = new ProfanityEngine({
			dictionary: ['custombadword'],
		})

		// 13 characters
		expect(engine.censor('This is a custombadword test.')).toBe(
			'This is a ************* test.',
		)
		expect(engine.censor('This is a custombadword test.', '@')).toBe(
			'This is a @@@@@@@@@@@@@ test.',
		)
	})
})

describe('ProfanityEngine (Customization)', () => {
	it('allows adding custom banned words', () => {
		const engine = new ProfanityEngine({ addWords: ['competitorx'] })
		expect(engine.check('We are better than competitorx')).toBe(true)
		expect(engine.check('We are better than others')).toBe(false)
	})

	it('allows removing words from the base dictionary', () => {
		const defaultCheck = profanityCheck('What the hell')
		const lenientEngine = new ProfanityEngine({ removeWords: ['hell'] })

		expect(defaultCheck).toBe(true)
		expect(lenientEngine.check('What the hell')).toBe(false)
	})

	it('forces words to pass using a custom whitelist', () => {
		const engine = new ProfanityEngine({
			addWords: ['apple'],
			whitelist: ['pineapple'],
		})

		expect(engine.check('I hate apple')).toBe(true)
		expect(engine.check('I love pineapple')).toBe(false)
	})

	it('loads entirely custom dictionaries', () => {
		const engine = new ProfanityEngine({
			dictionary: ['badword1', 'badword2'],
		})
		expect(engine.check('This contains badword1')).toBe(true)
		expect(
			engine.check('This has standard english profanity like bullshit'),
		).toBe(false)
	})
})
