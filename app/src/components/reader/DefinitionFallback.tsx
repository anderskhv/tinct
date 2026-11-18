import { useEffect, useRef, useState } from 'react'
import { parseContextualLookup, parsePartialContextualLookup, splitDefinition, type PartialContextualLookup } from './contextualLookup'
import { isAiRestingError } from '../../lab/labCompanion'
import { LAB_COPY } from '../../lab/labCopy'
import { RowIcon } from '../../lab/LabSuperMenu.tsx'
import type { NamesakeNotice } from '../../services/characters/characterCards'

/** An unknown name is resolved in its passage before falling back to a lexical
 * definition. Late answers never replace a newer selection. */
export function DefinitionFallback({ word, request, dictionaryDefinitions, onChat, onTalk, namesakes, onHeadwordLabel }: {
  word: string
  /**
   * The card's title carries what the word is after it: "sepulchre · Noun", "Joanna · Minor character",
   * "Galilee · Place" (Anders, 17 Nov 2026). Called with that label, or '' when there is none to show; the body
   * then leaves it out.
   */
  onHeadwordLabel?: (label: string) => void
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
  const shared = namesakes && namesakes.name === trimHeadword(word) ? namesakes : null
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
  const label = shown && !shared ? headwordLabel(answer, dictionaryFirst) : ''
  const labelRef = useRef(onHeadwordLabel)
  labelRef.current = onHeadwordLabel
  useEffect(() => { labelRef.current?.(label) }, [label])
  useEffect(() => () => labelRef.current?.(''), [])
  if (shared) return <div className="popup-character popup-namesakes" data-testid="popup-namesakes">
    <p className="popup-character-subtitle">Several people are called {shared.name} in this book.</p>
    <ul className="popup-character-gallery popup-namesakes-list">{shared.candidates.map(card => <li key={card.id}><strong>{card.name}</strong>{card.subtitle && <span>{card.subtitle}</span>}</li>)}</ul>
  </div>
  if (shown)
    return <ContextualLookupView answer={answer} ready={status === 'ready'} dictionaryDefinitions={dictionaryFirst ? dictionaryDefinitions : undefined} onChat={onChat} onTalk={onTalk} labelInTitle={!!onHeadwordLabel} />
  if (status === 'resting') return <div className="popup-define-status">{LAB_COPY.aiResting}</div>
  if (status === 'error') return dictionaryDefinitions?.length
    ? <ContextualLookupView answer={null} dictionaryDefinitions={dictionaryDefinitions} />
    : <div className="popup-define-status">Lookup unavailable. <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>
  return <div className="popup-define-status" role="status" aria-busy="true">Looking up…</div>
}

const ROLE_LABELS = { major: 'Major character', minor: 'Minor character', uncertain: 'Person in this passage' } as const

/**
 * What the looked-up word is, for its headword line: a person's role, "Place", or a definition's part of speech in
 * sentence case ("Noun", "Verb (archaic)"). '' when there is nothing to say: dictionary senses carry no part of speech.
 */
export function headwordLabel(answer: PartialContextualLookup | null, dictionaryFirst = false): string {
  if (answer?.kind === 'person') return answer.importance ? ROLE_LABELS[answer.importance] ?? '' : ''
  if (answer?.kind === 'place') return 'Place'
  if (answer?.kind !== 'definition' || dictionaryFirst) return ''
  const { pos } = splitDefinition(answer.definition)
  return pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : ''
}

/**
 * The label after a headword: " · Noun". The space before it lets the label wrap below the word; the separator and
 * the label stay together as one unit (Anders, 17 Nov 2026). The label is its own element, so it reads as itself.
 */
export function HeadwordLabel({ label }: { label: string }) {
  return label ? <> <span className="popup-define-pos"><span className="popup-define-sep" aria-hidden="true">·</span> <span>{label}</span></span></> : null
}

/** A looked-up selection as its headword: no surrounding punctuation, no possessive ("Joanna," → "Joanna", "Peter’s" → "Peter"). */
export function trimHeadword(selection: string): string {
  return selection.trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').replace(/[’']s$/, '')
}

/**
 * The headword over a saved Define card's first answer (the desktop margin and notebook, Anders, 18 Nov 2026): a
 * person's or place's own name, else the selected word. A selection of several words that is not a person or place
 * has none, and its card keeps the label in the body, as the phone's does.
 */
export function savedDefineHeadword(selection: string, answer: PartialContextualLookup | null): string {
  if (!answer) return ''
  const word = trimHeadword(selection)
  const single = /\s/.test(word) ? '' : word
  return (answer.kind === 'person' || answer.kind === 'place') ? answer.name.trim() || single : single
}

/**
 * A saved Define card's answer. The first carries the headword with what it is after it ("Joanna · Minor character",
 * "sepulchre · Noun"), so its body leaves that label out; a follow-up answer reads as it always has.
 */
export function SavedDefineAnswer({ selection, content, first }: { selection: string; content: string; first: boolean }) {
  const answer = parseContextualLookup(content)
  const headword = first ? savedDefineHeadword(selection, answer) : ''
  if (!headword) return <ContextualLookupView answer={answer} />
  return <>
    <p className="lab-pcard-headword popup-define-word" data-testid="saved-define-headword">{headword}<HeadwordLabel label={headwordLabel(answer)} /></p>
    <ContextualLookupView answer={answer} labelInTitle />
  </>
}

/** A card's headword over its definition, with what the word is after it: "sepulchre · Noun" (the phone and margin cards). */
export function DefinitionWithHeadword({ headword, className, ...props }: Parameters<typeof DefinitionFallback>[0] & { headword?: string; className: string }) {
  const [label, setLabel] = useState('')
  return <>
    {headword && <p className={className}>{headword}<HeadwordLabel label={label} /></p>}
    <DefinitionFallback {...props} onHeadwordLabel={setLabel} />
  </>
}

/** The same already-resolved contextual card in a passage popup or a saved original-page card. */
export function ContextualLookupView({ answer, ready = true, dictionaryDefinitions, onChat, onTalk, labelInTitle = false }: {
  answer: PartialContextualLookup | null
  ready?: boolean
  /**
   * The title already shows the role, "Place" or the part of speech ("sepulchre · Noun"); a saved card without a
   * headword shows it in the body.
   */
  labelInTitle?: boolean
  dictionaryDefinitions?: string[]
  onChat?: (text: string) => void
  onTalk?: (text: string) => void
}) {
  if (answer?.kind === 'person') return <div className="popup-character" data-testid="popup-contextual-character" aria-busy={!ready}>
    {!labelInTitle && <small>{headwordLabel(answer) || '\u00a0'}</small>}
    {answer.subtitle && <p className="popup-character-subtitle">{answer.subtitle}</p>}
    {answer.body && <p>{answer.body}</p>}
    {ready && actions(personText(answer as PersonCard), answer.name, onChat, onTalk)}
  </div>
  if (answer?.kind === 'place') return <div className="popup-character popup-place" data-testid="popup-contextual-place" aria-busy={!ready}>
    {!labelInTitle && <small>Place</small>}
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
    <p className="popup-define-list popup-define-sense">{labelInTitle ? sense : `${label}${sense}`}</p>
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
