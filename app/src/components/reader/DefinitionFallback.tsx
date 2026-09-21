import { useEffect, useRef, useState } from 'react'

/** A missing lexical entry stays in Define. Never label generated text as a
 * dictionary quotation, or let a late result replace a newer lookup. */
export function DefinitionFallback({ word, request }: {
  word: string
  request: (onDelta: (text: string) => void, word: string, intent: 'define') => Promise<string>
}) {
  const requestRef = useRef(request)
  requestRef.current = request
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setAnswer(''); setStatus('loading')
    void requestRef.current(() => {}, word, 'define').then(text => {
      if (!text.trim()) throw new Error('Empty definition')
      if (active) { setAnswer(text.trim()); setStatus('ready') }
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [word, attempt])
  if (status === 'loading') return <div className="popup-define-status" role="status">Looking up…</div>
  if (status === 'error') return <div className="popup-define-status">Definition unavailable. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
  return <div className="popup-define-result"><ol className="popup-define-list"><li>{answer}</li></ol><small className="popup-define-note">AI definition</small></div>
}
