import { useEffect, useRef, useState } from 'react'
import { parseContextualLookup, parsePartialContextualLookup, type PartialContextualLookup } from './contextualLookup'
import { isAiRestingError } from '../../lab/labCompanion'
import { LAB_COPY } from '../../lab/labCopy'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'

/** An unknown name is resolved in its passage before falling back to a lexical
 * definition. Late answers never replace a newer selection. */
export function DefinitionFallback({ word, request, dictionaryDefinitions, onChat, onTalk }: {
  word: string
  request: (onDelta: (text: string) => void, word: string, intent: 'define') => Promise<string>
  /** Dictionary senses; undefined while the dictionary is still loading. */
  dictionaryDefinitions?: string[]
  /** Chat / Talk about a person or place card, as Explain does with its answer. */
  onChat?: (text: string) => void
  onTalk?: (text: string) => void
}) {
  const requestRef = useRef(request)
  requestRef.current = request
  const [answer, setAnswer] = useState<PartialContextualLookup | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'resting' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setAnswer(null); setStatus('loading')
    // The card fills in as the answer streams, like Explain (Anders, 2026-10-06).
    void requestRef.current(text => { if (active) setAnswer(current => parsePartialContextualLookup(text) ?? current) }, word, 'define').then(text => {
      const result = parseContextualLookup(text)
      if (!result) throw new Error('Empty or invalid lookup')
      if (active) { setAnswer(result); setStatus('ready') }
    }).catch((error) => { if (active) setStatus(isAiRestingError(error) ? 'resting' : 'error') })
    return () => { active = false }
  }, [word, attempt])
  // An ordinary lower-case word shows its dictionary senses at once; a name
  // waits for the passage to say who or what it is.
  const dictionaryFirst = !!dictionaryDefinitions?.length && !/^\p{Lu}/u.test(word.trim())
  if (answer?.kind === 'person') {
    const done = status === 'ready'
    return <div className="popup-character" data-testid="popup-contextual-character" aria-busy={!done}>
      <small>{answer.importance === 'major' ? 'Major character' : answer.importance === 'minor' ? 'Minor character' : answer.importance === 'uncertain' ? 'Person in this passage' : '\u00a0'}</small>
      {answer.subtitle && <p className="popup-character-subtitle">{answer.subtitle}</p>}
      {answer.body && <p>{answer.body}</p>}
      {done && actions(personText(answer as PersonCard), answer.name, onChat, onTalk)}
    </div>
  }
  if (answer?.kind === 'place') {
    const done = status === 'ready'
    return <div className="popup-character popup-place" data-testid="popup-contextual-place" aria-busy={!done}>
      <small>Place</small>
      {answer.description && <p className="popup-character-subtitle">{answer.description}</p>}
      {done && actions(`${answer.name}: ${answer.description}`, answer.name, onChat, onTalk)}
    </div>
  }
  if (dictionaryFirst || (status === 'ready' && answer?.kind === 'definition')) {
    return <div className="popup-define-result"><ol className="popup-define-list">{(dictionaryDefinitions?.length ? dictionaryDefinitions : [answer?.kind === 'definition' ? answer.definition : '']).slice(0, 3).map((definition, index) => <li key={index}>{definition}</li>)}</ol></div>
  }
  if (status === 'resting') return <div className="popup-define-status">{LAB_COPY.aiResting}</div>
  if (status === 'error') return dictionaryDefinitions?.length
    ? <div className="popup-define-result"><ol className="popup-define-list">{dictionaryDefinitions.slice(0, 3).map((definition, index) => <li key={index}>{definition}</li>)}</ol></div>
    : <div className="popup-define-status">Lookup unavailable. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
  return <div className="popup-define-status" role="status">Looking up…</div>
}

type PersonCard = { name: string; subtitle: string; body: string }

function actions(text: string, name: string, onChat?: (text: string) => void, onTalk?: (text: string) => void) {
  if (!onChat && !onTalk) return null
  return <footer className="lab-person-actions">
    {onChat && <button className="lab-contextual-explain-tool" type="button" aria-label={`Chat about ${name}`} onClick={() => onChat(text)}><RowIcon id="chat" /></button>}
    {onTalk && <button className="lab-contextual-explain-tool" type="button" aria-label={`Talk about ${name}`} onClick={() => onTalk(text)}><RowIcon id="talk" /></button>}
  </footer>
}

function personText(person: PersonCard): string {
  return `${person.name}: ${person.subtitle}\n\n${person.body}`
}
