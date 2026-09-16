import { LabMarkdown } from '../../lab/LabMarkdown'
import { VoiceExpandIcon } from '../../lab/LabVoiceIcons'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'
import { useEffect, useRef, useState } from 'react'

export function ContextualExplainCard({ passage, request, onAsk, onTalk }: {
  passage: string
  request: (onDelta: (text: string) => void) => Promise<string>
  onAsk: (answer: string) => void
  onTalk?: (answer: string) => void
  onClose?: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error'>('loading')
  const [expanded, setExpanded] = useState(false)
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
      // Reveal complete paragraphs; subsequent paragraphs arrive below the first.
      const boundary = text.lastIndexOf('\n\n')
      if (boundary > 0) { setAnswer(text.slice(0, boundary)); setStatus('streaming') }
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
    <section className={`lab-contextual-explain${expanded ? ' is-expanded' : ''}`} aria-label="Explanation">
      <div className="lab-contextual-explain-heading">
        <button type="button" aria-label={expanded ? 'Collapse explanation' : 'Expand explanation'} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
          <VoiceExpandIcon size={16} /><span>{expanded ? 'Reduce' : 'Expand'}</span>
        </button>
      </div>
      <div className="lab-contextual-explain-scroll">
        <div role="status" aria-live="polite" aria-busy={status === 'loading' || status === 'streaming'}>
          {status === 'loading' && <p className="lab-contextual-explain-wait">Loading…</p>}
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
        <button className="lab-super-row" type="button" aria-label="Chat about this explanation" onClick={() => onAsk(answer)} disabled={!answer}>
          <span className="lab-super-row-icon"><RowIcon id="chat" /></span><span className="lab-super-row-label">Chat</span>
        </button>
        {onTalk && <button className="lab-super-row" type="button" aria-label="Talk about this explanation" onClick={() => onTalk(answer)} disabled={!answer}>
          <span className="lab-super-row-icon"><RowIcon id="talk" /></span><span className="lab-super-row-label">Talk</span>
        </button>}
      </footer>
    </section>
  )
}
