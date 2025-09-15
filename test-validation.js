// Quick test script to debug validation
const { requiredValidation, emailValidation } = require('./src/utils/validation.ts')

console.log('Testing required validation:')
console.log('Empty string:', requiredValidation.test(''))
console.log('Whitespace:', requiredValidation.test('   '))
console.log('Valid string:', requiredValidation.test('test'))

console.log('\nTesting email validation:')
console.log('Invalid email:', emailValidation.test('invalid'))
console.log('Valid email:', emailValidation.test('test@example.com'))
