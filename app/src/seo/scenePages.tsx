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

export const SCENE_PAGE_ORIGIN = 'https://tinct.app'
/** The five plays with scene pages (brief, 13 Nov 2026). Other books keep their book page only. */
export const SCENE_PAGE_BOOKS = ['hamlet', 'macbeth', 'romeo-and-juliet', 'julius-caesar', 'othello'] as const
/** Replaced after `vite build` by the reader's own stylesheet links, read from the built app.html. */
export const READER_CSS_PLACEHOLDER = '<!--tinct:reader-css-->'
/** Replaced at build time by the versioned address of a scene page script (public/read/scene-*.js). */
export const sceneAssetPlaceholder = (name: 'scene-page.js' | 'scene-layout.js') => `__TINCT_SCENE_ASSET_${name}__`
const MAX_META_DESCRIPTION_CHARS = 155

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

export function scenePageTitle(book: ScenePageBook, chapterTitle: string): string {
  return `${book.title}, ${splitSceneTitle(chapterTitle).scene} in modern English | Tinct`
}

export function scenePageDescription(book: ScenePageBook, chapterTitle: string): string {
  const { scene, place } = splitSceneTitle(chapterTitle)
  const tail = "the whole scene in a modern-English version, with Shakespeare's original text below it."
  const full = `${book.title}, ${scene}${place ? ` (${place})` : ''}: ${tail}`
  return full.length <= MAX_META_DESCRIPTION_CHARS ? full : `${book.title}, ${scene}: ${tail}`
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

function escapeHtml(value: string): string {
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
function pageStyles(): string {
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
.tinct-scene .scene-welcome { font: 400 19px/1.35 'EB Garamond', Georgia, serif; color: var(--lab-ink); margin: 2px 0 14px; text-wrap: balance; }
.tinct-scene .lab .selection-popup.scene-bar-picture { position: static !important; display: inline-flex; margin: 0 0 1px; pointer-events: none; transform: scale(.8); transform-origin: 0 0; animation: none; }
.tinct-scene .lab .selection-popup.scene-selection-bar { position: absolute !important; }
.tinct-scene .lab .selection-popup.scene-selection-bar[hidden] { display: none !important; }
.tinct-scene .scene-ask-form { margin: 0 0 14px; }
.tinct-scene .scene-ask-form .lab-pcard-follow { margin: 0; }
.tinct-scene .scene-margin .lab-start-acts a { color: inherit; text-decoration: none; }
.tinct-scene .lab-chapter-end-actions a { color: inherit; text-decoration: none; }
.tinct-scene .scene-turns { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin: 34px 0 0; }
.tinct-scene .scene-turns a { text-decoration: none; font: 400 16px/1.4 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); border-bottom: 1px solid var(--lab-border, rgba(32,26,19,.2)); padding: 3px 0; }
.tinct-scene .scene-turns a:hover, .tinct-scene .scene-turns a:focus-visible { color: var(--lab-ink); }
.tinct-scene .scene-original { margin: 34px 0 0; }
.tinct-scene .scene-original > summary { font: 400 16px/1.4 'EB Garamond', Georgia, serif; color: var(--lab-ink-muted); cursor: pointer; }
.tinct-scene .scene-original > div { margin-top: 18px; color: var(--lab-ink-muted); }
.tinct-scene .scene-original .lab-hearing-line { color: var(--lab-ink-muted); }
.tinct-scene .scene-dock { display: none; }
.tinct-scene .lab.is-phone .scene-margin, .tinct-scene .lab.is-phone .source-minimap, .tinct-scene .lab.is-phone .lab-header-notebook, .tinct-scene .lab.is-phone .lab-v2-aa, .tinct-scene .lab.is-phone .lab-v2-library-back { display: none; }
.tinct-scene .lab.is-phone .continuous-reader-paper { width: auto; margin: 0; box-shadow: none; }
.tinct-scene .lab.is-phone .lab-book { padding: 12px max(20px, env(safe-area-inset-left, 0px)) 140px max(20px, env(safe-area-inset-right, 0px)); }
.tinct-scene .lab.is-phone .scene-dock { display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 80; margin: 0; background: var(--lab-paper); border-top: 1px solid var(--lab-border, rgba(32,26,19,.12)); padding: 10px max(16px, env(safe-area-inset-right, 0px)) calc(10px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
.tinct-scene .lab.is-phone .scene-dock .lab-pcard-follow { margin: 0; }
</style>`
}

function headerHtml(book: ScenePageBook, chapter: EditionChapter): string {
  const back = renderToStaticMarkup(<LibraryBackIcon size={LAB_V2_PLAY_PX} />)
  const notebook = renderToStaticMarkup(<ReaderNotebookIcon />)
  // The reader's own t button, at rest; a click hands over to the reader's menu.
  const menu = renderToStaticMarkup(<LabSuperButton open={false} onToggle={() => {}} />)
    .replace('<button ', `<button data-scene-action="menu" `)
    // The button shows its first frame (the t); the reader sets the frames' opacity on mount.
    .replace(/data-frame="(\d+)"/g, (_, frame: string) => `data-frame="${frame}" style="opacity:${frame === '0' ? 1 : 0}"`)
  const handoff = (action: SceneHandoffAction) => escapeHtml(sceneHandoffHref(book.id, chapter.number, action))
  return `<header class="lab-header">
<a class="lab-v2-library-back" href="/library?book=${encodeURIComponent(book.id)}" aria-label="Back to library" title="Library" data-scene-keep>${back}</a>
<div class="lab-header-brand"><p class="lab-header-work"><a class="lab-header-book" href="/read/${book.id}" data-scene-keep><span>${escapeHtml(book.title)}</span></a></p><span class="lab-title-sep" aria-hidden="true"> · </span><a class="lab-header-chapter" href="${handoff('contents')}" data-scene-action="contents" aria-label="Table of contents, ${escapeHtml(chapter.title)}"><span class="lab-header-chapter-label">${escapeHtml(chapter.title)}</span><span class="lab-header-chevron" aria-hidden="true">∨</span></a></div>
<div class="lab-header-controls"><button type="button" class="lab-header-notebook" aria-label="Notebook" title="Notebook" data-scene-action="notebook">${notebook}</button><button type="button" class="lab-v2-aa" aria-label="Reading appearance" title="Reading appearance" data-scene-action="appearance">Aa</button>${menu}</div>
</header>`
}

/** The reader's own ask field (PhoneFollow: the margin cards' "Ask a follow-up"), sending to the reader. */
function askField(placeholder: string, className = ''): string {
  const send = renderToStaticMarkup(<PhoneIcon name="up" />)
  return `<form class="scene-ask-form${className ? ` ${className}` : ''}" action="/reader" data-scene-ask><div class="lab-pcard-follow"><div class="lab-pcard-follow-box"><textarea class="lab-pcard-follow-input" name="q" rows="1" maxlength="500" enterkeyhint="send" placeholder="${escapeHtml(placeholder)}" aria-label="Ask about this scene"></textarea><button type="submit" class="lab-pcard-send" aria-label="Send" disabled>${send}</button></div></div></form>`
}

const act = (label: string, href: string, action: SceneHandoffAction, className = '') =>
  `<a${className ? ` class="${className}"` : ''} href="${escapeHtml(href)}" data-scene-action="${action}"><span><span class="lab-chapter-primer-mark" aria-hidden="true">✧</span>${label}</span></a>`

/** One scene page. `chapters` are the modern edition's, in order; `original` is the same chapter of original-en. */
export function renderScenePage(input: {
  book: ScenePageBook
  chapters: readonly EditionChapter[]
  chapterNumber: number
  original: EditionChapter | null
  /** `{bookId}-lines.json` when it lineates original-en (Hamlet, Macbeth). */
  originalLines?: VerseLineSidecar | null
}): ScenePage {
  const { book, chapters, chapterNumber, original, originalLines } = input
  const index = chapters.findIndex(chapter => chapter.number === chapterNumber)
  const chapter = chapters[index]
  if (!chapter) throw new Error(`${book.id}: no chapter ${chapterNumber}`)
  resetVerseLines()
  registerShakespeareSpeakers(chapter.paragraphs)
  if (original) {
    if (originalLines?.edition === 'original-en') registerVerseLines(original.paragraphs, originalLines.chapters[String(chapterNumber)])
    registerShakespeareSpeakers(original.paragraphs)
  }
  const slug = sceneSlug(chapter.title)
  const { scene } = splitSceneTitle(chapter.title)
  const path = scenePagePath(book.id, slug)
  const canonical = `${SCENE_PAGE_ORIGIN}${path}`
  const title = scenePageTitle(book, chapter.title)
  const description = scenePageDescription(book, chapter.title)
  const previous = chapters[index - 1]
  const next = chapters[index + 1]
  const lastParagraph = Math.max(0, chapter.paragraphs.length - 1)
  const reader = (action: SceneHandoffAction, at?: number) => sceneHandoffHref(book.id, chapter.number, action, at)
  const turn = (target: EditionChapter | undefined, rel: 'prev' | 'next') => target
    ? `<a href="${scenePagePath(book.id, sceneSlug(target.title))}" rel="${rel}" data-scene-keep>${rel === 'prev' ? '← ' : ''}${escapeHtml(splitSceneTitle(target.title).scene)}${rel === 'next' ? ' →' : ''}</a>`
    : '<span></span>'
  const jsonLd = {
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
          { '@type': 'ListItem', position: 3, name: scene, item: canonical },
        ],
      },
    ],
  }
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
  <meta property="og:type" content="article">
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
<div class="lab is-desktop" lang="en" data-scene-page="true" data-shared-reader="true" data-continuous-reader="true" data-shakespeare="true" data-shakespeare-layout="verse" data-theme="light" data-lab-layout="desktop" data-reader-controls="desktop" data-chrome-version="v2" data-book-id="${book.id}" data-chapter="${chapter.number}" data-reader-edition="${SCENE_HANDOFF_EDITION}" data-scene-title="${escapeHtml(chapter.title)}" data-scene-paragraphs="${chapter.paragraphs.length}" style="${READER_ROOT_STYLE}">
<script src="${sceneAssetPlaceholder('scene-layout.js')}"></script>
${headerHtml(book, chapter)}
<div class="lab-body"><div class="lab-page-wrap">
${renderMinimap(chapters, chapter.number)}
<div class="continuous-reader">
<div class="continuous-reader-paper"><div class="continuous-reader-window">
<article class="lab-passage lab-book is-reading" data-scene-text="true">
<header class="lab-passage-header"><h1 class="lab-passage-headline">${escapeHtml(chapter.title)}</h1></header>
<div class="lab-book-columns"><div class="lab-book-col"><div class="lab-hearing-stage" data-scene-modern="true">
${chapter.paragraphs.map((text, at) => renderParagraph(text, at)).join('\n')}
</div>
<section class="lab-chapter-end" aria-label="End of the scene"><div class="lab-chapter-end-actions">${act('Recap', reader('recap', lastParagraph), 'recap', 'lab-chapter-recap')}${act('Quiz me', reader('quiz'), 'quiz', 'lab-chapter-recap')}</div></section>
<nav class="scene-turns" aria-label="Scenes">${turn(previous, 'prev')}${turn(next, 'next')}</nav>
${original ? `<details class="scene-original"><summary>Shakespeare's original text of this scene</summary><div lang="en">
${original.paragraphs.map((text, at) => renderParagraph(text, at, 'orig-p-')).join('\n')}
</div></details>` : ''}
</div></div>
</article>
</div></div>
<aside class="scene-margin" aria-label="Margin"><section class="source-margin-item is-open is-actions is-start-later"><header class="source-margin-head"><span class="source-margin-label">${escapeHtml(book.title)} in modern English · ${escapeHtml(scene)}</span></header><div class="source-margin-content">
<p class="scene-welcome">Highlight any passage to have it explained, simplified, or to ask about it.</p>
<div class="selection-popup is-lab is-desk-bar lab-pbar is-desk scene-bar-picture" aria-hidden="true"><span class="lab-pbar-item is-ask">Ask</span><span class="lab-pbar-sep"></span><span class="lab-pbar-item is-text">Explain</span><span class="lab-pbar-item is-text">Simplify</span></div>
${askField('Or ask about this scene')}
<div class="lab-start-card is-later"><div class="lab-start-acts" role="group" aria-label="${escapeHtml(scene)} actions">${act('Primer', reader('primer'), 'primer')}${act('Summary', reader('summary'), 'summary')}${act('Quiz me', reader('quiz'), 'quiz')}</div></div>
</div></section></aside>
</div>
</div></div>
${askField('Ask about this scene', 'scene-dock')}
</div>
</div>
</body>
</html>
`
  return { bookId: book.id, chapterNumber: chapter.number, slug, title: chapter.title, scene, html }
}

/** Every scene page of a book, in edition order. */
export function renderScenePages(input: {
  book: ScenePageBook
  modern: Edition
  original: Edition | null
  originalLines?: VerseLineSidecar | null
}): ScenePage[] {
  const originals = new Map((input.original?.chapters ?? []).map(chapter => [chapter.number, chapter]))
  const pages = input.modern.chapters.map(chapter => renderScenePage({
    book: input.book, chapters: input.modern.chapters, chapterNumber: chapter.number,
    original: originals.get(chapter.number) ?? null, originalLines: input.originalLines,
  }))
  const slugs = new Set(pages.map(page => page.slug))
  if (slugs.size !== pages.length) throw new Error(`${input.book.id}: two scenes share an address`)
  resetVerseLines()
  return pages
}
