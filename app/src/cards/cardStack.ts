/**
 * The card stack: cards over the current page, never a page load.
 *
 * Phone: a sheet from the bottom with a grabber, as tall as its content
 * (at most 90% of the screen, scrolling inside beyond that). Desktop (700px and wider):
 * a 400px panel at top right that scrolls inside itself. A row pushes the
 * next card on top; the back arrow pops one; the cross (or Escape, the scrim,
 * or a pull down on the grabber) closes them all. The page behind is never
 * touched: closing removes only the stack's own element.
 */
import './cards.css'

export const ICONS = {
  x: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>',
  back: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M9 2.5 4.5 7 9 11.5"/></svg>',
  chev: '<svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1.5 1.5 6.5 7l-5 5.5"/></svg>',
  cam: '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 4.5h2.2l1.1-1.6h3.4l1.1 1.6H12v6.5H2z"/><circle cx="7" cy="7.6" r="2"/></svg>',
  scene: '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1.8" y="2.6" width="10.4" height="8.8" rx="1.6"/><path d="M1.8 9.6 4.9 6.6l2.5 2.4 1.6-1.5 3.2 3"/><circle cx="9.3" cy="5.3" r="0.9"/></svg>',
  search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.6"/><path d="M10.4 10.4 14 14"/></svg>',
} as const

export const DESKTOP_QUERY = '(min-width: 700px)'

export interface CardSpec {
  /** For tests and the redirect parameter. */
  id: string
  /** The accessible name of the card. */
  label: string
  /** Builds the card's content (everything under the grabber). Called again on refresh when `live`. */
  render: (card: CardHandle) => Node[]
  live?: boolean
}

export interface CardHandle {
  element: HTMLElement
  stack: CardStack
  /** Rebuild this card's content. */
  refresh: () => void
}

export interface CardStackOptions {
  dark: boolean
  /** Desktop panel top (76 over the reader, 68 over the library). */
  deskTop?: number
  onClosed?: () => void
  doc?: Document
}

type Entry = { spec: CardSpec; handle: CardHandle }

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...children: Array<Node | string | null | false | undefined>): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue
    if (key === 'className') node.className = String(value)
    else if (key === 'text') node.textContent = String(value)
    else if (key === 'html') node.innerHTML = String(value)
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value)
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value as EventListener)
    else if (key === 'dataset' && typeof value === 'object') Object.assign(node.dataset, value)
    else node.setAttribute(key, value === true ? '' : String(value))
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) node.append(child)
  return node
}

