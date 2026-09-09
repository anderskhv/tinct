import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { BookPreface } from '../data/bookPrefaces'
import './labBookPreface.css'

/** A separate document view: it never receives or changes a reading location. */
export function LabBookPreface({ preface, title, cover, continued, reopened, ready = true, onRead }: {
  preface: BookPreface; title: string; cover: string; continued: boolean; reopened: boolean; ready?: boolean; onRead: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const coverHeading = useRef<HTMLSpanElement>(null)
  const [view, setView] = useState<'cover' | 'preface'>('cover')
  const viewRef = useRef(view)
  viewRef.current = view
  const onReadRef = useRef(onRead)
  onReadRef.current = onRead
  const historyId = useRef(`preface:${preface.bookId}:${Date.now()}`)
  const depth = useRef(0)
  const leaving = useRef(false)
  const initialReopened = useRef(reopened)
  const readingLabel = continued ? 'Continue reading' : 'Begin reading'

  useEffect(() => {
    // Reload always returns to the saved reader, never auto-opens the essay.
    const push = () => history.pushState({ ...history.state, tinctPreface: historyId.current, view: 'cover' }, '')
    if (initialReopened.current) {
      if (depth.current === 0) { push(); depth.current = 1 }
      else history.replaceState({ ...history.state, tinctPreface: historyId.current, view: 'cover' }, '')
    }
    const back = () => {
      if (leaving.current) { onReadRef.current(); return }
      if (history.state?.tinctPreface === historyId.current) {
        depth.current = initialReopened.current ? 1 : 0
        setView('cover')
      } else if (initialReopened.current) { depth.current = 0; onReadRef.current() }
      else { depth.current = 0; setView('cover') }
    }
    window.addEventListener('popstate', back)
    return () => {
      window.removeEventListener('popstate', back)
      if (history.state?.tinctPreface === historyId.current) {
        const { tinctPreface: _preface, view: _view, ...rest } = history.state
        history.replaceState(rest, '')
      }
    }
  }, [])
  useLayoutEffect(() => {
    const node = dialog.current
    const previous = document.activeElement as HTMLElement | null
    node?.showModal()
    return () => { node?.close(); if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  useLayoutEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
    if (view === 'preface') heading.current?.focus({ preventScroll: true })
    else coverHeading.current?.focus({ preventScroll: true })
  }, [view])
  const open = () => {
    if (viewRef.current === 'preface') return
    history.pushState({ ...history.state, tinctPreface: historyId.current, view: 'preface' }, '')
    depth.current += 1
    setView('preface')
  }
  const backToCover = () => { if (view === 'preface') history.back() }
  const read = () => {
    if (!ready || leaving.current) return
    leaving.current = true
    if (depth.current) history.go(-depth.current)
    else onReadRef.current()
  }
  return <dialog ref={dialog} className="lab-book-preface" data-testid="lab-book-preface" data-view={view}
    aria-label={view === 'preface' ? `${title}: Before you begin` : `${title} cover`}
    onCancel={event => { event.preventDefault(); if (view === 'preface') backToCover(); else read() }}>
    <div className="lab-preface-scroll" ref={scroller}>
      <header className="lab-preface-top">
        {view === 'preface' ? <button type="button" onClick={backToCover}>← Back to cover</button> : <button type="button" disabled={!ready} onClick={read}>{continued ? '← Back to book' : 'Begin reading'}</button>}
        <span ref={coverHeading} tabIndex={-1}>{title}</span>
      </header>
      {view === 'cover' ? <div className="lab-preface-cover-layout">
        <img src={cover} alt={`${title} cover`} className="lab-preface-cover-art" />
        <section className="lab-preface-preview" lang="en">
          <h1>{title}</h1>
          <p>{preface.preview}</p>
          <button type="button" className="lab-preface-link" onClick={open}>Read preface <span className="lab-preface-language">· English</span></button>
          <button type="button" className="lab-preface-primary" disabled={!ready} onClick={read}>{readingLabel}</button>
        </section>
      </div> : <article className="lab-preface-article" lang="en">
        <h1 ref={heading} tabIndex={-1}>Before you begin</h1>
        <p className="lab-preface-byline">{title} · A preface by Tinct <span>English</span></p>
        {preface.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <button type="button" className="lab-preface-primary" disabled={!ready} onClick={read}>{readingLabel}</button>
      </article>}
    </div>
  </dialog>
}
