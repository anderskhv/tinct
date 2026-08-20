export type SelectionPopupHomeMode = 'define' | 'colors'

/** Wrapping punctuation around a selection, ignored for token count / lookup. */
const WRAP_PUNCT_RE = /^[\s“”"'([{]+|[\s.,;:!?…”"')\]}]+$/g

export function normalizeSelectionText(text: string): string {
  return text.trim().replace(WRAP_PUNCT_RE, '').trim()
}

export function selectionTokens(text: string): string[] {
  const normalized = normalizeSelectionText(text)
  if (!normalized) return []
  return normalized.split(/\s+/).filter(Boolean)
}

/** One token after wrapping punctuation is stripped. Hyphenated words count as one. */
export function isSingleWordSelection(text: string): boolean {
  return selectionTokens(text).length === 1
}

/**
 * Kindle-style default: a single word opens the dictionary; a phrase (or an
 * existing highlight) opens the colour bar. The icon toolbar is never first.
 */
export function defaultPopupMode(
  text: string,
  existingHighlightId?: string | null,
): SelectionPopupHomeMode {
  if (existingHighlightId) return 'colors'
  return isSingleWordSelection(text) ? 'define' : 'colors'
}
