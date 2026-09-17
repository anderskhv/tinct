import type { Edition } from '../types'

const languages: Record<string, string> = { en: 'English', da: 'Danish', sv: 'Swedish', de: 'German', fr: 'French', it: 'Italian', ru: 'Russian', el: 'Greek', la: 'Latin' }

/** Presentation only: edition keys and saved choices are unchanged. */
export function preparationEditionLabel(edition: Edition): string {
  const language = languages[edition.language] || edition.language
  if (edition.key === 'modern-en') return 'Modern English, Tinct (AI-generated)'
  if (edition.style === 'modern') return `Modern ${language}, Tinct (AI-generated)`
  if (edition.translator) {
    const name = edition.label.replace(/\s+Translation/i, '').replace(/\s*\([^)]*\)\s*$/, '').trim()
    return `${name || edition.translator}, ${language} translation${edition.year ? ` (${edition.year})` : ''}`
  }
  // Preserve named editions (KJV, WEB, etc.); do not guess their provenance.
  if (/^(?:Original|Shakespeare)(?:\s|$)/i.test(edition.label)) return `Original ${language}${edition.year ? ` (${edition.year})` : ''}`
  return edition.label
}
