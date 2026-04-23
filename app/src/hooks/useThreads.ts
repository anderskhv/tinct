import { useState, useEffect, useCallback } from 'react'
import type { ThreadsData, ThreadCharacter, CharacterMention, EditionData } from '../types'

export function useThreads(bookId: string, editionData: EditionData | null) {
  const [threadsData, setThreadsData] = useState<ThreadsData | null>(null)

  useEffect(() => {
    setThreadsData(null)
    const loaders: Record<string, () => Promise<ThreadsData>> = {
      odyssey: () => fetch('/data/editions/odyssey-threads.json').then(r => r.json()),
      ulysses: () => fetch('/data/editions/ulysses-threads.json').then(r => r.json()),
      'war-and-peace': () => fetch('/data/editions/war-and-peace-threads.json').then(r => r.json()),
      bible: () => fetch('/data/editions/bible-threads.json').then(r => r.json()),
      gilgamesh: () => fetch('/data/editions/gilgamesh-threads.json').then(r => r.json()),
      hamlet: () => fetch('/data/editions/hamlet-threads.json').then(r => r.json()),
      macbeth: () => fetch('/data/editions/macbeth-threads.json').then(r => r.json()),
      midsummer: () => fetch('/data/editions/midsummer-threads.json').then(r => r.json()),
      'romeo-and-juliet': () => fetch('/data/editions/romeo-and-juliet-threads.json').then(r => r.json()),
      'the-tempest': () => fetch('/data/editions/the-tempest-threads.json').then(r => r.json()),
      'pride-and-prejudice': () => fetch('/data/editions/pride-and-prejudice-threads.json').then(r => r.json()),
      'crime-and-punishment': () => fetch('/data/editions/crime-and-punishment-threads.json').then(r => r.json()),
      'the-republic': () => fetch('/data/editions/the-republic-threads.json').then(r => r.json()),
      'divine-comedy': () => fetch('/data/editions/divine-comedy-threads.json').then(r => r.json()),
      'jane-eyre': () => fetch('/data/editions/jane-eyre-threads.json').then(r => r.json()),
      'the-aeneid': () => fetch('/data/editions/the-aeneid-threads.json').then(r => r.json()),
      'paradise-lost': () => fetch('/data/editions/paradise-lost-threads.json').then(r => r.json()),
      frankenstein: () => fetch('/data/editions/frankenstein-threads.json').then(r => r.json()),
    }
    const loader = loaders[bookId]
    if (loader) {
      loader()
        .then(data => setThreadsData(data))
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
