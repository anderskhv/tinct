import { useCallback, useRef, useState } from 'react'
import { lookup as dictLookup } from '../../services/dictionary'
import type { DictResult } from '../../services/dictionary'
import { isSingleWordSelection, normalizeSelectionText } from './selectionPopupMode'

// Dictionary "Define" popup state, extracted from Reader.tsx (slice 4).
// Owns only the define panel's state + lookups; the popup mode/visibility and
// the selection it reads from stay in Reader.

export interface UseDefine {
  query: string
  setQuery: (q: string) => void
  result: DictResult | null
  loading: boolean
  notFound: boolean
  /** Open define for freshly-selected text: single word looks up immediately,
   *  a multi-word phrase seeds an editable empty query. */
  begin: (rawText: string) => void
  /** Look up an explicit query (Enter/blur in the panel). */
  run: (q: string) => void
}

export function useDefine(): UseDefine {
  const requestId = useRef(0)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<DictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const run = useCallback((q: string) => {
    const id = ++requestId.current
    const trimmed = normalizeSelectionText(q)
    if (!trimmed) {
      setLoading(false)
      setResult(null)
      setNotFound(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    dictLookup(trimmed).then(res => {
      if (id !== requestId.current) return
      setLoading(false)
      setResult(res)
      setNotFound(!res)
    })
  }, [])

  const begin = useCallback((rawText: string) => {
    const raw = normalizeSelectionText(rawText)
    const single = isSingleWordSelection(raw)
    setQuery(single ? raw : '')
    setResult(null)
    setNotFound(false)
    if (single) run(raw)
    else { requestId.current++; setLoading(false) }
  }, [run])

  return { query, setQuery, result, loading, notFound, begin, run }
}
