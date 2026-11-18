/**
 * A Server-Timing header for a route, so where a request's time went can be
 * read in the browser's network panel on production (routes/narration.ts
 * writes its own the same way). Each span is one wait (a database round trip,
 * a group of them run side by side); spans may overlap. `total` is the whole
 * handler. Names and descriptions never carry reader data: only phase names,
 * counts and hit/miss.
 */
export interface ServerTiming {
  /** Times a wait under `name` (a repeated name adds a numbered span). */
  time<T>(name: string, work: Promise<T>): Promise<T>
  /** A note without a duration, e.g. `spec` = "hit". */
  note(name: string, desc: string): void
  header(): string
}

const TOKEN = /^[a-z][a-z0-9-]{0,30}$/

export function serverTiming(clock: () => number = Date.now): ServerTiming {
  const started = clock()
  const spans: Array<{ name: string; dur?: number; desc?: string }> = []
  const unique = (name: string) => {
    const base = TOKEN.test(name) ? name : 'span'
    let candidate = base
    for (let n = 2; spans.some(span => span.name === candidate); n += 1) candidate = `${base}-${n}`
    return candidate
  }
  return {
    time(name, work) {
      const at = clock()
      const span: { name: string; dur?: number } = { name: unique(name) }
      spans.push(span)
      const done = () => { span.dur = clock() - at }
      work.then(done, done)
      return work
    },
    note(name, desc) {
      spans.push({ name: unique(name), desc: desc.replace(/[^A-Za-z0-9 ._/-]/g, '').slice(0, 60) })
    },
    header() {
      const parts = spans.map(span => [span.name, span.dur !== undefined ? `dur=${Math.round(span.dur)}` : null, span.desc ? `desc="${span.desc}"` : null].filter(Boolean).join(';'))
      parts.push(`total;dur=${Math.round(clock() - started)}`)
      return parts.join(', ')
    },
  }
}
