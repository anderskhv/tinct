/**
 * Crawlable scene pages for five plays (`/read/{bookId}/{scene}`), built at build time from the served
 * modern-en editions, byte for byte (Anders, 13 Nov 2026; approved mockup of the same day).
 *
 * A scene page is static HTML set like the desktop margin reader: the reader's own class names, its own
 * stylesheets (the build stamps the reader's CSS links into each page, see stamp-scene-pages.cjs), its own
 * speaker and verse runs (labVerseLines) and its own icons. It is not the reader: it imports nothing at run
 * time, hydrates nothing and never reads or writes a reading position. Every action only the reader can
 * perform hands over to `/reader` at the scene (sceneHandoffHref; the reader reads the hash in
 * labReaderHandoff.ts).
 *
 * Pure: no file system. scripts/seo/build-scene-pages.mjs bundles this module and writes the files.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { stripUnderscoreEmphasis } from '../lab/emphasisText'
import { LibraryBackIcon } from '../lab/LabReaderIcons'
import { LabSuperButton } from '../lab/LabSuperButton'
import { ReaderNotebookIcon } from '../lab/ReaderNotebookIcon'
import { PhoneIcon } from '../lab/marginPhone/LabPhoneCard'
import { LAB_V2_PLAY_PX } from '../lab/labSuperGlyph'
import {
  isInternalVerseBreak,
  presentationLineRanges,
  registerShakespeareSpeakers,
  registerVerseLines,
  resetVerseLines,
  verseLineStarts,
  verseSpeakerEnd,
  type VerseLineSidecar,
} from '../lab/labVerseLines'
import { SCENE_HANDOFF_EDITION, sceneHandoffHash, type SceneHandoffAction } from '../lab/labSceneHandoff'
import { editionNoteHtml, editionSource, type EditionSource } from '../data/editionSources'
import { BOOKS } from '../data/bookRegistry'
import { bookPageDescription, bookPageTitle, chapterPositions, curlyQuotes, structureFacts } from './bookStructure'

export const SCENE_PAGE_ORIGIN = 'https://tinct.app'
/** The five plays with scene pages (brief, 13 Nov 2026). Other books keep their book page only. */
export const SCENE_PAGE_BOOKS = ['hamlet', 'macbeth', 'romeo-and-juliet', 'julius-caesar', 'othello'] as const
/** Replaced after `vite build` by the reader's own stylesheet links, read from the built app.html. */
export const READER_CSS_PLACEHOLDER = '<!--tinct:reader-css-->'
/** Replaced at build time by the versioned address of a scene page script (public/read/scene-*.js). */
export const sceneAssetPlaceholder = (name: 'scene-page.js' | 'scene-layout.js') => `__TINCT_SCENE_ASSET_${name}__`

export interface EditionChapter { number: number; title: string; paragraphs: string[] }
export interface Edition { chapters: EditionChapter[] }
export interface ScenePageBook { id: string; title: string; author: string }
export interface ScenePage {
  bookId: string
  chapterNumber: number
  slug: string
  /** The edition's chapter title ("Act 3, Scene 1 — A Room in the Castle"). */
  title: string
  /** "Act 3, Scene 1" (or "Prologue"). */
  scene: string
  html: string
}

/** "Act 3, Scene 1 — A Room in the Castle" -> { scene: "Act 3, Scene 1", place: "A Room in the Castle" }. */
export function splitSceneTitle(title: string): { scene: string; place: string } {
  const [scene, ...rest] = title.split(' — ')
  return { scene: scene.trim(), place: rest.join(' — ').trim() }
}

/** The stable address of a scene: act-3-scene-1, prologue. Never chapter-N (the retired pages keep that pattern). */
export function sceneSlug(title: string): string {
  const { scene } = splitSceneTitle(title)
  const act = scene.match(/^Act (\d{1,2}), Scene (\d{1,2})$/)
  if (act) return `act-${Number(act[1])}-scene-${Number(act[2])}`
  if (/^Prologue$/i.test(scene)) return 'prologue'
  const actPrologue = scene.match(/^Act (\d{1,2}), Prologue$/i)
  if (actPrologue) return `act-${Number(actPrologue[1])}-prologue`
  throw new Error(`No scene address for chapter title "${title}"`)
}

/** Slug pattern the Worker accepts under /read/{bookId}/ for these books. */
export const SCENE_SLUG_RE = /^(?:act-\d{1,2}-scene-\d{1,2}|act-\d{1,2}-prologue|prologue)$/

/** "Hamlet, Act 3, Scene 1 of 4: full text in modern English | Tinct" (Anders, 19 Nov 2026: titles by search intent). */
export function scenePageTitle(book: ScenePageBook, chapterTitle: string, of: number | null = null): string {
  return `${book.title}, ${splitSceneTitle(chapterTitle).scene}${of ? ` of ${of}` : ''}: full text in modern English | Tinct`
}

