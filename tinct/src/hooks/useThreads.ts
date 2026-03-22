import { useState, useEffect, useCallback } from 'react'
import type { ThreadsData, ThreadCharacter, CharacterMention, EditionData } from '../types'

export function useThreads(bookId: string, editionData: EditionData | null) {
  const [threadsData, setThreadsData] = useState<ThreadsData | null>(null)

  useEffect(() => {
    setThreadsData(null)
    const loaders: Record<string, () => Promise<unknown>> = {
      odyssey: () => import('../data/editions/odyssey-threads.json'),
      ulysses: () => import('../data/editions/ulysses-threads.json'),
      'war-and-peace': () => import('../data/editions/war-and-peace-threads.json'),
    }
    const loader = loaders[bookId]
    if (loader) {
      loader()
        .then(m => setThreadsData(((m as Record<string, unknown>).default || m) as unknown as ThreadsData))
        .catch(() => setThreadsData(null))
    }
  }, [bookId])

  const getMentions = useCallback((character: ThreadCharacter, upToChapter?: number): CharacterMention[] => {
    if (!editionData) return []
    const mentions: CharacterMention[] = []
    const chapters = upToChapter
      ? editionData.chapters.filter(c => c.number <= upToChapter)
      : editionData.chapters

    for (const chapter of chapters) {
      for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
        const text = chapter.paragraphs[pi]
        const textLower = text.toLowerCase()
        for (const name of character.searchNames) {
          const idx = textLower.indexOf(name.toLowerCase())
          if (idx !== -1) {
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
