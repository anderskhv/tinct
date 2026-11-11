import { useCallback, useEffect, useRef, useState } from 'react'
import { loadLabBookSource } from '../labSource'

export interface BookScrollChapterText { title: string; paragraphs: string[] }

/**
 * The text of the chapters around the reader's own, for book scroll (try-out). Each is loaded
 * through the reader's one source loader, so a neighbour's paragraphs are exactly what the reader
 * gets when that chapter becomes its own. Nothing is requested while `enabled` is false.
 */
export function useBookScrollChapters(enabled: boolean, bookId: string, editionKey: string): {
  texts: ReadonlyMap<number, BookScrollChapterText>
  request: (numbers: readonly number[]) => void
} {
  const scope = `${bookId}/${editionKey}`
  const [state, setState] = useState<{ scope: string; texts: Map<number, BookScrollChapterText> }>(() => ({ scope, texts: new Map() }))
  const scopeRef = useRef(scope)
  scopeRef.current = scope
  const pending = useRef(new Set<string>())
  useEffect(() => { pending.current.clear() }, [scope])
  const texts = state.scope === scope ? state.texts : EMPTY
  const textsRef = useRef(texts)
  textsRef.current = texts
  const request = useCallback((numbers: readonly number[]) => {
    if (!enabled) return
    for (const number of numbers) {
      const key = `${scope}/${number}`
      if (textsRef.current.has(number) || pending.current.has(key)) continue
      pending.current.add(key)
      void loadLabBookSource({ readingFirst: true, bookId, chapterNumber: number, primaryEditionKey: editionKey })
        .then((loaded) => {
          if (scopeRef.current !== scope || loaded.chapterNumber !== number || !loaded.paragraphs.length) return
          setState((previous) => {
            const base = previous.scope === scope ? previous.texts : new Map<number, BookScrollChapterText>()
            if (base.has(number)) return previous.scope === scope ? previous : { scope, texts: base }
            const next = new Map(base)
            next.set(number, { title: loaded.chapterTitle, paragraphs: loaded.paragraphs })
            return { scope, texts: next }
          })
        })
        .catch(() => {})
        .finally(() => { pending.current.delete(key) })
    }
  }, [enabled, scope, bookId, editionKey])
  return { texts, request }
}

const EMPTY: ReadonlyMap<number, BookScrollChapterText> = new Map()