/** The play's edition source and note, from the registry (null when it does not say). */
export function playEditionNote(bookId: string): { source: EditionSource | null; note: string | null } {
  const book = BOOKS.find(entry => entry.id === bookId)
  const source = book ? editionSource(book) : null
  return { source, note: source ? editionNoteHtml(source) : null }
}

/** "Read Act 3, Scene 1 of Hamlet free, in modern English beside the original. No sign-up." */
export function scenePageDescription(book: ScenePageBook, chapterTitle: string): string {
  return `Read ${splitSceneTitle(chapterTitle).scene} of ${book.title} free, in modern English beside the original. No sign-up.`
}

export function scenePagePath(bookId: string, slug: string): string {
  return `/read/${bookId}/${slug}`
}

/**
 * The reader at this scene in the scene page's edition, with what the reader should do there in the hash. The
 * hash never reaches a server, a referrer or the attribution record (which keep path and query only); the reader
 * reads it once and removes it. `atParagraph` opens the reader at that paragraph (a selection, or the scene's end).
 */
export function sceneHandoffHref(bookId: string, chapterNumber: number, action: SceneHandoffAction | null, atParagraph?: number): string {
  const query = `book=${encodeURIComponent(bookId)}&chapter=${chapterNumber}&edition=${SCENE_HANDOFF_EDITION}${atParagraph ? `&paragraph=${atParagraph}` : ''}`
  return `/reader?${query}${action ? sceneHandoffHash({ action }) : ''}`
}

export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** The paragraph's words as the reader tokenizes them (tokenizeWithEmphasis): /\S+/ over the emphasis-stripped text. */
function words(text: string): Array<{ text: string; emphasis: boolean }> {
  const { text: cleaned, ranges } = stripUnderscoreEmphasis(text)
  const out: Array<{ text: string; emphasis: boolean }> = []
  const re = /\S+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(cleaned))) {
    const start = match.index
    const end = start + match[0].length
    out.push({ text: match[0], emphasis: ranges.some(([from, to]) => start < to && end > from) })
  }
  return out
}

/**
 * One paragraph as the reader paints it (LabPassage renderWordGroups): speaker and verse runs from labVerseLines,
 * one space before every word but the first, emphasis as <em>. The words are not wrapped one by one; the page
 * maps a selection to word indexes with the same tokenizer (scene-page.js).
 */
export function renderParagraph(text: string, index: number, idPrefix = 'lab-p-'): string {
  const list = words(text)
  const word = (at: number) => {
    const item = list[at]
    const body = escapeHtml(item.text)
    return `${at > 0 ? ' ' : ''}${item.emphasis ? `<em>${body}</em>` : body}`
  }
  const span = (from: number, to: number) => {
    let out = ''
    for (let at = from; at < to; at += 1) out += word(at)
    return out
  }
  const ranges = presentationLineRanges(text, 0, list.length)
  const body = ranges
    ? ranges.map(([start, end]) => {
      const speakerEnd = verseSpeakerEnd(text, start)
      const speaker = start < speakerEnd ? `<span class="lab-verse-speaker">${span(start, Math.min(end, speakerEnd))}</span>` : ''
      const dialogue = `<span class="lab-verse-dialogue">${span(Math.max(start, speakerEnd), end)}</span>`
      const lineBreak = isInternalVerseBreak(text, end) ? '<span class="lab-verse-break" aria-hidden="true"></span>' : ''
      return `<span class="${verseLineStarts(text) ? 'lab-verse-line' : 'lab-speech-run'}">${speaker}${dialogue}${lineBreak}</span>`
    }).join('')
    : span(0, list.length)
  return `<p id="${idPrefix}${index}" class="lab-hearing-line" data-p="${index}">${body}</p>`
}

/** The text a rendered paragraph carries (its textContent): the served paragraph with emphasis marks removed. */
export function paragraphPlainText(text: string): string {
  return words(text).map(item => item.text).join(' ')
}

const wordCount = (paragraphs: readonly string[]) => paragraphs.reduce((sum, text) => sum + Math.max(1, words(text).length), 0)

/**
 * The reader's book map (SourceMinimap), drawn once: every scene as hairlines in proportion to its words, this
 * scene's paragraphs line by line, the window over this scene and the share of the book before it.
 */
