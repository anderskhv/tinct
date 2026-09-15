import { useLayoutEffect, useRef, useState } from 'react'
import type { BookPreface } from '../data/bookPrefaces'
import type { LabCastMember } from './labSource'
import './labBookPreface.css'

/** Optional preparation: it never receives or changes a reading location. */
export function LabBookPreface({ preface, title, cover, continued, ready = true, cast = [], onRead, onBack = onRead, onAsk = () => {}, onTalk = () => {} }: {
  preface: BookPreface
  title: string
  cover: string
  continued: boolean
  ready?: boolean
  cast?: LabCastMember[]
  onRead: () => void
  reopened?: boolean
  onBack?: () => void
  onAsk?: (question: string) => void
  onTalk?: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [fullPreface, setFullPreface] = useState(false)
  const [question, setQuestion] = useState('')
  const readingLabel = continued ? 'Continue reading' : 'Start reading'

  useLayoutEffect(() => {
    const node = dialog.current
    const previous = document.activeElement as HTMLElement | null
    node?.showModal()
    heading.current?.focus({ preventScroll: true })
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])

  const openingCast = cast.slice(0, 4)
  return <dialog ref={dialog} className="lab-book-preface" data-testid="lab-book-preface" data-view="preparation"
    aria-label={`${title}: Before you begin`} onCancel={event => { event.preventDefault(); onBack() }}>
    <div className="lab-preface-scroll">
      <header className="lab-preface-top">
        <button type="button" onClick={onBack}>← Back to cover</button>
        <span>{title}</span>
        <button type="button" disabled={!ready} onClick={onRead}>{readingLabel}</button>
      </header>
      <div className="lab-preface-cover-layout lab-preface-preparation">
        <img src={cover} alt={`${title} cover`} width="540" height="810" className="lab-preface-cover-art" />
        <section className="lab-preface-preview" lang="en">
          <h1 ref={heading} tabIndex={-1}>Before you begin</h1>
          <p>{preface.preview}</p>
          <button type="button" className="lab-preface-secondary" aria-expanded={fullPreface} onClick={() => setFullPreface(value => !value)}>
            {fullPreface ? 'Close full preface' : 'Read full preface'}
          </button>
          {fullPreface && <div className="lab-preface-full">{preface.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}
          {openingCast.length > 0 && <section className="lab-preface-cast">
            <h2>Meet the characters</h2>
            {openingCast.map(member => <article key={member.id}><strong>{member.name}</strong><p>{member.introduction}</p></article>)}
          </section>}
          <section className="lab-preface-ask">
            <h2>Ask or talk about the book</h2>
            <button type="button" className="lab-preface-suggestion" onClick={() => setQuestion('What should I notice at the beginning?')}>What should I notice at the beginning?</button>
            <textarea value={question} onChange={event => setQuestion(event.target.value)} placeholder="What would you like to know before you begin?" rows={2} />
            <div><button type="button" disabled={!question.trim()} onClick={() => onAsk(question.trim())}>Ask</button><button type="button" onClick={onTalk}>Talk</button></div>
          </section>
          <button type="button" className="lab-preface-primary" disabled={!ready} onClick={onRead}>{readingLabel}</button>
        </section>
      </div>
    </div>
  </dialog>
}
