import { useState, useEffect, useCallback } from 'react'
import type { ThreadsData, ThreadCharacter, CharacterMention, EditionData } from '../types'

/**
 * Defers a callback to the browser's idle window. Falls back to a 200ms
 * setTimeout on browsers without requestIdleCallback (most notably Safari
 * <16.4). Returns a cancel function for cleanup.
 */
function scheduleIdle(cb: () => void): () => void {
  if (typeof window === 'undefined') {
    cb()
    return () => { /* noop */ }
  }
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
  const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
  if (typeof ric === 'function') {
    const handle = ric(cb)
    return () => { if (typeof cic === 'function') cic(handle) }
  }
  const handle = window.setTimeout(cb, 200)
  return () => window.clearTimeout(handle)
}

export function useThreads(bookId: string, editionData: EditionData | null) {
  const [threadsData, setThreadsData] = useState<ThreadsData | null>(null)

  // Defer the threads fetch off the critical path. Cast tab is rarely
  // the first thing a reader opens, so trying to land its data while the
  // primary edition is still rendering wastes bandwidth and CPU at the
  // most attention-fragile moment. We wait for `editionData` to be set
  // (a proxy for "primary content has rendered") AND for an idle window
  // before kicking off the fetch. (Phase 4.2.)
  useEffect(() => {
    setThreadsData(null)
    if (!editionData) return
    // Convention-based loader: try /data/editions/{bookId}-threads.json for
    // every book. Avoids the maintenance burden of a hardcoded book→file
    // mapping (which silently dropped 12 books, including The Awakening).
    // 404s are normal for books without threads data — handled by the .catch.
    let cancelled = false
    const cancelIdle = scheduleIdle(() => {
      if (cancelled) return
      fetch(`/data/editions/${bookId}-threads.json?v=${encodeURIComponent(__BUILD_VERSION__)}`)
        .then(r => {
          if (!r.ok) throw new Error(`no threads for ${bookId}`)
          return r.json()
        })
        .then((data: ThreadsData) => {
          if (!cancelled) setThreadsData(data)
        })
        .catch(() => {
          if (!cancelled) setThreadsData(null)
        })
    })
    return () => { cancelled = true; cancelIdle() }
  }, [bookId, editionData])

  const getMentions = useCallback((character: ThreadCharacter, upToChapter?: number): CharacterMention[] => {
    if (!editionData) return []
    const mentions: CharacterMention[] = []
    const chapters = upToChapter
      ? editionData.chapters.filter(c => c.number <= upToChapter)
      : editionData.chapters

    // Word-boundary match \u2014 substring matching falsely flagged "Eve" inside
    // "nevertheless", "Lord" inside "lords", etc.
    const patterns = character.searchNames.map(name => ({
      name,
      re: new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
    }))
    for (const chapter of chapters) {
      for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
        const text = chapter.paragraphs[pi]
        for (const { name, re } of patterns) {
          const m = re.exec(text)
          if (m) {
            const idx = m.index
            const start = Math.max(0, idx - 50)
            const end = Math.min(text.length, idx + name.length + 50)
            let excerpt = text.slice(start, end)
            if (start > 0) excerpt = '\u2026' + excerpt
            if (end < text.length) excerpt = excerpt + '\u2026'
            mentions.push({ chapter: chapter.number, paragraphIndex: pi, excerpt })
            break
          }
        }
      }
    }
    return mentions
  }, [editionData])

  return { threadsData, getMentions }
}
