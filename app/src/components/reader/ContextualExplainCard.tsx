import { useEffect, useRef, useState } from 'react'

export function ContextualExplainCard({ passage, request, onAsk, onClose }: {
  passage: string
  request: (onDelta: (text: string) => void) => Promise<string>
  onAsk: () => void
  onClose: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error'>('loading')
  const [answer, setAnswer] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const requestRef = useRef(request)
  requestRef.current = request

  useEffect(() => {
    let active = true
    setStatus('loading')
    setAnswer('')
    setExpanded(false)
    void requestRef.current((text) => {
      if (!active) return
      setAnswer(text)
      setStatus('streaming')
    }).then((text) => {
      if (!active) return
      setAnswer(text)
      setStatus('ready')
    }).catch(() => {
      if (active) setStatus('error')
    })
    return () => { active = false }
  }, [attempt, passage])

  const canExpand = answer.length > 420
  return (
    <section className="lab-contextual-explain" aria-label="Explanation">
      <div className="lab-contextual-explain-scroll">
        <blockquote>{passage}</blockquote>
        <div role="status" aria-live="polite" aria-busy={status === 'loading' || status === 'streaming'}>
          {status === 'loading' && <p className="lab-contextual-explain-wait">Finding the meaning in this passage…</p>}
          {status === 'error' && (
            <>
              <p>The explanation couldn’t be loaded. Your passage is still here.</p>
              <button type="button" className="lab-contextual-explain-link" onClick={() => setAttempt(value => value + 1)}>Try again</button>
            </>
          )}
          {(status === 'streaming' || status === 'ready') && (
            <p className={`lab-contextual-explain-answer${canExpand && !expanded ? ' is-collapsed' : ''}`}>{answer}</p>
          )}
        </div>
        {status === 'ready' && canExpand && (
          <button type="button" className="lab-contextual-explain-link" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
            {expanded ? 'Show less' : 'A little more'}
          </button>
        )}
      </div>
      <footer>
        <button type="button" onClick={onAsk}>Ask a follow-up <span aria-hidden="true">↗</span></button>
        <button type="button" onClick={onClose}>Back to reading</button>
      </footer>
    </section>
  )
}
