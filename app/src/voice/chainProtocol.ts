/** Transport helpers shared by the preview and its deterministic tests. */
export async function readEvents(body: ReadableStream<Uint8Array>, receive: (event: any) => void) {
  const reader = body.getReader(), decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n')
      let end: number
      while ((end = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, end); buffer = buffer.slice(end + 2)
        const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n')
        if (data && data !== '[DONE]') receive(JSON.parse(data))
      }
      if (done) break
      if (buffer.length > 1_000_000) throw new Error('Voice event exceeded the stream limit.')
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
}

export function spokenText(text: string) {
  return text.replace(/【[^】]*】|[^]*/g, '').replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '').replace(/[*#_]/g, '').replace(/\s+/g, ' ').trim()
}
/** Wait for punctuation AND a following space, so fragmented tokens remain intact. */
export function takeThought(buffer: string, final = false): { text: string; rest: string } | null {
  for (const match of buffer.matchAll(/[.!?]["”']?(?=\s)/g)) {
    const end = match.index! + match[0].length
    const candidate = buffer.slice(0, end)
    if (/\b(?:Mr|Mrs|Ms|Dr|St|Prof|vs|e\.g|i\.e)\.$/i.test(candidate) || /\b[A-Z]\.$/.test(candidate)) continue
    if (candidate.trim().length < 25) continue
    return { text: spokenText(candidate), rest: buffer.slice(end).trimStart() }
  }
  // A very long sentence can start at a clause boundary without waiting for a paragraph.
  if (buffer.length > 360) {
    const cut = buffer.slice(100, 360).search(/[;:—]\s/)
    if (cut >= 0) return { text: spokenText(buffer.slice(0, cut + 101)), rest: buffer.slice(cut + 101).trimStart() }
  }
  return final && buffer.trim() ? { text: spokenText(buffer), rest: '' } : null
}
const normalized = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim()
export function retainsPendingQuestion(text: string, pending: string) {
  const value = normalized(text)
  return value === normalized(pending) || /^(?:are you )?(?:still (?:looking|there|working|searching|thinking)|any (?:news|update|updates)|did you find (?:it|anything)|have you found (?:it|anything)|is it ready)(?: yet)?$/.test(value)
}
export function sourceLinks(annotations: any[]): string {
  const seen = new Set<string>()
  return annotations.flatMap(a => {
    if (a?.type !== 'url_citation' || typeof a.url !== 'string') return []
    let url: URL
    try { url = new URL(a.url) } catch { return [] }
    if (!['https:', 'http:'].includes(url.protocol) || seen.has(url.href)) return []
    seen.add(url.href)
    const title = String(a.title || url.hostname).replace(/[[\]\r\n]/g, ' ').slice(0, 200)
    return ['[' + title + '](' + url.href.replace(/[()]/g, c => encodeURIComponent(c)) + ')']
  }).slice(0, 6).join('\n')
}
