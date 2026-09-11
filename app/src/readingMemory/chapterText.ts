/**
 * Resolve the exact edition chapter text a session's anchors point at.
 * Chapter-sharded editions live under
 * `/data/editions-chapters/{bookId}-{editionKey}/chNNNN.json`; editions that
 * are not sharded fall back to the whole-book `/data/editions/{book}-{edition}.json`.
 */
export interface ResolvedChapterText {
  title: string
  paragraphs: string[]
}

type FetchLike = (input: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>

export function chapterShardPath(chapterNumber: number): string {
  return `ch${String(chapterNumber).padStart(4, '0')}.json`
}

function paragraphsOf(value: unknown): string[] | null {
  if (!value || typeof value !== 'object') return null
  const paragraphs = (value as { paragraphs?: unknown }).paragraphs
  if (!Array.isArray(paragraphs)) return null
  const clean = paragraphs.filter((item): item is string => typeof item === 'string')
  return clean.length > 0 ? clean : null
}

function titleOf(value: unknown, fallback: string): string {
  const title = (value as { title?: unknown } | null)?.title
  return typeof title === 'string' && title.trim() ? title : fallback
}

export async function loadChapterText(input: {
  bookId: string
  editionKey: string
  chapterNumber: number
  fetchImpl?: FetchLike
  version?: string
}): Promise<ResolvedChapterText | null> {
  const fetchImpl = input.fetchImpl ?? (typeof fetch === 'function' ? (url: string) => fetch(url) : null)
  if (!fetchImpl) return null
  const suffix = input.version ? `?v=${encodeURIComponent(input.version)}` : ''
  const fallbackTitle = `Chapter ${input.chapterNumber}`
  const shard = `/data/editions-chapters/${input.bookId}-${input.editionKey}/${chapterShardPath(input.chapterNumber)}${suffix}`
  try {
    const res = await fetchImpl(shard)
    if (res.ok) {
      const data = await res.json()
      const paragraphs = paragraphsOf(data)
      if (paragraphs) return { title: titleOf(data, fallbackTitle), paragraphs }
    }
  } catch { /* fall through to the whole-book edition */ }
  try {
    const res = await fetchImpl(`/data/editions/${input.bookId}-${input.editionKey}.json${suffix}`)
    if (!res.ok) return null
    const data = await res.json() as { chapters?: unknown }
    if (!Array.isArray(data?.chapters)) return null
    const chapter = data.chapters.find(item => (item as { number?: unknown })?.number === input.chapterNumber)
    const paragraphs = paragraphsOf(chapter)
    if (!paragraphs) return null
    return { title: titleOf(chapter, fallbackTitle), paragraphs }
  } catch {
    return null
  }
}
