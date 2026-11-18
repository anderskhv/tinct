import { describe, expect, it } from 'vitest'
import { initialReadingLanguages, toggleReadingLanguage, validReadingLanguages } from './readingLanguages'
import { newBookPrimaryEditionKey } from '../data/editionDefaults'
import { OFFERED_DANISH_EDITIONS } from '../data/editionAvailability'
describe('reading languages', () => {
  it('starts with English, plus Danish only for a Danish browser preference', () => {
    expect(initialReadingLanguages(['en-GB'])).toEqual(['en'])
    expect(initialReadingLanguages(['en-GB', 'da-DK'])).toEqual(['en', 'da'])
  })
  it('requires at least one supported language and rejects duplicates', () => {
    for (const invalid of [[], ['fr'], ['en', 'en'], null, 'da']) expect(validReadingLanguages(invalid)).toBe(false)
    expect(validReadingLanguages(['da'])).toBe(true)
    expect(toggleReadingLanguage(['da'], 'da')).toEqual(['da'])
    expect(toggleReadingLanguage(['en', 'da'], 'en')).toEqual(['da'])
  })
})
it('prioritizes only offered Danish editions, only when Danish was chosen', () => {
  const editions = [{ key: 'modern-en', style: 'modern', language: 'en' }, { key: 'modern-da', style: 'modern', language: 'da' }] as const
  expect(newBookPrimaryEditionKey('meditations', editions, 'modern', ['en'])).toBe('modern-en')
  expect(newBookPrimaryEditionKey('meditations', editions, 'modern', ['da'])).toBe('modern-da')
  expect(newBookPrimaryEditionKey('unpublished', editions, 'modern', ['da'])).toBe('modern-en')
})