export function renderMinimap(chapters: readonly EditionChapter[], chapterNumber: number): string {
  const current = chapters.find(chapter => chapter.number === chapterNumber)
  if (!current) return ''
  const weights = current.paragraphs.map(text => Math.max(1, words(text).length))
  const starts: number[] = []
  let chapterTotal = 0
  for (const weight of weights) { starts.push(chapterTotal); chapterTotal += weight }
  chapterTotal ||= 1
  let total = 0
  const laid = chapters.map(chapter => {
    const weight = chapter.number === chapterNumber ? chapterTotal : Math.max(1, wordCount(chapter.paragraphs))
    const start = total
    total += weight
    return { chapter, start, weight }
  })
  const offset = laid.find(item => item.chapter.number === chapterNumber)!.start
  const mapHeight = Math.max(140, Math.min(600, Math.ceil(total / 12) * 5))
  const y = (value: number) => +(value / total * mapHeight).toFixed(2)
  const out: string[] = []
  for (const { chapter, start, weight } of laid) {
    if (chapter.number === chapterNumber) continue
    out.push(`<g data-map-chapter="${chapter.number}"><title>${escapeHtml(chapter.title)}</title><line x1="4" x2="24" y1="${y(start)}" y2="${y(start)}" class="source-minimap-line"/>`)
    const ticks = Math.max(0, Math.floor(weight / total * mapHeight / 4) - 1)
    for (let index = 0; index < ticks; index += 1) {
      const at = +(start / total * mapHeight + (index + 1) * 4).toFixed(2)
      out.push(`<line x1="6" x2="25" y1="${at}" y2="${at}" class="source-minimap-line"/>`)
    }
    out.push('</g>')
  }
  let previous = -3
  weights.forEach((weight, index) => {
    const count = Math.max(1, Math.ceil(weight / 12))
    for (let line = 0; line < count; line += 1) {
      const at = (offset + starts[index] + line * 12) / total * mapHeight
      if (at - previous < 3) continue
      previous = at
      const width = line === count - 1 ? Math.max(6, Math.min(25, (weight % 12 || 12) / 12 * 25)) : 25
      out.push(`<line x1="4" x2="${+(4 + width).toFixed(2)}" y1="${+(at + .5).toFixed(2)}" y2="${+(at + .5).toFixed(2)}" class="source-minimap-line"/>`)
    }
  })
  const top = Math.min(mapHeight - 8, y(offset))
  const height = Math.max(8, Math.min(mapHeight - top, y(chapterTotal)))
  out.push(`<rect x=".5" y="${top}" width="33" height="${+height.toFixed(2)}" rx="5" class="source-minimap-window"/>`)
  const percent = Math.round(offset / total * 100)
  return `<svg class="source-minimap" style="height:min(calc(100dvh - 200px), ${mapHeight}px)" viewBox="0 0 34 ${mapHeight}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g><rect width="34" height="${mapHeight}" fill="transparent"/>${out.join('')}</g><text x="17" y="${mapHeight + 20}" class="source-minimap-progress">${percent}%</text></svg>`
}

/** Reader style defaults for a reader with no preferences (LabApp's root style with DEFAULT_LAB_PREFS). */
export const READER_ROOT_STYLE = "--lab-font-reader: 'Literata', 'EB Garamond', Georgia, serif; --lab-font-size: 1.1; --lab-text-align: left; --lab-line-height: 1.48; --lab-reader-margin: 1.55rem; --lab-reader-margin-scale: 1; --lab-paragraph-gap: .28em;"

/** Page-only rules: a document that scrolls (the reader scrolls an inner box), the margin beside the paper, the ask field. */
export function pageStyles(): string {
  return `<style>
html.tinct-scene { overflow-x: hidden; background: var(--scene-room, #ece7db); }
html.tinct-scene body { height: auto; min-height: 100%; overflow: visible; background: var(--scene-room, #ece7db); }
html.tinct-scene #root { height: auto; min-height: 100svh; display: block; overflow: visible; }
.tinct-scene .lab { min-height: 100svh; height: auto !important; max-height: none !important; overflow: visible !important; background: var(--lab-paper); }
.tinct-scene .lab > .lab-header { position: sticky !important; top: 0 !important; z-index: 70; background: var(--lab-paper); }
.tinct-scene .lab-header a, .tinct-scene .scene-link { color: inherit; text-decoration: none; }
.tinct-scene .lab-header .lab-header-work { margin: 0; }
.tinct-scene .lab-body, .tinct-scene .lab-page-wrap, .tinct-scene .continuous-reader { height: auto !important; min-height: 0 !important; overflow: visible !important; }
.tinct-scene .lab.is-desktop .continuous-reader { display: flex; align-items: flex-start; padding-bottom: 0 !important; }
.tinct-scene .lab.is-desktop .continuous-reader-paper { flex: none; margin-bottom: 0; }
.tinct-scene .lab.is-desktop .continuous-reader-window { padding-bottom: 72px; }
/* The reader paints its own selection over word spans; here the browser's selection is the selection, in the reader's colour (.lab-passage ::selection). */
.tinct-scene .lab-passage, .tinct-scene .lab-passage * { -webkit-user-select: text !important; user-select: text !important; -webkit-touch-callout: default !important; }
.tinct-scene .scene-margin { flex: 1 1 0; min-width: 0; max-width: 380px; position: sticky; top: 87px; margin: 87px 0 0 18px; }
.tinct-scene .scene-margin .source-margin-item { position: static; width: auto; }
.tinct-scene .scene-margin .lab-first-hint { margin: 0 0 16px; }
.tinct-scene .lab .selection-popup.scene-selection-bar { position: absolute !important; }
.tinct-scene .lab .selection-popup.scene-selection-bar[hidden] { display: none !important; }
.tinct-scene .scene-ask-form { margin: 0 0 14px; }
.tinct-scene .scene-ask-form .lab-pcard-follow { margin: 0; }
.tinct-scene .scene-margin .lab-start-acts a { display: inline-flex; align-items: center; min-height: 30px; padding: 4px 0 2px; color: var(--lab-ink); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent); font: 16px/1.4 'EB Garamond', Georgia, serif; }
.tinct-scene .lab-chapter-end-actions a { color: inherit; text-decoration: none; }
.tinct-scene .scene-turns { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin: 34px 0 0; }
.tinct-scene .scene-turns a { text-decoration: none; font: 400 16px/1.4 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); border-bottom: 1px solid var(--lab-border, rgba(32,26,19,.2)); padding: 3px 0; }
.tinct-scene .scene-turns a:hover, .tinct-scene .scene-turns a:focus-visible { color: var(--lab-ink); }
.tinct-scene .scene-dock { display: none; }
.tinct-scene .lab.is-phone .scene-margin, .tinct-scene .lab.is-phone .source-minimap, .tinct-scene .lab.is-phone .lab-header-notebook, .tinct-scene .lab.is-phone .lab-v2-aa, .tinct-scene .lab.is-phone .lab-v2-library-back { display: none; }
.tinct-scene .lab.is-phone .continuous-reader-paper { width: auto; margin: 0; box-shadow: none; }
.tinct-scene .lab.is-phone .lab-book { padding: 12px max(20px, env(safe-area-inset-left, 0px)) 140px max(20px, env(safe-area-inset-right, 0px)); }
.tinct-scene .lab.is-phone .scene-dock { display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 80; margin: 0; background: var(--lab-paper); border-top: 1px solid var(--lab-border, rgba(32,26,19,.12)); padding: 10px max(16px, env(safe-area-inset-right, 0px)) calc(10px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
.tinct-scene .lab.is-phone .scene-dock .lab-pcard-follow { margin: 0; }
${viewStyles()}
</style>`
}

