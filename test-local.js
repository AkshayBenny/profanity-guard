const { profanityCheck, ProfanityEngine } = require('./dist/index')

console.log('--- Testing Default Filter ---')
console.log('Should be true:', profanityCheck("don't be a d!ck"))
console.log('Should be false:', profanityCheck('this is a classic button'))

console.log('\n--- Testing Extended Filter ---')
const custom = new ProfanityEngine({ addWords: ['strawberry'] })
console.log('Should be true (custom):', custom.check('I hate strawberry'))
