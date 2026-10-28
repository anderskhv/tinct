import { editorialPrimerPath, parseEditorialPrimer, type EditorialPrimerRecord } from '../../bookPrimers/editorial'
import type { PrimerSource } from '../../bookPrimers/prompt'
import type { AssetsBinding } from './bookRetrieval'

/** Only the deployed repository assets can supply public editorial overrides. */
export async function loadEditorialPrimer(assets: AssetsBinding, origin: string, source: PrimerSource): Promise<EditorialPrimerRecord | null> {
  const path = editorialPrimerPath(source.identity)
  if (!path) return null
  try {
    const response = await assets.fetch(new Request(new URL(path, origin)))
    if (!response.ok || !response.body) return null
    const reader = response.body.getReader(), decoder = new TextDecoder()
    let raw = '', bytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > 150_000) { await reader.cancel(); return null }
        raw += decoder.decode(value, { stream: true })
      }
      raw += decoder.decode()
    } finally { reader.releaseLock() }
    return parseEditorialPrimer(JSON.parse(raw), source.identity, source.passages)
  } catch { return null }
}
