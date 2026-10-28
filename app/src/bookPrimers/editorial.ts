import { primerKey, type PrimerIdentity, type SavedPrimer, type SourcePassage, type VerifiedPrimerResource } from './model'
import { parseGeneratedPrimer } from './parse'
import { usablePrimerResource } from './resources'

/** Repository-owned editorial records; never supplied by uploads or model output. */
export interface EditorialPrimerRecord {
  identity: PrimerIdentity
  resources: VerifiedPrimerResource[]
  primer?: SavedPrimer
}
export function editorialPrimerPath(identity: PrimerIdentity): string | null {
  if (identity.scope.kind !== 'public') return null
  return `/data/book-primers/${[identity.workId, identity.editionId, identity.language, identity.type === 'book' ? 'book' : identity.unitId!].map(encodeURIComponent).join('/')}.json`
}
export function parseEditorialPrimer(raw: unknown, identity: PrimerIdentity, passages: readonly SourcePassage[]): EditorialPrimerRecord | null {
  try {
    const record = raw as EditorialPrimerRecord
    if (identity.scope.kind !== 'public' || !record || primerKey(record.identity) !== primerKey(identity)) return null
    if (!Array.isArray(record.resources) || record.resources.length > 4 || !record.resources.every(usablePrimerResource)) return null
    let primer: SavedPrimer | undefined
    if (record.primer) {
      const saved = record.primer
      if (!['manual', 'approved'].includes(saved.origin) || primerKey(saved.identity) !== primerKey(identity)
        || !Number.isFinite(Date.parse(saved.createdAt)) || typeof saved.promptVersion !== 'string' || !saved.promptVersion.trim()) return null
      primer = { identity, content: parseGeneratedPrimer(JSON.stringify(saved.content), passages), resources: record.resources,
        origin: saved.origin, createdAt: saved.createdAt, promptVersion: saved.promptVersion }
    }
    return { identity, resources: record.resources, ...(primer ? { primer } : {}) }
  } catch { return null }
}