/**
 * The text switch and the two-column layout, shared by scene and chapter pages (Anders, 19 Nov 2026, approved
 * mockups): the `.lab` root's data-view says what shows — modern (one column), original (one column) or both
 * (side by side, paragraph beside paragraph). Both texts are always in the HTML; the hidden one is hidden here.
 * The switch is italic serif, like the chapter label beside it (an approved exception to the system-UI rule).
 */
function viewStyles(): string {
  return `.tinct-scene .chapter-pairs { position: relative; }
.tinct-scene .chapter-col { display: block; }
.tinct-scene .chapter-col-head { display: none; margin: 0 0 12px; font: 400 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }
.tinct-scene .lab[data-view="modern"] .chapter-col-original, .tinct-scene .lab[data-view="original"] .chapter-col-modern { display: none; }
.tinct-scene .lab[data-view="both"] .chapter-pairs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-auto-flow: row dense; column-gap: 52px; }
.tinct-scene .lab[data-view="both"] .chapter-pairs::after { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: var(--lab-border, rgba(123, 110, 90, .18)); opacity: .6; }
.tinct-scene .lab[data-view="both"] .chapter-col { display: contents; }
.tinct-scene .lab[data-view="both"] .chapter-col-head { display: block; }
.tinct-scene .lab[data-view="both"] .chapter-col-modern > * { grid-column: 1; }
.tinct-scene .lab[data-view="both"] .chapter-col-original > * { grid-column: 2; }
.tinct-scene .lab.is-desktop[data-view="both"] .continuous-reader-paper { width: min(calc(70rem + 2 * var(--continuous-paper-pad, 3rem)), calc(100% - clamp(16rem, 24vw, 22rem) - clamp(3.5rem, 6vw, 6rem))); margin-left: clamp(3.5rem, 6vw, 6rem); }
.tinct-scene .lab.is-desktop[data-view="both"] .chapter-pairs .lab-hearing-line { font-size: calc(1.08rem * (var(--lab-font-size, 1.3) / 1.3)); line-height: 1.55; }
.tinct-scene .lab[data-view="both"] .chapter-col-original .lab-hearing-line { color: var(--lab-ink-muted); }
@media (max-width: 1100px) { .tinct-scene .lab.is-desktop[data-view="both"] .continuous-reader-paper { width: calc(100% - 320px); margin-left: 56px; } .tinct-scene .lab[data-view="both"] .chapter-pairs { column-gap: 32px; } }
.tinct-scene .lab-hearing-line { scroll-margin-top: 96px; }
.tinct-scene .chapter-view-switch { display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; background: color-mix(in srgb, var(--lab-ink) 7%, transparent); }
.tinct-scene .chapter-view-switch button { border: 0; margin: 0; background: none; padding: 4px 13px; min-height: 30px; border-radius: 999px; font: italic 400 16px/1.2 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); cursor: pointer; }
.tinct-scene .lab[data-view="modern"] .chapter-view-switch button[data-view="modern"], .tinct-scene .lab[data-view="original"] .chapter-view-switch button[data-view="original"], .tinct-scene .lab[data-view="both"] .chapter-view-switch button[data-view="both"] { background: var(--lab-paper); color: var(--lab-ink); box-shadow: 0 1px 2px rgba(32, 26, 19, .14); }
.tinct-scene .chapter-view-switch.is-desk { margin-right: 14px; }
.tinct-scene .chapter-view-switch.is-phone { display: none; }
.tinct-scene .lab.is-phone .chapter-view-switch.is-desk { display: none; }
.tinct-scene .lab.is-phone .chapter-view-switch.is-phone { display: inline-flex; margin: 2px 0 20px; }
.tinct-scene .chapter-of { color: var(--lab-ink-muted); }
/* "Chapter 26 of 38" on one line on a phone, still above the text size. */
.tinct-scene .lab.is-phone .lab-passage-headline { font-size: calc(1.75rem * (var(--lab-font-size, 1.3) / 1.3)); line-height: 1.25; }
.tinct-scene .lab.is-phone .lab-passage-headline .chapter-of { white-space: nowrap; }
.tinct-scene .chapter-view-switch button { white-space: nowrap; }
.tinct-scene .chapter-name { margin: 4px 0 18px; font: italic 400 19px/1.35 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); }
.tinct-scene .chapter-continue { margin: 40px 0 8px; }
.tinct-scene .chapter-continue-link { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 22px; border-radius: 999px; background: var(--lab-ink); color: var(--lab-paper) !important; font: 500 16px/1.2 system-ui, -apple-system, 'Segoe UI', sans-serif; text-decoration: none; }
.tinct-scene .chapter-continue-link:hover, .tinct-scene .chapter-continue-link:focus-visible { opacity: .9; }
.tinct-scene .book-head { margin: 0 0 34px; padding: 0 0 22px; border-bottom: 1px solid var(--lab-border, rgba(32,26,19,.12)); }
.tinct-scene .book-head-title { margin: 0; font: 600 clamp(30px, 4vw, 42px)/1.1 'EB Garamond', Georgia, serif; color: var(--lab-ink); letter-spacing: -.005em; }
.tinct-scene .book-head-author { margin: 6px 0 0; font: italic 400 20px/1.3 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); }
.tinct-scene .book-head-facts { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin: 16px 0 0; font: 400 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }
.tinct-scene .book-structure { padding: 4px 11px; border: 1px solid var(--lab-border, rgba(32,26,19,.18)); border-radius: 999px; }
.tinct-scene .book-head-facts a { color: var(--lab-ink-muted); text-decoration: underline; text-underline-offset: 3px; }
.tinct-scene .book-resume { display: inline-flex; margin: 16px 0 0; font: 500 15px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink); text-decoration: underline; text-underline-offset: 3px; }
.tinct-scene .book-resume[hidden] { display: none; }
.tinct-scene .book-chapters { margin: 48px 0 0; }
.tinct-scene .book-chapters h2 { margin: 0 0 14px; font: 600 24px/1.2 'EB Garamond', Georgia, serif; color: var(--lab-ink); }
.tinct-scene .book-chapters ol { list-style: none; margin: 0; padding: 0; columns: 2 18rem; column-gap: 32px; }
.tinct-scene .book-chapters li { break-inside: avoid; margin: 0 0 6px; }
.tinct-scene .book-chapters a { font: 400 17px/1.4 'EB Garamond', Georgia, serif; color: var(--lab-ink); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, currentColor 22%, transparent); }
.tinct-scene .book-chapters a:hover, .tinct-scene .book-chapters a:focus-visible { border-bottom-color: currentColor; }
.tinct-scene .lab.is-phone .book-chapters ol { columns: 1; }
.tinct-scene .chapter-saved { margin: 10px 0 0; font: 400 14px/1.45 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--lab-ink-muted); }`
}

