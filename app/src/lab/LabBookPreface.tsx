import { COVER_TRANSITION_KEY, readCoverTransition } from '../../public/lab/cover-transition.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { loadOnboardingData } from '../utils/onboardingData'
import { LabAudiobookSelect } from './LabAudiobookSelect'
import type { Edition } from '../types'
import type { BookPreface } from '../data/bookPrefaces'
import type { LabCastMember } from './labSource'
import { ChatIcon, TalkIcon } from './LabReaderIcons'
import { preparationEditionLabel } from './preparationEditionLabel'
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
  const artwork = useRef<HTMLImageElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const closeToCover = () => {
    if (closing.current) return
    const target = artwork.current
    const source = document.querySelector<HTMLImageElement>('.lab-chapter-cover-art')
    if (!target || !source || !source.naturalWidth || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof target.animate !== 'function') { onBack(); return }
    const box=source.getBoundingClientRect(), start=target.getBoundingClientRect()
    const ratio=source.naturalWidth/source.naturalHeight, width=Math.min(box.width,box.height*ratio), height=width/ratio
    if (!width || !start.width) { onBack(); return }
    closing.current=true
    const animation=target.animate([{transform:'none'},{transform:`translate(${box.left+(box.width-width)/2-start.left}px,${box.top+(box.height-height)/2-start.top}px) scale(${width/start.width},${height/start.height})`}],{duration:420,easing:'cubic-bezier(.22,.8,.22,1)',fill:'forwards'})
    frame.current?.animate([{opacity:1},{opacity:0}],{duration:280,fill:'forwards'})
    void animation.finished.catch(()=>{}).then(()=>{closing.current=false;onBack()})
  }
  const [fullPreface, setFullPreface] = useState(false)
  const [showEditions, setShowEditions] = useState(false)
  const editionName = preparationEditionLabel
  const [showCast, setShowCast] = useState(false)
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
    const source = document.querySelector<HTMLImageElement>('.lab-chapter-cover-art')
    const fromLibrary = readCoverTransition(preface.bookId)
    const sourceBox = fromLibrary || source?.getBoundingClientRect()
    try { sessionStorage.removeItem(COVER_TRANSITION_KEY) } catch {}
    node?.showModal()
    const target = artwork.current
    const animations: Animation[] = []
    if (target && sourceBox && sourceBox.width > 0 && (fromLibrary || source?.naturalWidth) && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && typeof target.animate === 'function') {
      // Account for object-fit: contain: the image element can span the whole reader.
      const ratio = fromLibrary ? fromLibrary.width / fromLibrary.height : source!.naturalWidth / source!.naturalHeight
      const width = Math.min(sourceBox.width, sourceBox.height * ratio)
      const height = width / ratio
      const left = sourceBox.left + (sourceBox.width - width) / 2
      const top = sourceBox.top + (sourceBox.height - height) / 2
      const end = target.getBoundingClientRect()
      if (end.width > 0 && end.height > 0) animations.push(target.animate([
        { transform: `translate(${left - end.left}px, ${top - end.top}px) scale(${width / end.width}, ${height / end.height})` },
        { transform: 'none' },
      ], { duration: 720, easing: 'cubic-bezier(.22,.8,.22,1)' }))
      if (frame.current) animations.push(frame.current.animate([
        { opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' },
      ], { duration: 620, easing: 'cubic-bezier(.22,.8,.22,1)' }))
    }
    heading.current?.focus({ preventScroll: true })
    return () => { animations.forEach(animation => animation.cancel()); node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [open])
  return <dialog ref={dialog} className="lab-book-preface" data-testid="lab-book-preface" data-view="preparation"
    aria-label={`${title}: Before you begin`} onCancel={event => { event.preventDefault(); closeToCover() }}>
    <div className="lab-preparation-stage">
    <img ref={artwork} className="lab-preparation-background" src={cover} alt="" />
    <div ref={frame} className="lab-preparation-frame">
      <header className="lab-preface-top">
        <button type="button" onClick={closeToCover} aria-label="Back to cover" title="Back to cover">← <span>Back to cover</span></button>
        <button type="button" disabled={!ready} onClick={onRead} aria-label={continued ? 'Continue reading' : 'Start reading'} title={continued ? 'Continue reading' : 'Start reading'}><span>{continued ? 'Continue reading' : 'Start reading'}</span> →</button>
      </header>
      <div className="lab-preface-scroll">
        <section className="lab-preface-preview" lang="en">
          <p className="lab-preparation-eyebrow">Before you begin</p>
          <h1 ref={heading} tabIndex={-1}>Preface</h1>
          <div className="lab-preface-intro-row">
          <div id="preparation-preface-text" className={`lab-preface-full${fullPreface ? '' : ' is-collapsed'}`}>
            {(fullPreface ? preface.paragraphs : preface.paragraphs.slice(0, 1)).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <button type="button" className="lab-preface-intro-toggle" aria-label="Preface" aria-controls="preparation-preface-text" aria-expanded={fullPreface} onClick={() => setFullPreface(value => !value)}><span>{fullPreface ? 'Show less' : 'Read full preface'}</span></button>
          </div>
        </section>
        <section className="lab-preface-cast">
          <h2><button type="button" aria-expanded={showCast} aria-controls="preparation-cast" onClick={() => setShowCast(value => !value)}>Characters <span aria-hidden="true">{showCast ? '−' : '+'}</span></button></h2>
          {showCast && <div id="preparation-cast">{openingCast.length ? openingCast.map(member => <article key={member.id}>
            <h3><button type="button" className="lab-preparation-expand" aria-expanded={expandedCharacters.has(member.id)} aria-controls={`preparation-person-${member.id}`} onClick={() => setExpandedCharacters(current => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next })}><span className="lab-character-identity">{member.name}</span><span aria-hidden="true">{expandedCharacters.has(member.id) ? '−' : '+'}</span></button></h3>
            {expandedCharacters.has(member.id) && <div id={`preparation-person-${member.id}`}><p>{member.introduction}</p></div>}
          </article>) : <p>Character introductions aren’t available for this book yet.</p>}</div>}
        </section>
        <section className="lab-preparation-customize">
          <h2>Find your way into the book</h2>
          <p>A quick conversation about what might interest you.</p>
          <nav className="lab-preparation-dock" aria-label="Find your way into the book">
            <button type="button" onClick={onTalk}><TalkIcon /><span>Talk</span></button>
            <button type="button" onClick={() => onAsk('')}><ChatIcon /><span>Chat</span></button>
          </nav>
        </section>
        {editions.length > 0 && <section className="lab-preparation-editions">
          <h2><button type="button" className="lab-preparation-expand" aria-expanded={showEditions} aria-controls="preparation-editions" onClick={() => setShowEditions(value => !value)}>Select your editions <span aria-hidden="true">{showEditions ? '−' : '+'}</span></button></h2>
          {showEditions && <div id="preparation-editions">
            <label htmlFor="preparation-primary-edition">Primary edition</label><select id="preparation-primary-edition" value={primaryEdition} onChange={event => onEditions(event.target.value, event.target.value === secondaryEdition ? primaryEdition : secondaryEdition)}>{editions.map(edition => <option key={edition.key} value={edition.key}>{editionName(edition)}</option>)}</select>
            <label htmlFor="preparation-audiobook">Audiobook</label>
            <LabAudiobookSelect id="preparation-audiobook" value={audioChoice} primaryLabel={editions.find(edition => edition.key === primaryEdition)?.label || primaryEdition} editions={audioEditions} onChange={onAudioChoice} />
            <label htmlFor="preparation-secondary-edition">Compare edition</label><select id="preparation-secondary-edition" value={secondaryEdition} onChange={event => onEditions(primaryEdition, event.target.value)}><option value="">None</option>{editions.filter(edition => edition.key !== primaryEdition).map(edition => <option key={edition.key} value={edition.key}>{editionName(edition)}</option>)}</select>
            {audioEditions.length === 0 && <p>No audiobook is available in this language.</p>}
            <p>You can change these later in settings.</p>
          </div>}
        </section>}
      </div>
    </div>
    </div>
  </dialog>
}