export class CardStack {
  readonly root: HTMLElement
  private readonly scrim: HTMLElement
  private readonly entries: Entry[] = []
  private readonly options: CardStackOptions
  private readonly media: MediaQueryList | null
  private closed = false
  private readonly onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    event.stopPropagation()
    this.closeAll()
  }
  private readonly onMedia = () => this.layout()

  constructor(options: CardStackOptions) {
    this.options = options
    const doc = options.doc ?? document
    this.root = el('div', { className: `tcards${options.dark ? ' is-dark' : ''}`, dataset: { testid: 'account-cards' } })
    if (options.deskTop) this.root.style.setProperty('--desk-top', `${options.deskTop}px`)
    this.scrim = el('div', { className: 'tc-scrim', dataset: { testid: 'account-cards-scrim' } })
    this.scrim.addEventListener('click', () => this.closeAll())
    this.root.append(this.scrim)
    this.media = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY) : null
    this.media?.addEventListener?.('change', this.onMedia)
    this.layout()
    doc.body.append(this.root)
    doc.addEventListener('keydown', this.onKey, true)
  }

  get desktop(): boolean {
    return Boolean(this.media?.matches)
  }

  get depth(): number {
    return this.entries.length
  }

  get ids(): string[] {
    return this.entries.map(entry => entry.spec.id)
  }

  get isClosed(): boolean {
    return this.closed
  }

  private layout() {
    this.root.classList.toggle('is-desk', this.desktop)
    this.root.classList.toggle('is-phone', !this.desktop)
  }

  push(spec: CardSpec): CardHandle {
    const element = el('section', { className: 'tc-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': spec.label, tabindex: '-1', dataset: { card: spec.id } })
    const handle: CardHandle = {
      element,
      stack: this,
      refresh: () => {
        const scroll = element.scrollTop
        // A field being typed in keeps its focus across the re-render.
        const active = element.ownerDocument.activeElement as HTMLInputElement | null
        const keep = active && element.contains(active) && active.tagName === 'INPUT' ? active.getAttribute('aria-label') : null
        element.replaceChildren(...this.chrome(), ...spec.render(handle))
        element.scrollTop = scroll
        if (keep) {
          const field = [...element.querySelectorAll<HTMLInputElement>('input')].find(input => input.getAttribute('aria-label') === keep)
          if (field) { field.focus({ preventScroll: true }); try { field.setSelectionRange(field.value.length, field.value.length) } catch { /* search fields */ } }
        }
      },
    }
    for (const entry of this.entries) entry.handle.element.classList.add('is-under')
    this.entries.push({ spec, handle })
    element.replaceChildren(...this.chrome(), ...spec.render(handle))
    this.root.append(element)
    try { element.focus({ preventScroll: true }) } catch { /* old browsers */ }
    return handle
  }

  /** The grabber (phone; hidden by CSS on desktop), with pull-down to close. */
  private chrome(): Node[] {
    const grab = el('div', { className: 'tc-grab', 'aria-hidden': 'true' })
    grab.addEventListener('pointerdown', event => this.pull(event))
    return [grab]
  }

  private pull(start: PointerEvent) {
    const card = this.top?.handle.element
    if (!card || this.desktop) return
    const y0 = start.clientY
    let dy = 0
    const move = (event: PointerEvent) => {
      dy = Math.max(0, event.clientY - y0)
      card.style.transform = `translateY(${dy}px)`
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      card.style.transform = ''
      if (dy > 90) this.closeAll()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  private get top(): Entry | undefined {
    return this.entries[this.entries.length - 1]
  }

  /** Back one card; from the first card, close. */
  back(): void {
    if (this.entries.length <= 1) { this.closeAll(); return }
    this.entries.pop()?.handle.element.remove()
    const top = this.top
    if (top) {
      top.handle.element.classList.remove('is-under')
      if (top.spec.live) top.handle.refresh()
      try { top.handle.element.focus({ preventScroll: true }) } catch { /* old browsers */ }
    }
  }

  /** Re-render every live card (after the shared data changed). */
  refreshLive(): void {
    for (const entry of this.entries) if (entry.spec.live) entry.handle.refresh()
  }

  closeAll(): void {
    if (this.closed) return
    this.closed = true
    const doc = this.options.doc ?? document
    doc.removeEventListener('keydown', this.onKey, true)
    this.media?.removeEventListener?.('change', this.onMedia)
    this.entries.length = 0
    this.root.remove()
    this.options.onClosed?.()
  }
}

/** The bar above a card: back (when there is a card to go back to), the title, the cross. */
export function navBar(handle: CardHandle, title: string, options: { back?: boolean } = {}): HTMLElement {
  const showBack = options.back ?? handle.stack.depth > 1
  const back = showBack
    ? el('button', { type: 'button', className: 'tc-disc', 'aria-label': 'Back', html: ICONS.back, dataset: { testid: 'card-back' }, onclick: () => handle.stack.back() })
    : el('span')
  const close = el('button', { type: 'button', className: 'tc-disc is-end', 'aria-label': 'Close', html: ICONS.x, dataset: { testid: 'card-close' }, onclick: () => handle.stack.closeAll() })
  return el('div', { className: 'tc-nav' }, back, el('h2', { className: 'tc-title', text: title }), close)
}

export function chevron(): HTMLElement {
  return el('span', { className: 'tc-chev', html: ICONS.chev, 'aria-hidden': 'true' })
}

/** A row; a button when it does something. */
export function row(options: { label: string | Node; value?: string | Node | null; chevron?: boolean; onClick?: () => void; className?: string; testid?: string; extra?: Node[] }): HTMLElement {
  const label = typeof options.label === 'string' ? el('span', { className: 'tc-l' }, el('span', { className: 'tc-lt', text: options.label })) : options.label
  const value = options.value === undefined || options.value === null || options.value === ''
    ? null
    : typeof options.value === 'string' ? el('span', { className: 'tc-v', text: options.value }) : options.value
  const children = [label, value, ...(options.extra ?? []), options.chevron ? chevron() : null]
  const props = { className: `tc-r${options.className ? ` ${options.className}` : ''}`, dataset: options.testid ? { testid: options.testid } : undefined }
  return options.onClick
    ? el('button', { type: 'button', ...props, onclick: options.onClick }, ...children)
    : el('div', props, ...children)
}

export function group(...rows: Array<Node | null | false | undefined>): HTMLElement | null {
  const kept = rows.filter(Boolean) as Node[]
  return kept.length ? el('div', { className: 'tc-g' }, ...kept) : null
}

export function heading(text: string, style?: Record<string, string>): HTMLElement {
  return el('h3', { className: 'tc-gh', text, style })
}
