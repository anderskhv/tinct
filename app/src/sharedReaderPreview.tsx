import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SelectionDeskBar, type DeskBarState, type DeskMoreId } from './components/reader/SelectionDeskBar'
import { LabPhoneBar, type PhoneMoreId } from './lab/marginPhone/LabPhoneBar'
import { HIGHLIGHT_COLORS, type HighlightColor } from './types'
import './sharedReaderPreview.css'

/** An isolated design preview. This HTML page is intentionally absent from Vite's production entry list. */
type Theme = 'light' | 'book' | 'dark'
type Surface = 'reader' | 'ask' | 'paste'
type Device = 'desktop' | 'phone'
type PasteStep = 'entry' | 'input' | 'preview'
const query = new URLSearchParams(location.search)
const choice = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
  allowed.find(item => item === value) ?? fallback
const initialTheme = choice(query.get('theme'), ['light', 'book', 'dark'] as const, 'book')
const initialSurface = choice(query.get('surface'), ['reader', 'ask', 'paste'] as const, 'reader')
const initialDevice = choice(query.get('device'), ['desktop', 'phone'] as const, window.innerWidth < 700 ? 'phone' : 'desktop')
const initialStep = choice(query.get('step'), ['entry', 'input', 'preview'] as const, 'entry')
const clean = query.get('clean') === '1'

// These words come unchanged from Tinct's original English edition, chapter 1. They are never fetched, saved or AI rewritten.
const SOURCE_PARAGRAPHS = [
  "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.",
  "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
  "“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
  "Mr. Bennet replied that he had not.",
  "“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”",
  "Mr. Bennet made no answer.",
  "“Do not you want to know who has taken it?” cried his wife, impatiently.",
  "“_You_ want to tell me, and I have no objection to hearing it.”",
  "This was invitation enough.",
  "“Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.”",
  "“What is his name?”",
  "“Bingley.”",
  "“Is he married or single?”",
  "“Oh, single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!”",
  "“How so? how can it affect them?”",
  "“My dear Mr. Bennet,” replied his wife, “how can you be so tiresome? You must know that I am thinking of his marrying one of them.”",
  "“Is that his design in settling here?”",
  "“Design? Nonsense, how can you talk so! But it is very likely that he _may_ fall in love with one of them, and therefore you must visit him as soon as he comes.”",
  "“I see no occasion for that. You and the girls may go--or you may send them by themselves, which perhaps will be still better; for as you are as handsome as any of them, Mr. Bingley might like you the best of the party.”",
  "“My dear, you flatter me. I certainly _have_ had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.”",
  "“In such cases, a woman has not often much beauty to think of.”",
  "“But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.”",
  "“It is more than I engage for, I assure you.”",
  "“But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account; for in general, you know, they visit no new comers. Indeed you must go, for it will be impossible for _us_ to visit him, if you do not.”",
  "“You are over scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of the girls--though I must throw in a good word for my little Lizzy.”"
]
const READER_QUOTE = SOURCE_PARAGRAPHS[0]
const PASTE_FIXTURE = SOURCE_PARAGRAPHS.slice(0, 5).join('\n\n')
const TITLE_FIXTURE = 'Pride and Prejudice'
const AUTHOR_FIXTURE = 'Jane Austen'
const FORMAT_SAMPLES = {
  plain: PASTE_FIXTURE,
  markdown: `# ${TITLE_FIXTURE}\n\n${SOURCE_PARAGRAPHS.slice(0, 5).join('\n\n')}`,
  html: `<h1>${TITLE_FIXTURE}</h1>\n${SOURCE_PARAGRAPHS.slice(0, 5).map(paragraph => `<p>${paragraph}</p>`).join('\n')}`,
}

