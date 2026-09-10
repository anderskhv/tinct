export type SelectionPopupHomeMode = 'define' | 'main'

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
 * A single word opens information; phrases and existing highlights open actions.
 * Selection itself never saves a highlight.
 */
export function defaultPopupMode(
  text: string,
  existingHighlightId?: string | null,
): SelectionPopupHomeMode {
  if (existingHighlightId) return 'main'
  return isSingleWordSelection(text) ? 'define' : 'main'
}
