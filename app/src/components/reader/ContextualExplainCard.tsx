import { LabMarkdown } from '../../lab/LabMarkdown'
import { ChatIcon, ReadIcon } from '../../lab/LabReaderIcons'
import { useEffect, useRef, useState } from 'react'

export function ContextualExplainCard({ passage, request, onAsk, onClose }: {
  passage: string
  request: (onDelta: (text: string) => void) => Promise<string>
  onAsk: (answer: string) => void
  onClose: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error'>('loading')
  const [answer, setAnswer] = useState('')
  const [attempt, setAttempt] = useState(0)
  const requestRef = useRef(request)
  requestRef.current = request

  useEffect(() => {
    let active = true
    setStatus('loading')
    setAnswer('')
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
            <LabMarkdown>{answer}</LabMarkdown>
          )}
        </div>
      </div>
      <footer>
        <button type="button" aria-label="Chat about this explanation" title="Chat about this explanation" onClick={() => onAsk(answer)}><ChatIcon /></button>
        <button type="button" aria-label="Back to reading" title="Back to reading" onClick={onClose}><ReadIcon /></button>
      </footer>
    </section>
  )
}
