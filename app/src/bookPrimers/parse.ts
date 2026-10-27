import { quotesMatchSource, type PrimerContent, type PrimerTopic, type SourcePassage } from './model'
const sections = ['structure', 'peopleAndIdeas', 'helpfulContext', 'whatToNotice', 'usefulReferences'] as const
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid primer object')
  return value as Record<string, unknown>
}
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error('Invalid primer text')
  return value.trim()
}
function topic(value: unknown): PrimerTopic {
  const data = object(value)
  const result: PrimerTopic = { title: text(data.title, 200), explanation: text(data.explanation, 8000) }
  if (data.takeaway !== undefined) result.takeaway = text(data.takeaway, 2000)
  if (data.depth !== undefined) {
    if (!['essential', 'recommended', 'optional'].includes(String(data.depth))) throw new Error('Invalid context depth')
    result.depth = data.depth as PrimerTopic['depth']
  }
  if (data.quotes !== undefined) {
    if (!Array.isArray(data.quotes) || data.quotes.length > 6) throw new Error('Invalid primer quotations')
    result.quotes = data.quotes.map(value => { const quote = object(value); return { text: text(quote.text, 4000), passageId: text(quote.passageId, 500) } })
  }
  return result
}
/** Strictly parse model content; source identity and resource verification never come from the model. */
export function parseGeneratedPrimer(raw: string, passages: readonly SourcePassage[]): PrimerContent {
  if (raw.length > 100_000) throw new Error('Primer response is too large')
  const data = object(JSON.parse(raw))
  const result: PrimerContent = { opening: text(data.opening, 4000), structure: [], peopleAndIdeas: [], helpfulContext: [], whatToNotice: [], usefulReferences: [] }
  for (const section of sections) {
    const values = data[section]
    if (!Array.isArray(values) || values.length > 12) throw new Error('Invalid primer section')
    result[section] = values.map(topic)
  }
  if (!quotesMatchSource(result, passages)) throw new Error('A primer quotation does not match this edition')
  return result
}