/** The header's icons, drawn once per build: the same markup on every page. */
let headerIcons: { back: string; notebook: string; menu: string } | null = null
function icons() {
  headerIcons ??= {
    back: renderToStaticMarkup(<LibraryBackIcon size={LAB_V2_PLAY_PX} />),
    notebook: renderToStaticMarkup(<ReaderNotebookIcon />),
    // The reader's own t button, at rest; a click hands over to the reader's menu.
    menu: renderToStaticMarkup(<LabSuperButton open={false} onToggle={() => {}} />)
      .replace('<button ', `<button data-scene-action="menu" `)
      // The button shows its first frame (the t); the reader sets the frames' opacity on mount.
      .replace(/data-frame="(\d+)"/g, (_, frame: string) => `data-frame="${frame}" style="opacity:${frame === '0' ? 1 : 0}"`),
  }
  return headerIcons
}

export type TextView = 'modern' | 'original' | 'both'

/**
 * The text switch (Anders, 19 Nov 2026): on a desktop "Original | Modern | Both" in the top bar, on a phone
 * "Modern English | Original" under the heading. `selected` is the page's default; the page script and the layout
 * script keep the reader's own choice from page to page.
 */
export function viewSwitchHtml(kind: 'desk' | 'phone', selected: TextView): string {
  const items: Array<[TextView, string]> = kind === 'desk'
    ? [['original', 'Original'], ['modern', 'Modern'], ['both', 'Both']]
    : [['modern', 'Modern English'], ['original', 'Original']]
  const pressed = (view: TextView) => view === selected || (kind === 'phone' && selected === 'both' && view === 'modern')
  return `<div class="chapter-view-switch is-${kind}" role="group" aria-label="Text shown">${items.map(([view, label]) => `<button type="button" data-view="${view}" aria-pressed="${pressed(view)}">${label}</button>`).join('')}</div>`
}

