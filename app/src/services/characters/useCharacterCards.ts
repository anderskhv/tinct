import { useEffect, useState } from 'react'
import { loadCharacters, type VerifiedCharacters } from './characterCards'
/** Preload only. An asset arriving late must never replace an open selection. */
export function useCharacterCards(bookId?: string, editionKey?: string) {
  const [loaded, setLoaded] = useState<{ key: string; data: VerifiedCharacters | null } | null>(null)
  const key = `${bookId}:${editionKey}`
  useEffect(() => {
    let current = true
    void loadCharacters(bookId, editionKey).then(data => { if (current) setLoaded({ key, data }) })
    return () => { current = false }
  }, [key, bookId, editionKey])
  return loaded?.key === key ? loaded.data : null
}
