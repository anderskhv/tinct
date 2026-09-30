import { useEffect, useRef, useState } from 'react'
import { parseContextualLookup, type ContextualLookup } from './contextualLookup'
import { isAiRestingError } from '../../lab/labCompanion'
import { LAB_COPY } from '../../lab/labCopy'

/** An unknown name is resolved in its passage before falling back to a lexical
 * definition. Late answers never replace a newer selection. */
export function DefinitionFallback({ word, request, dictionaryDefinitions }: {
  word: string
  request: (onDelta: (text: string) => void, word: string, intent: 'define') => Promise<string>
  dictionaryDefinitions?: string[]
}) {
  const requestRef = useRef(request)
  requestRef.current = request
  const [answer, setAnswer] = useState<ContextualLookup | null>(null)
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setAnswer(null); setStatus('loading')
    void requestRef.current(() => {}, word, 'define').then(text => {
      const result = parseContextualLookup(text)
      if (!result) throw new Error('Empty or invalid lookup')
      if (active) { setAnswer(result); setStatus('ready') }
    }).catch((error) => { if (active) setStatus(isAiRestingError(error) ? 'resting' : 'error') })
    return () => { active = false }
  }, [word, attempt])
  if (status === 'loading') return <div className="popup-define-status" role="status">Looking up…</div>
  if (status === 'resting') return <div className="popup-define-status">{LAB_COPY.aiResting}</div>
  if (status === 'error') return <div className="popup-define-status">Lookup unavailable. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
  if (answer?.kind === 'person') return <div className="popup-character" data-testid="popup-contextual-character">
    <small>At this passage</small>
    <h2>{answer.name}</h2>
    <small>{answer.importance === 'major' ? 'Major character' : answer.importance === 'minor' ? 'Minor character' : 'Person in this passage'}</small>
    <p className="popup-character-subtitle">{answer.subtitle}</p>
    <p>{answer.body}</p>
  </div>
  return <div className="popup-define-result"><ol className="popup-define-list">{(dictionaryDefinitions?.length ? dictionaryDefinitions : [answer?.definition ?? '']).slice(0, 3).map((definition, index) => <li key={index}>{definition}</li>)}</ol></div>
}
