import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Edition } from '../types'
import type { BookPreface } from '../data/bookPrefaces'
import type { LabCastMember } from './labSource'
import { ChatIcon, TalkIcon } from './LabReaderIcons'
import './labBookPreface.css'

// Local design sample: brief identities condensed from the reviewed Histories
// character package. Full snapshots contain later events and must not be used
// as introductions at the beginning. Production needs an approved intro layer.
const historiesIntroductions: LabCastMember[] = [
  { id: 'croesus', name: 'Croesus', epithet: '', introduction: 'King of Lydia, known for his immense wealth.' },
  { id: 'cyrus', name: 'Cyrus', epithet: '', introduction: 'Founder of the Persian Empire.' },
  { id: 'xerxes', name: 'Xerxes', epithet: '', introduction: 'A Persian king, and son of Darius.' },
  { id: 'themistocles', name: 'Themistocles', epithet: '', introduction: 'An Athenian statesman.' },
]

const characterDetails: Record<string, string> = {
  croesus: 'Lydia, rather than Persia, is his kingdom. His wealth is key to how he is introduced: it puts questions of prosperity, wisdom and good fortune close to the surface of his story.',
  cyrus: 'He represents the founding generation of Persian power. Keeping him distinct from the later Persian kings will help you follow the history as it moves between rulers and generations.',
  xerxes: 'He belongs to a later generation of Persian rulers than Cyrus. His relationship to Darius gives you a useful family connection to hold on to as the narrative moves between generations.',
  themistocles: 'An important political figure on the Athenian side of the history. Think of him as a statesman rather than a king: a different kind of public power from that of the rulers introduced alongside him.',
}

/** Optional preparation: it never receives or changes a reading location. */
export function LabBookPreface({ preface, title, cover, continued, ready = true, cast = [], onRead, onBack = onRead, onAsk = () => {}, onTalk = () => {}, editions = [], primaryEdition = '', secondaryEdition = '', onEditions = () => {} }: {
  preface: BookPreface; title: string; cover: string; continued: boolean; ready?: boolean;
  cast?: LabCastMember[]; onRead: () => void; reopened?: boolean; onBack?: () => void;
  onAsk?: (question: string) => void; onTalk?: () => void;
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
  const openingCast = preface.bookId === 'the-histories' ? historiesIntroductions : cast.slice(0, 4)
  useLayoutEffect(() => {
    const node = dialog.current
    const previous = document.activeElement as HTMLElement | null
    node?.showModal()
    heading.current?.focus({ preventScroll: true })
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
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
            {(fullPreface ? preface.paragraphs : preface.paragraphs.slice(0, desktop ? 2 : 1)).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <button type="button" className="lab-preface-intro-toggle" aria-label="Preface" aria-controls="preparation-preface-text" aria-expanded={fullPreface} onClick={() => setFullPreface(value => !value)}><span aria-hidden="true">{fullPreface ? '−' : '+'}</span></button>
          </div>
        </section>
        <section className="lab-preface-cast">
          <h2><button type="button" aria-expanded={showCast} aria-controls="preparation-cast" onClick={() => setShowCast(value => !value)}>Characters <span aria-hidden="true">{showCast ? '−' : '+'}</span></button></h2>
          {showCast && <div id="preparation-cast">{openingCast.length ? openingCast.map(member => <article key={member.id}>
            <h3><button type="button" className="lab-preparation-expand" aria-expanded={expandedCharacters.has(member.id)} aria-controls={`preparation-person-${member.id}`} onClick={() => setExpandedCharacters(current => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next })}>{member.name}<span aria-hidden="true">{expandedCharacters.has(member.id) ? '−' : '+'}</span></button></h3>
            {desktop && <p>{member.introduction}</p>}
            {expandedCharacters.has(member.id) && <div id={`preparation-person-${member.id}`}>{!desktop && <p>{member.introduction}</p>}{preface.bookId === 'the-histories' && <p>{characterDetails[member.id]}</p>}</div>}
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
            <p>You can change these later in settings.</p>
          </div>}
        </section>}
      </div>
    </div>
  </dialog>
}
