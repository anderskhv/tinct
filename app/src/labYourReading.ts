/**
 * Your reading (/your-reading, social ship 1): the reader's own reading time
 * in the library's look. Served only while the Worker's SOCIAL_READING_TIME
 * switch is on. Figures come from the ledger (/api/reading-time), books
 * finished and chapters from the position record, titles and covers from the
 * library catalogue.
 */
import { LAB_CATALOGUE_URL } from '../public/lab/library-model.js'
import { accountLabPositionRecord, type LabPositionState } from './lab/labPosition'
import { fetchLabPositionCloud, readLabPositionLocal } from './lab/labPositionStore'
import { fetchReadingTime, pendingSeconds, readPending, withPending } from './lab/labReadingTime'
import { deviceReadingSeconds } from './lab/useLabReadingTime'
import { formatDayMonth, formatDuration, hoursMinutes, localDay, readingTimeStats, type ReadingTimeStats } from './readingTime/model'
import { yourReadingView, type CatalogueEntry, type ShelfBook, type YourReadingView } from './readingTime/yourReading'
import { supabase } from './services/supabase'
import { apiUrl } from './utils/apiUrl'

const POSITION_DEVICE_ID = 'lab-your-reading'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: { className?: string; text?: string; attrs?: Record<string, string> } = {}, ...children: Array<Node | string | null | false>): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (props.className) node.className = props.className
  if (props.text !== undefined) node.textContent = props.text
  for (const [key, value] of Object.entries(props.attrs ?? {})) node.setAttribute(key, value)
  for (const child of children) if (child) node.append(child)
  return node
}

/** "41h 20m" with small units. */
function totalFigure(seconds: number, tag: 'h1' | 'p' = 'h1'): HTMLElement {
  const { hours, minutes } = hoursMinutes(seconds)
  const node = el(tag, { className: 'total', attrs: { 'data-testid': 'your-reading-total' } })
  if (hours > 0) node.append(String(hours), el('small', { text: 'h' }))
  node.append(String(minutes), el('small', { text: 'm' }))
  return node
}

function hoursLabel(seconds: number): string {
  const hours = seconds / 3600
  return hours === 0 ? '' : hours < 10 ? hours.toFixed(1) : String(Math.round(hours))
}

function shelf(title: string, books: ShelfBook[], empty: string, testId: string): HTMLElement {
  const section = el('section', { className: 'shelf', attrs: { 'data-testid': testId } }, el('h2', { text: title }))
  if (!books.length) {
    section.append(el('p', { className: 'empty', text: empty }))
    return section
  }
  const row = el('div', { className: 'books' })
  for (const book of books) {
    const cover = book.cover
      ? el('img', { className: 'cover', attrs: { src: book.cover, alt: book.title, loading: 'lazy' } })
      : el('span', { className: 'cover paper', text: book.title })
    row.append(el('a', { className: 'book', attrs: { href: `/library?book=${encodeURIComponent(book.bookId)}&view=book-detail` } },
      cover,
      el('span', { className: 'meta' }, el('i', { text: book.progress ?? book.author }), book.hours ? el('span', { text: book.hours }) : null)))
  }
  section.append(row)
  return section
}

export function renderYourReading(main: HTMLElement, stats: ReadingTimeStats, view: YourReadingView, onShare: () => void): void {
  main.replaceChildren()
  const since = stats.firstDay ? `Reading time since ${formatDayMonth(stats.firstDay)}` : 'Reading time'
  const lede = el('p', { className: 'lede' }, 'reading and listening.', view.comparison ? ' ' : null, view.comparison ? el('em', { text: view.comparison }) : null)
  const chips = el('ul', { className: 'chips' })
  if (stats.last7Seconds >= 60) chips.append(el('li', { text: `${formatDuration(stats.last7Seconds)} in the last 7 days` }))
  if (stats.streak >= 2) chips.append(el('li', { text: `${stats.streak}-day streak` }))
  const share = el('button', { className: 'primary', text: 'Share', attrs: { type: 'button', 'data-testid': 'your-reading-share' } })
  share.addEventListener('click', onShare)
  const shareNote = el('p', { className: 'note', attrs: { 'data-share-note': '', role: 'status' } })
  const left = el('div', {}, el('p', { className: 'eyebrow', text: since }), totalFigure(stats.totalSeconds), lede, chips.childElementCount ? chips : null, el('div', { className: 'actions' }, share), shareNote)

  const most = Math.max(1, ...stats.weeks.map(week => week.seconds))
  const chart = el('div', { className: 'chart', attrs: { role: 'img', 'aria-label': 'Hours read per week over the last twelve weeks' } })
  stats.weeks.forEach((week, index) => {
    const height = week.seconds > 0 ? Math.max(3, Math.round(week.seconds / most * 100)) : 1
    const bar = el('span', { className: 'bar' })
    bar.style.height = `${height}%`
    chart.append(el('div', { className: `week${index === stats.weeks.length - 1 ? ' is-now' : ''}` }, el('span', { className: 'value', text: hoursLabel(week.seconds) }), bar))
  })
  const thisWeek = stats.weeks[stats.weeks.length - 1]
  const right = el('div', {},
    el('p', { className: 'chart-head' }, el('span', { text: 'Hours per week' }), el('strong', { text: `This week ${hoursLabel(thisWeek.seconds) || '0'} h` })),
    chart,
    el('p', { className: 'axis' }, el('span', { text: formatDayMonth(stats.weeks[0].start) }), el('span', { text: formatDayMonth(stats.weeks[6].start) }), el('span', { text: 'Now' })))
  main.append(el('section', { className: 'hero' }, left, right))

  const stat = (label: string, value: string, testId: string) => el('li', { attrs: { 'data-testid': testId } }, el('span', { text: label }), el('strong', { text: value }))
  main.append(el('ul', { className: 'stats' },
    stat('Books finished', String(view.finishedCount), 'your-reading-finished-count'),
    stat('Chapters', String(view.chaptersCount), 'your-reading-chapters'),
    stat('Listening', stats.listenSeconds >= 60 ? formatDuration(stats.listenSeconds) : '0 m', 'your-reading-listening'),
    stat('Longest streak', `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`, 'your-reading-longest-streak')))
  main.append(shelf('Reading now', view.readingNow, 'Nothing in progress.', 'your-reading-now'))
  main.append(shelf('Finished', view.finished, 'Books you finish appear here.', 'your-reading-finished'))
}