function Preview() {
  const [surface, setSurface] = useState<Surface>(initialSurface)
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [device, setDevice] = useState<Device>(initialDevice)
  const [step, setStep] = useState<PasteStep>(initialStep)
  const [text, setText] = useState(PASTE_FIXTURE)
  const [title, setTitle] = useState(TITLE_FIXTURE)
  const [author, setAuthor] = useState(AUTHOR_FIXTURE)
  const [format, setFormat] = useState<'plain' | 'markdown' | 'html'>('plain')
  const [firstParagraph, setFirstParagraph] = useState(1)
  const [lastParagraph, setLastParagraph] = useState(5)
  const [barState, setBarState] = useState<DeskBarState>('menu')
  const [color, setColor] = useState<HighlightColor>('gold')
  const [phoneMarked, setPhoneMarked] = useState(false)
  const [message, setMessage] = useState('')
  const notify = (action: string) => setMessage(`${action} · preview only`)
  const enter = (next: PasteStep) => { setStep(next); setMessage(''); const url = new URL(location.href); url.searchParams.set('step', next); history.replaceState(null, '', url) }
  const changeView = (next: { surface?: Surface; theme?: Theme; device?: Device }) => {
    const values = { surface: next.surface ?? surface, theme: next.theme ?? theme, device: next.device ?? device }
    setSurface(values.surface); setTheme(values.theme); setDevice(values.device)
    const url = new URL(location.href)
    Object.entries(values).forEach(([key, value]) => url.searchParams.set(key, value))
    url.searchParams.set('step', step)
    history.replaceState(null, '', url)
    setMessage('')
  }
  const mark = (next: HighlightColor) => { setColor(next); setBarState('colors'); setPhoneMarked(true) }
  const chosen = HIGHLIGHT_COLORS.find(item => item.key === color) ?? HIGHLIGHT_COLORS[0]

  return <main className={`preview preview-surface-${surface} preview-${device}${clean ? ' is-clean' : ''}`}>
    <nav className="preview-controls" aria-label="Preview controls">
      <div className="preview-controls-label">Tinct · isolated design preview</div>
      <div className="preview-controls-group" aria-label="Surface">
        <button type="button" aria-pressed={surface === 'reader'} onClick={() => changeView({ surface: 'reader' })}>Selection</button>
        <button type="button" aria-pressed={surface === 'ask'} onClick={() => changeView({ surface: 'ask' })}>Ask · 440 px</button>
        <button type="button" aria-pressed={surface === 'paste'} onClick={() => changeView({ surface: 'paste' })}>Paste text · proposed</button>
      </div>
      <div className="preview-controls-group" aria-label="Theme">
        {(['light', 'book', 'dark'] as const).map(value => <button key={value} type="button" aria-pressed={theme === value} onClick={() => changeView({ theme: value })}>{value[0].toUpperCase() + value.slice(1)}</button>)}
      </div>
      <div className="preview-controls-group" aria-label="Device">
        {(['desktop', 'phone'] as const).map(value => <button key={value} type="button" aria-pressed={device === value} onClick={() => changeView({ device: value })}>{value[0].toUpperCase() + value.slice(1)}</button>)}
      </div>
    </nav>
    {surface !== 'paste' ? <section className={`lab preview-reader ${device === 'phone' ? 'is-phone' : 'is-desktop'}${theme === 'book' ? ' is-book-theme' : ''}${theme === 'dark' ? ' is-night' : ''}${surface === 'ask' ? ' is-ask-preview' : ''}`} data-theme={theme} data-lab-layout={device} aria-label="Reader selection preview">
      <header className="lab-header preview-reader-header">
        <div className="preview-reader-heading"><span className="preview-brand">Tinct</span><span className="preview-divider" aria-hidden="true">/</span><span>Pride and Prejudice</span><span className="preview-chapter">Chapter 1</span></div>
        <div className="preview-reader-actions"><button type="button" aria-label="Contents" onClick={() => notify('Contents')}>☷</button><button type="button" aria-label="Appearance" onClick={() => notify('Appearance')}>Aa</button><button type="button" aria-label="Menu" onClick={() => notify('Menu')}>•••</button></div>
      </header>
      <div className="preview-pages">
        <article className="preview-leaf">
          <div className="preview-running">PRIDE AND PREJUDICE <span>1</span></div>
          <div className="preview-leaf-body lab-passage">
            <p className="preview-chapter-label">Chapter 1</p>
            <p className="preview-first">{SOURCE_PARAGRAPHS[0].split('must be')[0]}<span className="lab-hearing-word is-selecting">must be{SOURCE_PARAGRAPHS[0].split('must be')[1]}</span></p>
            {SOURCE_PARAGRAPHS.slice(1, 10).map((paragraph, index) => <p key={index}>{paragraph.replaceAll('_', '')}</p>)}
          </div>
          <div className="preview-page-number">1</div>
        </article>
        {device === 'desktop' && <article className="preview-leaf preview-second-leaf" aria-label="Facing page">
          <div className="preview-running">JANE AUSTEN <span>2</span></div>
          <div className="preview-leaf-body">{SOURCE_PARAGRAPHS.slice(10, 25).map((paragraph, index) => <p key={index}>{paragraph.replaceAll('_', '')}</p>)}</div>
          <div className="preview-page-number">2</div>
        </article>}
      </div>
      <footer className="preview-reader-foot"><span>Chapter 1</span><span>1 of 18</span><span>Read</span></footer>
      {surface === 'ask' ? <aside className="lab-ask tc preview-ask-panel is-desktop-companion" aria-label="Ask field preview">
        <button className="tc-back" type="button" onClick={() => changeView({ surface: 'reader' })}>‹ Back to book</button>
        <div className="preview-ask-body"><p>Ask about the selected passage</p></div>
        <form className="tc-compose" onSubmit={event => event.preventDefault()}>
          <section className="tc-attached" aria-label="Highlighted passage attached to question">{READER_QUOTE}<button className="tc-mark" type="button" aria-label="Remove passage" onClick={() => notify('Remove passage')}>×</button></section>
          <div className="tc-field"><label className="preview-visually-hidden" htmlFor="preview-ask-input">Ask a question</label><textarea id="preview-ask-input" className="tc-input" rows={1} placeholder="Ask about this passage" /><button className="tc-mark tc-send" type="button" aria-label="Send disabled in preview" disabled>↗</button></div>
        </form>
      </aside> : device === 'desktop' ? <SelectionDeskBar state={barState} color={color} marked={barState !== 'menu'} noted={false}
        moreRows={[["define", "factcheck", "counterpoint"] as DeskMoreId[], ["copy"] as DeskMoreId[]]}
        fallback={{ x: window.innerWidth * .28, y: window.innerHeight * .43 }}
        onAsk={() => notify('Ask')} onExplain={() => notify('Explain')} onSimplify={() => notify('Simplify')}
        onMore={id => notify(id)} onHighlight={() => mark(color)} onSwatch={mark} onNote={() => notify('Add note')}
        onRemove={() => { setBarState('menu'); setPhoneMarked(false) }} />
        : <LabPhoneBar text={READER_QUOTE} existingColor={phoneMarked ? color : undefined} fallbackY={window.innerHeight * .4}
          onAsk={() => notify('Ask')} onExplain={() => notify('Explain')} onSimplify={() => notify('Simplify')}
          onMore={(id: PhoneMoreId) => notify(id)} onHighlight={mark} onNote={() => notify('Add note')}
          onRemove={() => { setPhoneMarked(false); setBarState('menu') }} onDismiss={() => setMessage('Selection dismissed · preview only')} />}
      <p className="preview-caption">{surface === 'ask' ? 'Ask field concept · 440px using existing chat styles · AI disabled' : `Actual ${device} selection controls · proposed theme colours · original edition text; page layout illustrative`}</p>
      {message && <p className="preview-feedback" role="status">{message}</p>}
      <span className="preview-visually-hidden">Selected passage highlight colour: {chosen.label}</span>
    </section> : <section className="preview-library" data-tui-theme="dark" aria-label="Paste text concept">
      <header className="preview-library-header"><span>Tinct</span><span>My shelf</span><span>⌕ &nbsp; +</span></header>
      <div className="preview-library-room"><h1>My shelf</h1><p>My private uploads</p><div className="preview-library-shelf" aria-hidden="true"><span>PRIDE AND<br/>PREJUDICE</span><span>ESSAYS</span><span>THE ODYSSEY</span></div></div>
      <div className="tui-scrim preview-dialog-layer" data-tui-theme="dark">
        <div className="tui-dialog preview-paste-dialog" role="dialog" aria-modal="true" aria-labelledby="preview-dialog-title">
          <div className="tui-dialog__head"><div><h2 className="tui-dialog__title" id="preview-dialog-title">{step === 'entry' ? 'Your own book' : 'Paste text'}</h2><span className="preview-proposed-tag">Proposed preview</span></div><button className="tui-close" type="button" aria-label="Close" onClick={() => enter('entry')}><svg viewBox="0 0 14 14" aria-hidden="true"><path d="m3 3 8 8M11 3l-8 8" /></svg></button></div>
          {step === 'entry' && <>
            <p className="tui-dialog__body">Open a PDF or EPUB from this device: a textbook, lecture notes, a DRM-free ebook. It stays private to your account.</p>
            <p className="tui-dialog__fine">Kept privately in your account, never shared. When you ask Tinct’s reading companion about it, its text is sent to answer. DRM-protected files can’t be opened.</p>
            <div className="tui-dialog__actions preview-entry-actions"><button className="tui-btn tui-btn--secondary" type="button" onClick={() => enter('input')}>Paste text</button><button className="tui-btn tui-btn--primary" type="button" onClick={() => notify('Existing PDF/EPUB file picker')}>Choose a PDF or EPUB</button></div>
          </>}
          {step === 'input' && <>
            <p className="tui-dialog__body">Paste text you have the right to add. The text stays as you provide it.</p>
            <div className="preview-format" role="group" aria-label="Source format">{(['plain', 'markdown', 'html'] as const).map(value => <button type="button" key={value} className="tui-chip" aria-pressed={format === value} onClick={() => { if (Object.values(FORMAT_SAMPLES).includes(text)) setText(FORMAT_SAMPLES[value]); setFormat(value) }}>{value === 'plain' ? 'Plain text' : value === 'html' ? 'HTML' : 'Markdown'}</button>)}</div>
            <p className="tui-dialog__fine preview-format-note">{format === 'plain' ? 'Plain text sample from the original edition.' : `${format === 'html' ? 'HTML' : 'Markdown'} source sample shown as typed; rendering is outside this preview.`}</p>
            <label className="preview-field-label" htmlFor="paste-source">Text</label>
            <textarea className="tui-input preview-source-input" id="paste-source" value={text} onChange={event => setText(event.target.value)} spellCheck={false} />
            <p className="tui-dialog__fine preview-count">{text.length.toLocaleString()} characters · {text.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words</p>
            <div className="tui-dialog__actions"><button className="tui-btn tui-btn--secondary" type="button" onClick={() => enter('entry')}>Back</button><button className="tui-btn tui-btn--primary" type="button" disabled={!text.trim()} onClick={() => enter('preview')}>Preview text</button></div>
          </>}
          {step === 'preview' && <>
            <p className="tui-dialog__fine">Source text fixture from Tinct’s original English edition. Title and author below are sample metadata, editable before saving. Nothing is rewritten.</p>
            <div className="preview-meta"><label className="preview-field-label" htmlFor="paste-title">Title<input className="tui-input" id="paste-title" value={title} onChange={event => setTitle(event.target.value)} /></label><label className="preview-field-label" htmlFor="paste-author">Author<input className="tui-input" id="paste-author" value={author} onChange={event => setAuthor(event.target.value)} /></label></div>
            <div className="preview-trim-controls"><label>Start at paragraph<select className="tui-input" value={Math.min(firstParagraph, text.trim().split(/\n\s*\n/).length)} onChange={event => setFirstParagraph(Number(event.target.value))}>{text.trim().split(/\n\s*\n/).map((_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label><label>End after paragraph<select className="tui-input" value={Math.min(lastParagraph, text.trim().split(/\n\s*\n/).length)} onChange={event => setLastParagraph(Number(event.target.value))}>{text.trim().split(/\n\s*\n/).map((_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label></div>
            <div className="preview-source" aria-label="Source text preview">{text.trim().split(/\n\s*\n/).slice(firstParagraph - 1, Math.max(firstParagraph, lastParagraph)).slice(0, 2).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{Math.max(firstParagraph, lastParagraph) - firstParagraph + 1 > 2 && <p className="preview-ellipsis">… preview ends here; remaining selected text is retained</p>}</div>
            <div className="preview-trim"><span>{format === 'plain' ? 'Plain text' : `${format.toUpperCase()} raw source`} · {text.length.toLocaleString()} characters</span><button className="tui-btn tui-btn--quiet tui-btn--sm" type="button" onClick={() => { const paragraphs = text.trim().split(/\n\s*\n/); setText(paragraphs.slice(firstParagraph - 1, Math.max(firstParagraph, lastParagraph)).join('\n\n')); setFirstParagraph(1); setLastParagraph(Math.max(firstParagraph, lastParagraph) - firstParagraph + 1) }}>Apply trim to draft</button></div>
            <div className="tui-dialog__actions"><button className="tui-btn tui-btn--secondary" type="button" onClick={() => enter('input')}>Edit text</button><button className="tui-btn tui-btn--primary" type="button" disabled title="Preview only; nothing is saved">Save to My shelf</button></div>
          </>}
          {message && <p className="preview-dialog-feedback" role="status">{message}</p>}
        </div>
      </div>
      <p className="preview-caption preview-paste-label">Proposed Paste text UI · existing PDF/EPUB copy and Tinct dialog styles · save disabled · no upload</p>
    </section>}
  </main>
}

createRoot(document.getElementById('root')!).render(<Preview />)