/** "Chapter 26 of 38" with the "of 38" dimmer; just the label when the unit has no count. */
export function positionHtml(label: string, of: number | null): string {
  return `${escapeHtml(label)}${of ? `<span class="chapter-of"> of ${of}</span>` : ''}`
}

export function headerHtml(book: ScenePageBook, chapter: EditionChapter, options: { labelHtml?: string; switchHtml?: string } = {}): string {
  const { back, notebook, menu } = icons()
  const handoff = (action: SceneHandoffAction) => escapeHtml(sceneHandoffHref(book.id, chapter.number, action))
  return `<header class="lab-header">
<a class="lab-v2-library-back" href="/library?book=${encodeURIComponent(book.id)}" aria-label="Back to library" title="Library" data-scene-keep>${back}</a>
<div class="lab-header-brand"><p class="lab-header-work"><a class="lab-header-book" href="/read/${book.id}" data-scene-keep><span>${escapeHtml(book.title)}</span></a></p><span class="lab-title-sep" aria-hidden="true"> · </span><a class="lab-header-chapter" href="${handoff('contents')}" data-scene-action="contents" aria-label="Table of contents, ${escapeHtml(chapter.title)}"><span class="lab-header-chapter-label">${options.labelHtml ?? escapeHtml(chapter.title)}</span><span class="lab-header-chevron" aria-hidden="true">∨</span></a></div>
<div class="lab-header-controls">${options.switchHtml ?? ''}<button type="button" class="lab-header-notebook" aria-label="Notebook" title="Notebook" data-scene-action="notebook">${notebook}</button><button type="button" class="lab-v2-aa" aria-label="Reading appearance" title="Reading appearance" data-scene-action="appearance">Aa</button>${menu}</div>
</header>`
}

let sendIcon: string | null = null
/** The reader's own ask field (PhoneFollow: the margin cards' "Ask a follow-up"), sending to the reader. */
export function askField(placeholder: string, className = '', label = 'Ask about this scene'): string {
  sendIcon ??= renderToStaticMarkup(<PhoneIcon name="up" />)
  const send = sendIcon
  return `<form class="scene-ask-form${className ? ` ${className}` : ''}" action="/reader" data-scene-ask><div class="lab-pcard-follow"><div class="lab-pcard-follow-box"><textarea class="lab-pcard-follow-input" name="q" rows="1" maxlength="500" enterkeyhint="send" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(label)}"></textarea><button type="submit" class="lab-pcard-send" aria-label="Send" disabled>${send}</button></div></div></form>`
}

export const act = (label: string, href: string, action: SceneHandoffAction, className = '') =>
  `<a${className ? ` class="${className}"` : ''} href="${escapeHtml(href)}" data-scene-action="${action}"><span><span class="lab-chapter-primer-mark" aria-hidden="true">✧</span>${label}</span></a>`

/** What the play's book page adds around its first scene (docs/seo-brief-2026-11-19.md §1). */
export interface PlayBookPage { source: EditionSource | null }

/**
 * One scene page; with `bookPage`, the play's book page (`/read/{bookId}`): the first scene under a slim header
 * (title, author, structure, a link to the scene list), the scene list below it, its own title and canonical.
 * `chapters` are the modern edition's, in order; `original` is the same chapter of original-en. Both texts are in
 * the HTML; desktop shows them side by side, a phone the Modern English, and the switch changes that.
 */
