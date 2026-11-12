import { useEffect, useRef, useState } from 'react'
import { parseContextualLookup, parsePartialContextualLookup, splitDefinition, type PartialContextualLookup } from './contextualLookup'
import { isAiRestingError } from '../../lab/labCompanion'
import { LAB_COPY } from '../../lab/labCopy'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'
import type { NamesakeNotice } from '../../services/characters/characterCards'

/** An unknown name is resolved in its passage before falling back to a lexical
 * definition. Late answers never replace a newer selection. */
export function DefinitionFallback({ word, request, dictionaryDefinitions, onChat, onTalk, namesakes, onPartOfSpeech }: {
  word: string
  /**
   * The card's title shows the part of speech after the word ("tetrarch (noun)", Anders, 12 Nov 2026): called with
   * the definition's part of speech, or '' when there is none to show. The body then leaves it out.
   */
  onPartOfSpeech?: (pos: string) => void
  /**
   * Conflicting reviewed links claim this exact tapped span: show only those
   * candidates. Unlinked names use the contextual request below.
   */
  namesakes?: NamesakeNotice
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
  const shared = namesakes && namesakes.name === word.trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').replace(/[’']s$/, '') ? namesakes : null
  useEffect(() => {
    if (shared) return
    let active = true
    setAnswer(null); setStatus('loading')
    // The card fills in as the answer streams, like Explain (Anders, 2026-10-06).
    void requestRef.current(text => { if (active) setAnswer(current => parsePartialContextualLookup(text) ?? current) }, word, 'define').then(text => {
      const result = parseContextualLookup(text)
      if (!result) throw new Error('Empty or invalid lookup')
      if (active) { setAnswer(result); setStatus('ready') }
    }).catch((error) => { if (active) setStatus(isAiRestingError(error) ? 'resting' : 'error') })
    return () => { active = false }
  }, [word, attempt, shared])
  // An ordinary lower-case word shows its dictionary senses at once; a name
  // waits for the passage to say who or what it is.
  const dictionaryFirst = !!dictionaryDefinitions?.length && (!/^\p{Lu}/u.test(word.trim()) || (status === 'ready' && answer?.kind === 'definition'))
  const shown = answer?.kind === 'person' || answer?.kind === 'place' || dictionaryFirst || (status === 'ready' && answer?.kind === 'definition')
  const pos = shown && !dictionaryFirst && answer?.kind === 'definition' && !shared ? splitDefinition(answer.definition).pos : ''
  const posRef = useRef(onPartOfSpeech)
  posRef.current = onPartOfSpeech
  useEffect(() => { posRef.current?.(pos) }, [pos])
  useEffect(() => () => posRef.current?.(''), [])
  if (shared) return <div className="popup-character popup-namesakes" data-testid="popup-namesakes">
    <p className="popup-character-subtitle">Several people are called {shared.name} in this book.</p>
    <ul className="popup-character-gallery popup-namesakes-list">{shared.candidates.map(card => <li key={card.id}><strong>{card.name}</strong>{card.subtitle && <span>{card.subtitle}</span>}</li>)}</ul>
  </div>
  if (shown)
    return <ContextualLookupView answer={answer} ready={status === 'ready'} dictionaryDefinitions={dictionaryFirst ? dictionaryDefinitions : undefined} onChat={onChat} onTalk={onTalk} posInTitle={!!onPartOfSpeech} />
  if (status === 'resting') return <div className="popup-define-status">{LAB_COPY.aiResting}</div>
  if (status === 'error') return dictionaryDefinitions?.length
    ? <ContextualLookupView answer={null} dictionaryDefinitions={dictionaryDefinitions} />
    : <div className="popup-define-status">Lookup unavailable. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
  return <div className="popup-define-status" role="status" aria-busy="true">Looking up…</div>
}

/** A card's headword over its definition, with the part of speech after the word: "tetrarch (noun)" (the phone card). */
export function DefinitionWithHeadword({ headword, className, ...props }: Parameters<typeof DefinitionFallback>[0] & { headword?: string; className: string }) {
  const [pos, setPos] = useState('')
  return <>
    {headword && <p className={className}>{headword}{pos && <span className="popup-define-pos"> ({pos})</span>}</p>}
    <DefinitionFallback {...props} onPartOfSpeech={setPos} />
  </>
}

/** The same already-resolved contextual card in a passage popup or a saved original-page card. */
export function ContextualLookupView({ answer, ready = true, dictionaryDefinitions, onChat, onTalk, posInTitle = false }: {
  answer: PartialContextualLookup | null
  ready?: boolean
  /** The title already shows the part of speech ("tetrarch (noun)"); a saved card without one shows it here. */
  posInTitle?: boolean
  dictionaryDefinitions?: string[]
  onChat?: (text: string) => void
  onTalk?: (text: string) => void
}) {
  if (answer?.kind === 'person') return <div className="popup-character" data-testid="popup-contextual-character" aria-busy={!ready}>
    <small>{answer.importance === 'major' ? 'Major character' : answer.importance === 'minor' ? 'Minor character' : answer.importance === 'uncertain' ? 'Person in this passage' : '\u00a0'}</small>
    {answer.subtitle && <p className="popup-character-subtitle">{answer.subtitle}</p>}
    {answer.body && <p>{answer.body}</p>}
    {ready && actions(personText(answer as PersonCard), answer.name, onChat, onTalk)}
  </div>
  if (answer?.kind === 'place') return <div className="popup-character popup-place" data-testid="popup-contextual-place" aria-busy={!ready}>
    <small>Place</small>
    {answer.description && <p className="popup-character-subtitle">{answer.description}</p>}
    {ready && actions(`${answer.name}: ${answer.description}`, answer.name, onChat, onTalk)}
  </div>
  const definitions = dictionaryDefinitions?.length ? dictionaryDefinitions : answer?.kind === 'definition' ? [answer.definition] : []
  if (!definitions.length) return null
  // Senses are numbered only when there are several (Anders, 12 Nov 2026: "1. Noun." on a word with one sense).
  if (definitions.length > 1) return <div className="popup-define-result"><ol className="popup-define-list">{definitions.slice(0, 3).map((definition, index) => <li key={index}>{definition}</li>)}</ol></div>
  const { label, sense, here } = splitDefinition(definitions[0])
  // A card without a headword (a saved one) keeps the part of speech where the answer wrote it.
  return <div className="popup-define-result" data-testid="popup-define-single">
    <p className="popup-define-list popup-define-sense">{posInTitle ? sense : `${label}${sense}`}</p>
    {here && <p className="popup-define-list popup-define-here">{here}</p>}
  </div>
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
