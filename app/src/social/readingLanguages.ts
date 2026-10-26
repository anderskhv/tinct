/** Explicit reading preferences; never inferred from a name or location. */
export type ReadingLanguage = 'en' | 'da'
export function validReadingLanguages(value: unknown): value is ReadingLanguage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 2
    && value.every(item => item === 'en' || item === 'da') && new Set(value).size === value.length
}
export function initialReadingLanguages(browserLanguages: readonly string[]): ReadingLanguage[] {
  return browserLanguages.some(language => /^da(?:-|$)/i.test(language)) ? ['en', 'da'] : ['en']
}
export function toggleReadingLanguage(current: readonly ReadingLanguage[], language: ReadingLanguage): ReadingLanguage[] {
  return current.includes(language) ? current.length > 1 ? current.filter(item => item !== language) : [...current] : [...current, language]
}
