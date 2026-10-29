/** Book primers are separate from the PDF document companion. */
export const BOOK_PRIMER_PROMPT_VERSION = 'book-primer-4'
export type PrimerScope = { kind: 'public' } | { kind: 'private'; ownerId: string; uploadId: string }
export interface PrimerIdentity {
  scope: PrimerScope
  workId: string
  editionId: string
  sourceVersion: string
  unitId: string | null
  type: 'book' | 'chapter'
  language: string
}
export interface PrimerQuote { text: string; passageId: string }
export interface PrimerTopic {
  title: string
  explanation: string
  takeaway?: string
  depth?: 'essential' | 'recommended' | 'optional'
  quotes?: PrimerQuote[]
}
export interface PrimerContent {
  opening: string
  structure: PrimerTopic[]
  peopleAndIdeas: PrimerTopic[]
  helpfulContext: PrimerTopic[]
  whatToNotice: PrimerTopic[]
  usefulReferences: PrimerTopic[]
}
/** Resources are supplied by a verified editorial source, never trusted from model output. */
export interface VerifiedPrimerResource {
  title: string
  creator: string
  format: string
  url: string
  relevance: string
  spoilerNote: string
  verifiedAt: string
  durationSeconds?: number
}
export interface SavedPrimer {
  identity: PrimerIdentity
  content: PrimerContent
  resources: VerifiedPrimerResource[]
  origin: 'generated' | 'manual' | 'approved'
  createdAt: string
  promptVersion: string
}

/** Every component participates; title matching cannot turn an upload public. */
export function primerKey(identity: PrimerIdentity): string {
  const { scope, workId, editionId, sourceVersion, unitId, type, language } = identity
  for (const value of [workId, editionId, sourceVersion, language]) {
    if (!value.trim()) throw new Error('Primer source identity is incomplete')
  }
  if ((type === 'chapter' && !unitId?.trim()) || (type === 'book' && unitId !== null)) {
    throw new Error('Primer unit does not match its type')
  }
  if (scope.kind === 'private' && (!scope.ownerId.trim() || !scope.uploadId.trim())) {
    throw new Error('Private primer requires its owner and upload')
  }
  return JSON.stringify([scope.kind, scope.kind === 'private' ? scope.ownerId : null,
    scope.kind === 'private' ? scope.uploadId : null, workId, editionId, sourceVersion, unitId, type, language])
}

/** A generation response can never replace human copy or cross source identities. */
export function acceptGeneratedPrimer(existing: SavedPrimer | null, generated: SavedPrimer): SavedPrimer {
  if (generated.origin !== 'generated') throw new Error('Expected generated primer')
  const key = primerKey(generated.identity)
  if (!existing) return generated
  if (primerKey(existing.identity) !== key) throw new Error('Primer identity mismatch')
  // Reopening a primer uses its saved result. Refresh is an explicit editorial action.
  return existing
}

export interface SourcePassage { id: string; text: string }
export function quotesMatchSource(content: PrimerContent, passages: readonly SourcePassage[]): boolean {
  const source = new Map(passages.map(passage => [passage.id, passage.text]))
  return [content.structure, content.peopleAndIdeas, content.helpfulContext, content.whatToNotice, content.usefulReferences]
    .every(topics => topics.every(topic => (topic.quotes ?? []).every(quote =>
      quote.text.length > 0 && source.get(quote.passageId)?.includes(quote.text) === true)))
}

export function visiblePrimerSections(content: PrimerContent, type: PrimerIdentity['type']) {
  const book = [['Structure', content.structure], ['People & ideas', content.peopleAndIdeas],
    ['Helpful context', content.helpfulContext], ['What to notice', content.whatToNotice]] as const
  const chapter = [['Structure', content.structure], ['What to notice', content.whatToNotice],
    ['Useful references', content.usefulReferences]] as const
  return (type === 'book' ? book : chapter).filter(([, topics]) => topics.length > 0)
}
