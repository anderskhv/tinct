const assert = require('node:assert/strict')
const test = require('node:test')

const { cleanText, validate } = require('./validate-words-sidecar.cjs')

test('cleanText mirrors Kokoro text normalization', () => {
  assert.equal(cleanText('Book IV “HELLO” ¹'), 'Book 4 "Hello"')
})

test('validation rejects missing, duplicate, and mismatched edition tokens', () => {
  const errors = validate({
    paragraphs: [
      { paragraph: 0, words: [{ text: 'Wrong', start: 0, end: 0.2 }] },
      { paragraph: 0, words: [{ text: 'Right', start: 0, end: 0.2 }] },
    ],
  }, [['Right'], ['Missing']])

  assert.ok(errors.some((error) => error.includes('duplicate')))
  assert.ok(errors.some((error) => error.includes('does not match')))
  assert.ok(errors.some((error) => error.includes('missing sidecar')))
})

