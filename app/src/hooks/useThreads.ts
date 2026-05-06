import { useState, useEffect, useCallback } from 'react'
import type { ThreadsData, ThreadCharacter, CharacterMention, EditionData } from '../types'

export function useThreads(bookId: string, editionData: EditionData | null) {
  const [threadsData, setThreadsData] = useState<ThreadsData | null>(null)

  useEffect(() => {
    setThreadsData(null)
    // Convention-based loader: try /data/editions/{bookId}-threads.json for
    // every book. Avoids the maintenance burden of a hardcoded book→file
    // mapping (which silently dropped 12 books, including The Awakening).
    // 404s are normal for books without threads data — handled by the .catch.
    let cancelled = false
    fetch(`/data/editions/${bookId}-threads.json`)
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
    return () => { cancelled = true }
  }, [bookId])

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