function message(main: HTMLElement, title: string, body: string, extra: Array<Node | null> = []): void {
  main.replaceChildren(el('section', { className: 'message' }, el('h1', { text: title }), ...extra, el('p', { text: body })))
}

function safeReturn(value: string | null): string {
  return value && /^\/(?:reader|library|you)(?:[/?#]|$)/.test(value) && !value.includes('\\') ? value : '/library'
}

async function loadCatalogue(): Promise<Map<string, CatalogueEntry>> {
  try {
    const response = await fetch(LAB_CATALOGUE_URL)
    if (!response.ok) return new Map()
    const data = await response.json() as { books?: CatalogueEntry[] }
    return new Map((data.books ?? []).map(book => [book.id, book]))
  } catch {
    return new Map()
  }
}

async function loadPositions(token: string, userId: string): Promise<LabPositionState | null> {
  try {
    const local = readLabPositionLocal(POSITION_DEVICE_ID)
    const cloud = await fetchLabPositionCloud(token).catch(() => null)
    return accountLabPositionRecord(local, cloud, userId)
  } catch {
    return null
  }
}

async function shareCard(token: string, note: HTMLElement | null, button: HTMLButtonElement | null): Promise<void> {
  if (button) button.disabled = true
  if (note) note.textContent = ''
  try {
    const response = await fetch(apiUrl('/api/reading-time/card'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ today: localDay() }),
    })
    if (!response.ok) throw new Error(String(response.status))
    const blob = await response.blob()
    const file = new File([blob], 'tinct-reading.png', { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file] }).catch(() => {})
    } else {
      const url = URL.createObjectURL(blob)
      const link = el('a', { attrs: { href: url, download: 'tinct-reading.png' } })
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
      if (note) note.textContent = 'Your reading card is saved as an image.'
    }
  } catch {
    if (note) note.textContent = 'The card could not be made just now. Please try again.'
  } finally {
    if (button) button.disabled = false
  }
}

async function start(): Promise<void> {
  const root = document.querySelector<HTMLElement>('#tinct-your-reading')
  const main = root?.querySelector<HTMLElement>('[data-main]')
  if (!root || !main) return
  const back = root.querySelector<HTMLAnchorElement>('[data-back]')
  if (back) back.href = safeReturn(new URLSearchParams(location.search).get('return'))

  const session = supabase ? (await supabase.auth.getSession().catch(() => null))?.data.session ?? null : null
  if (!session) {
    root.dataset.state = 'signed-out'
    const seconds = deviceReadingSeconds(null)
    const join = el('a', { className: 'primary', text: 'Create a free account', attrs: { href: `/sign-in?mode=create&returnTo=${encodeURIComponent('/your-reading')}` } })
    message(main, 'Your reading', 'Create a free account to keep your reading time and join the leaderboard.', [totalFigure(seconds, 'p')])
    main.firstElementChild?.append(join)
    return
  }

  const [summary, catalogue, positions] = await Promise.all([
    fetchReadingTime(session.access_token),
    loadCatalogue(),
    loadPositions(session.access_token, session.user.id),
  ])
  if (!summary) {
    root.dataset.state = 'unavailable'
    const seconds = pendingSeconds(readPending(session.user.id))
    message(main, 'Your reading', 'Your reading time is not available just now. Time you read is kept on this device and added when it is back.', seconds >= 60 ? [totalFigure(seconds, 'p')] : [])
    return
  }
  const stats = readingTimeStats(withPending(summary.rows, readPending(session.user.id)), localDay())
  const view = yourReadingView({ stats, positions, catalogue })
  root.dataset.state = 'ready'
  renderYourReading(main, stats, view, () => {
    void shareCard(session.access_token, main.querySelector('[data-share-note]'), main.querySelector('[data-testid="your-reading-share"]'))
  })
}

if (typeof document !== 'undefined' && document.querySelector('#tinct-your-reading')) void start()