export function renderScenePage(input: {
  book: ScenePageBook
  chapters: readonly EditionChapter[]
  chapterNumber: number
  original: EditionChapter | null
  /** `{bookId}-lines.json` when it lineates original-en (Hamlet, Macbeth). */
  originalLines?: VerseLineSidecar | null
  note?: string | null
  bookPage?: PlayBookPage | null
}): ScenePage {
  const { book, chapters, chapterNumber, original, originalLines, bookPage } = input
  const index = chapters.findIndex(chapter => chapter.number === chapterNumber)
  const chapter = chapters[index]
  if (!chapter) throw new Error(`${book.id}: no chapter ${chapterNumber}`)
  resetVerseLines()
  // Typographer's quotes in the Modern English (docs/seo-brief-2026-11-19.md §2); speakers are found in that text.
  const modernParagraphs = chapter.paragraphs.map(curlyQuotes)
  registerShakespeareSpeakers(modernParagraphs)
  if (original) {
    if (originalLines?.edition === 'original-en') registerVerseLines(original.paragraphs, originalLines.chapters[String(chapterNumber)])
    registerShakespeareSpeakers(original.paragraphs)
  }
  const slug = sceneSlug(chapter.title)
  const { scene, place } = splitSceneTitle(chapter.title)
  const labels = new Map(chapters.map(item => [item.number, splitSceneTitle(item.title).scene]))
  const positions = chapterPositions(labels)
  const position = positions.get(chapter.number) ?? { label: scene, of: null }
  const first = chapters[0]
  // The first scene's own page points search engines at the play's book page, which is the same scene.
  const pathOf = (target: EditionChapter) => target.number === first.number ? `/read/${book.id}` : scenePagePath(book.id, sceneSlug(target.title))
  const canonical = `${SCENE_PAGE_ORIGIN}${pathOf(chapter)}`
  const structure = bookPage ? structureFacts(labels.values()) : null
  // "5 acts and 20 scenes" reads better in a sentence than the pill's "5 acts · 20 scenes".
  const units = structure ? (structure.pill.includes('+') ? structure.units : structure.pill.replace(' · ', ' and ')) : ''
  const title = bookPage ? bookPageTitle(book, true) : scenePageTitle(book, chapter.title, position.of)
  const description = bookPage ? bookPageDescription(book, units, bookPage.source) : scenePageDescription(book, chapter.title)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  const lastParagraph = Math.max(0, chapter.paragraphs.length - 1)
  const reader = (action: SceneHandoffAction, at?: number) => sceneHandoffHref(book.id, chapter.number, action, at)
  const positionLabel = (target: EditionChapter) => {
    const at = positions.get(target.number)
    return at ? `${at.label}${at.of ? ` of ${at.of}` : ''}` : splitSceneTitle(target.title).scene
  }
  const turn = (target: EditionChapter | undefined, rel: 'prev' | 'next') => target
    ? `<a href="${pathOf(target)}" rel="${rel}" data-scene-keep>${rel === 'prev' ? '← ' : ''}${escapeHtml(splitSceneTitle(target.title).scene)}${rel === 'next' ? ' →' : ''}</a>`
    : '<span></span>'
  const view: TextView = 'both'
  const headingTag = bookPage ? 'h2' : 'h1'
  const jsonLd = bookPage
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Book', '@id': `${SCENE_PAGE_ORIGIN}/read/${book.id}#book`, name: book.title, author: { '@type': 'Person', name: book.author },
            url: canonical, inLanguage: 'en', isAccessibleForFree: true, description,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Library', item: `${SCENE_PAGE_ORIGIN}/read/` },
              { '@type': 'ListItem', position: 2, name: book.title, item: canonical },
            ],
          },
        ],
      }
    : {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage', '@id': `${canonical}#page`, url: canonical, name: title.replace(/ \| Tinct$/, ''), description, inLanguage: 'en',
            isPartOf: { '@type': 'Book', '@id': `${SCENE_PAGE_ORIGIN}/read/${book.id}#book`, name: book.title, author: { '@type': 'Person', name: book.author }, url: `${SCENE_PAGE_ORIGIN}/read/${book.id}` },
            isAccessibleForFree: true,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Library', item: `${SCENE_PAGE_ORIGIN}/read/` },
              { '@type': 'ListItem', position: 2, name: book.title, item: `${SCENE_PAGE_ORIGIN}/read/${book.id}` },
              { '@type': 'ListItem', position: 3, name: scene, item: `${SCENE_PAGE_ORIGIN}${scenePagePath(book.id, slug)}` },
            ],
          },
        ],
      }
  const bookHead = bookPage && structure ? `<header class="book-head">
<h1 class="book-head-title">${escapeHtml(book.title)}</h1>
<p class="book-head-author">${escapeHtml(book.author)}</p>
<p class="book-head-facts"><span class="book-structure" id="book-structure">${escapeHtml(structure.pill)}</span><a href="#chapters" data-scene-keep>All ${chapters.length} scenes</a></p>
<a class="book-resume" href="/read/${book.id}" data-place-resume hidden></a>
</header>` : ''
  const sceneList = bookPage ? `<section class="book-chapters" id="chapters" aria-labelledby="chapters-title">
<h2 id="chapters-title">Scenes</h2>
<ol>
${chapters.map(item => `<li><a href="${pathOf(item)}" data-scene-keep>${escapeHtml(item.title)}</a></li>`).join('\n')}
</ol>
</section>` : ''
  const html = `<!doctype html>
<html lang="en" class="tinct-scene" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!--tinct:seo-->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:title" content="${escapeHtml(title.replace(/ \| Tinct$/, ''))}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:type" content="${bookPage ? 'book' : 'article'}">
  <meta property="og:site_name" content="Tinct">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
  <!--/tinct:seo-->
  <link rel="stylesheet" href="/fonts/tinct-fonts.css">
  ${READER_CSS_PLACEHOLDER}
  ${pageStyles()}
  <script type="module" src="${sceneAssetPlaceholder('scene-page.js')}"></script>
</head>
<body>
<div id="root">
<div class="lab is-desktop" lang="en" data-scene-page="true"${bookPage ? ' data-book-page="true"' : ''} data-shared-reader="true" data-continuous-reader="true" data-shakespeare="true" data-shakespeare-layout="verse" data-theme="light" data-lab-layout="desktop" data-reader-controls="desktop" data-chrome-version="v2" data-book-id="${book.id}" data-chapter="${chapter.number}" data-chapter-label="${escapeHtml(positionLabel(chapter))}" data-view="${view}" data-default-view="${view}" data-reader-edition="${SCENE_HANDOFF_EDITION}" data-scene-title="${escapeHtml(chapter.title)}" data-scene-paragraphs="${chapter.paragraphs.length}" style="${READER_ROOT_STYLE}">
<script src="${sceneAssetPlaceholder('scene-layout.js')}"></script>
${headerHtml(book, chapter, { labelHtml: positionHtml(position.label, position.of), switchHtml: original ? viewSwitchHtml('desk', view) : '' })}
<div class="lab-body"><div class="lab-page-wrap">
${renderMinimap(chapters, chapter.number)}
<div class="continuous-reader">
<div class="continuous-reader-paper"><div class="continuous-reader-window">
<article class="lab-passage lab-book is-reading" data-scene-text="true">
${bookHead}
<header class="lab-passage-header"><${headingTag} class="lab-passage-headline">${positionHtml(position.label, position.of)}</${headingTag}>${place ? `<p class="chapter-name">${escapeHtml(place)}</p>` : ''}${original ? viewSwitchHtml('phone', view) : ''}</header>
<div class="lab-hearing-stage chapter-pairs" data-scene-modern="true">
<div class="chapter-col chapter-col-modern">
<p class="chapter-col-head">Modern English</p>
${modernParagraphs.map((text, at) => renderParagraph(text, at)).join('\n')}
</div>
${original ? `<div class="chapter-col chapter-col-original" lang="en">
<p class="chapter-col-head">Shakespeare's original</p>
${original.paragraphs.map((text, at) => renderParagraph(text, at, 'orig-p-').replace(` data-p="${at}"`, '')).join('\n')}
</div>` : ''}
</div>
${next ? `<div class="chapter-continue"><a class="chapter-continue-link" href="${pathOf(next)}" rel="next" data-scene-keep>Continue reading: ${escapeHtml(positionLabel(next))} <span aria-hidden="true">→</span></a><p class="chapter-saved" data-place-note hidden>Your place is saved on this device. No account needed.</p></div>` : ''}
<section class="lab-chapter-end" aria-label="End of the scene"><div class="lab-chapter-end-actions">${act('Recap', reader('recap', lastParagraph), 'recap', 'lab-chapter-recap')}${act('Quiz me', reader('quiz'), 'quiz', 'lab-chapter-recap')}</div></section>
<nav class="scene-turns" aria-label="Scenes">${turn(previous, 'prev')}<a class="scene-contents" href="/read/${book.id}#chapters" data-scene-keep>Contents</a>${turn(next, 'next')}</nav>
${input.note ? `<p class="chapter-note">${input.note}</p>` : ''}
${sceneList}
</article>
</div></div>
<aside class="scene-margin" aria-label="Margin"><section class="source-margin-item is-open is-actions is-hint"><div class="source-margin-content">
<div class="lab-first-hint" data-testid="margin-first-hint">
<p class="lab-first-hint-text">Highlight any passage to have it explained, simplified, or to ask about it.</p>
<div class="lab-start-acts">${act(`Primer for ${scene}`, reader('primer'), 'primer')}</div>
</div>
${askField('Or ask about this scene')}
</div></section></aside>
</div>
</div></div>
${askField('Ask about this scene', 'scene-dock')}
</div>
</div>
</body>
</html>
`
  return { bookId: book.id, chapterNumber: bookPage ? 0 : chapter.number, slug: bookPage ? '' : slug, title: chapter.title, scene, html }
}

/** Every scene page of a book, in edition order; with `bookPage`, the play's book page first (chapterNumber 0, no slug). */
export function renderScenePages(input: {
  book: ScenePageBook
  modern: Edition
  original: Edition | null
  originalLines?: VerseLineSidecar | null
  note?: string | null
  bookPage?: PlayBookPage | null
}): ScenePage[] {
  const originals = new Map((input.original?.chapters ?? []).map(chapter => [chapter.number, chapter]))
  const render = (chapter: EditionChapter, bookPage: PlayBookPage | null) => renderScenePage({
    book: input.book, chapters: input.modern.chapters, chapterNumber: chapter.number,
    original: originals.get(chapter.number) ?? null, originalLines: input.originalLines, note: input.note, bookPage,
  })
  const pages = input.modern.chapters.map(chapter => render(chapter, null))
  const slugs = new Set(pages.map(page => page.slug))
  if (slugs.size !== pages.length) throw new Error(`${input.book.id}: two scenes share an address`)
  if (input.bookPage && input.modern.chapters.length) pages.unshift(render(input.modern.chapters[0], input.bookPage))
  resetVerseLines()
  return pages
}
