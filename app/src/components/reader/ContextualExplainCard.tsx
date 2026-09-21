import { LabMarkdown } from '../../lab/LabMarkdown'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'
import { useEffect, useRef, useState } from 'react'

/** The opener is everything before the first blank line; the rest waits
 *  behind "More". A one-paragraph answer has no rest and no More. */
export function splitExplanation(text: string): { opener: string; rest: string } {
  const boundary = text.indexOf('\n\n')
  if (boundary < 0) return { opener: text, rest: '' }
  return { opener: text.slice(0, boundary), rest: text.slice(boundary + 2).trim() }
}

export function ContextualExplainCard({ passage, request, onAsk, onTalk, onReady, onClose, onHighlight }: {
  passage: string
  request: (onDelta: (text: string) => void) => Promise<string>
  onReady?: (answer: string) => void
  onAsk: (answer: string) => void
  onTalk?: (answer: string) => void
  onHighlight?: () => void
  onClose?: () => void
}) {
  const [status, setStatus] = useState<'loading' | 'streaming' | 'ready' | 'error'>('loading')
  const [expanded, setExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [attempt, setAttempt] = useState(0)
  const readyRef = useRef(onReady)
  readyRef.current = onReady
  const requestRef = useRef(request)
  requestRef.current = request

  useEffect(() => {
    const record = readyRef.current
    let active = true
    let shown = ''
    let recorded = false
    setStatus('loading')
    setAnswer('')
    setExpanded(false)
    void requestRef.current((text) => {
      if (!active) return
      // Reveal complete paragraphs; subsequent paragraphs arrive below the first.
      const boundary = text.lastIndexOf('\n\n')
      if (boundary > 0) { shown = text.slice(0, boundary); setAnswer(shown); setStatus('streaming') }
    }).then((text) => {
      if (!active) return
      setAnswer(text)
      setStatus('ready')
      recorded = true
      record?.(text)
    }).catch(() => {
      if (active) setStatus('error')
    })
    return () => { active = false; if (!recorded && shown) record?.(shown) }
  }, [attempt, passage])

  const { opener, rest } = splitExplanation(answer)
  const streaming = status === 'streaming'
  // More stays while the rest may still arrive; a finished one-paragraph
  // answer has nothing behind it and shows no More at all.
  const hasMore = rest.length > 0 || streaming
  const busy = streaming && !rest

  return (
    <section className={`lab-contextual-explain${expanded ? ' is-expanded' : ''}`} aria-label="Explanation">
      <header className="lab-reader-window-head" data-reader-window-handle>
        <span className="lab-reader-window-title">Explanation</span>
        {hasMore && <button type="button" className="lab-window-control" aria-label={expanded ? 'Collapse explanation' : 'Expand explanation'} aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" /></svg>
        </button>}
        {onClose && <button type="button" className="lab-window-control" aria-label="Close explanation" onClick={onClose}>×</button>}
      </header>
      <div className="lab-contextual-explain-scroll">
        <div role="status" aria-live="polite" aria-busy={status === 'loading' || streaming}>
          {status === 'loading' && (
            <div className="lab-contextual-explain-skeleton" aria-label="Loading explanation">
              <span /><span /><span />
            </div>
          )}
          {status === 'error' && (
            <>
              <p>The explanation couldn’t be loaded. Your passage is still here.</p>
              <button type="button" className="lab-contextual-explain-link" onClick={() => setAttempt(value => value + 1)}>Try again</button>
            </>
          )}
          {(streaming || status === 'ready') && (
            <>
              <LabMarkdown>{expanded && rest ? `${opener}\n\n${rest}` : opener}</LabMarkdown>
              {hasMore && (
                <button
                  type="button"
                  className={`lab-contextual-explain-more${busy ? ' is-busy' : ''}`}
                  aria-expanded={expanded}
                  onClick={() => setExpanded(value => !value)}
                >
                  {expanded ? 'Less' : 'More'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <footer>
        {onHighlight && <button className="lab-contextual-explain-tool" type="button" aria-label="Highlight this passage" onClick={onHighlight}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 15 10-10 4 4L9 19H5zM4 22h16" /></svg>
        </button>
        <button className="lab-contextual-explain-tool" type="button" aria-label="Chat about this explanation" onClick={() => onAsk(answer)} disabled={!answer}>
          <RowIcon id="chat" />
        </button>
        {onTalk && <button className="lab-contextual-explain-tool" type="button" aria-label="Talk about this explanation" onClick={() => onTalk(answer)} disabled={!answer}>
          <RowIcon id="talk" />
        </button>}
      </footer>
    </section>
  )
}
