import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadOnboardingData } from '../utils/onboardingData'
import { LabAudiobookSelect } from './LabAudiobookSelect'
import type { Edition } from '../types'
import type { BookPreface } from '../data/bookPrefaces'
import type { LabCastMember } from './labSource'
import { ChatIcon, TalkIcon } from './LabReaderIcons'
import './labBookPreface.css'

/** Optional preparation: it never receives or changes a reading location. */
export function LabBookPreface({ open = true, preface, title, cover, continued, ready = true, cast = [], onRead, onBack = onRead, onAsk = () => {}, onTalk = () => {}, editions = [], primaryEdition = '', secondaryEdition = '', onEditions = () => {}, audioEditions = [], audioChoice = '', onAudioChoice = () => {} }: {
  open?: boolean; preface: BookPreface; title: string; cover: string; continued: boolean; ready?: boolean;
  cast?: LabCastMember[]; onRead: () => void; reopened?: boolean; onBack?: () => void;
  onAsk?: (question: string) => void; onTalk?: () => void;
  audioEditions?: Edition[]; audioChoice?: string; onAudioChoice?: (value: string) => void;
  editions?: Edition[]; primaryEdition?: string; secondaryEdition?: string; onEditions?: (primary: string, secondary: string) => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const [fullPreface, setFullPreface] = useState(false)
  const [showEditions, setShowEditions] = useState(false)
  const editionName = (edition: Edition) => edition.key === 'modern-en' ? 'Tinct Modern English AI' : edition.label
  const [desktop, setDesktop] = useState(() => typeof matchMedia === 'function' && matchMedia('(min-width: 1000px)').matches)
  const [showCast, setShowCast] = useState(() => typeof matchMedia === 'function' && matchMedia('(min-width: 1000px)').matches)
  useEffect(() => {
    const media = window.matchMedia?.('(min-width: 1000px)')
    if (!media) return
    const resize = () => { setDesktop(media.matches); setShowCast(media.matches) }
    media.addEventListener('change', resize)
    return () => media.removeEventListener('change', resize)
  }, [])
  const [expandedCharacters, setExpandedCharacters] = useState<Set<string>>(() => new Set())
  const [introCast, setIntroCast] = useState<LabCastMember[]>([])
  useEffect(() => {
    let cancelled = false
    setIntroCast([])
    void loadOnboardingData<{ cast?: { name: string; role?: string; description: string }[] }>(preface.bookId, 'en').then(({ data }) => {
      if (cancelled || !Array.isArray(data?.cast)) return
      setIntroCast(data.cast.filter(member => typeof member.name === 'string' && typeof member.description === 'string').map((member, index) => ({ id: `intro-${index}`, name: member.name, epithet: member.role || '', introduction: member.description })))
    })
    return () => { cancelled = true }
  }, [preface.bookId])
  const openingCast = introCast.length ? introCast : cast
  useLayoutEffect(() => {
    const node = dialog.current
    const previous = document.activeElement as HTMLElement | null
    if (!open) return
    node?.showModal()
    heading.current?.focus({ preventScroll: true })
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [open])
  return <dialog ref={dialog} className="lab-book-preface" data-testid="lab-book-preface" data-view="preparation"
    aria-label={`${title}: Before you begin`} onCancel={event => { event.preventDefault(); onBack() }}>
    <img className="lab-preparation-background" src={cover} alt="" />
    <div className="lab-preparation-shade" />
    <div className="lab-preparation-frame">
      <header className="lab-preface-top">
        <button type="button" onClick={onBack} aria-label="Back to cover" title="Back to cover">←</button>
        <button type="button" disabled={!ready} onClick={onRead} aria-label={continued ? 'Continue reading' : 'Start reading'} title={continued ? 'Continue reading' : 'Start reading'}>→</button>
      </header>
      <div className="lab-preface-scroll">
        <section className="lab-preface-preview" lang="en">
          <h1 ref={heading} tabIndex={-1}>Preface</h1>
          <div className="lab-preface-intro-row">
          <div id="preparation-preface-text" className={`lab-preface-full${fullPreface ? '' : ' is-collapsed'}`}>
            {(fullPreface ? preface.paragraphs : preface.paragraphs.slice(0, 1)).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {<button type="button" className="lab-preface-intro-toggle" aria-label="Preface" aria-controls="preparation-preface-text" aria-expanded={fullPreface} onClick={() => setFullPreface(value => !value)}><span aria-hidden="true">{fullPreface ? '−' : '+'}</span></button>}
          </div>
        </section>
        <section className="lab-preface-cast">
          <h2><button type="button" aria-expanded={showCast} aria-controls="preparation-cast" onClick={() => setShowCast(value => !value)}>Characters <span aria-hidden="true">{showCast ? '−' : '+'}</span></button></h2>
          {showCast && <div id="preparation-cast">{openingCast.length ? openingCast.map(member => <article key={member.id}>
            <h3><button type="button" className="lab-preparation-expand" aria-expanded={expandedCharacters.has(member.id)} aria-controls={`preparation-person-${member.id}`} onClick={() => setExpandedCharacters(current => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next })}><span className="lab-character-identity">{member.name}{desktop && member.epithet && <small>{member.epithet}</small>}</span><span aria-hidden="true">{expandedCharacters.has(member.id) ? '−' : '+'}</span></button></h3>
            {expandedCharacters.has(member.id) && <div id={`preparation-person-${member.id}`}><p>{member.introduction}</p></div>}
          </article>) : <p>Character introductions aren’t available for this book yet.</p>}</div>}
        </section>
        <section className="lab-preparation-customize">
          <h2>Design your own introduction</h2>
          <nav className="lab-preparation-dock" aria-label="Design your own introduction">
            <button type="button" onClick={() => onAsk('')}><ChatIcon /><span>Chat</span></button>
            <button type="button" onClick={onTalk}><TalkIcon /><span>Talk</span></button>
          </nav>
        </section>
        {editions.length > 0 && <section className="lab-preparation-editions">
          <h2><button type="button" className="lab-preparation-expand" aria-expanded={showEditions} aria-controls="preparation-editions" onClick={() => setShowEditions(value => !value)}>Select your editions <span aria-hidden="true">{showEditions ? '−' : '+'}</span></button></h2>
          {showEditions && <div id="preparation-editions">
            <label htmlFor="preparation-primary-edition">Primary edition</label><select id="preparation-primary-edition" value={primaryEdition} onChange={event => onEditions(event.target.value, event.target.value === secondaryEdition ? primaryEdition : secondaryEdition)}>{editions.map(edition => <option key={edition.key} value={edition.key}>{editionName(edition)}</option>)}</select>
            <label htmlFor="preparation-secondary-edition">Secondary edition</label><select id="preparation-secondary-edition" value={secondaryEdition} onChange={event => onEditions(primaryEdition, event.target.value)}><option value="">None</option>{editions.filter(edition => edition.key !== primaryEdition).map(edition => <option key={edition.key} value={edition.key}>{editionName(edition)}</option>)}</select>
            <label htmlFor="preparation-audiobook">Audiobook</label>
            <LabAudiobookSelect id="preparation-audiobook" value={audioChoice} primaryLabel={editions.find(edition => edition.key === primaryEdition)?.label || primaryEdition} editions={audioEditions} onChange={onAudioChoice} />
            {audioEditions.length === 0 && <p>No audiobook is available in this language.</p>}
            <p>You can change these later in settings.</p>
          </div>}
        </section>}
      </div>
    </div>
  </dialog>
}
