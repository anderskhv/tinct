import { useEffect, useLayoutEffect, useRef, type ReactNode, type MutableRefObject } from 'react'
import { consumeDismissGesture } from '../../utils/consumeDismissGesture'
import { useLabKeyboardDock } from '../useLabKeyboardDock'
import { LAB_KEYBOARD_SHEET_ATTR } from '../labChrome'
import { LabInlineMarkdown, LabMarkdown } from '../LabMarkdown'
import './marginPhone.css'

/** The margin reader's card icons (public/lab/addbook/js/margin.js ICONS), drawn on an 18px grid. */
export function PhoneIcon({ name }: { name: 'more' | 'note' | 'highlight' | 'mic' | 'up' | 'trash' }) {
  const body = {
    more: <><circle cx="4" cy="9" r=".9" /><circle cx="9" cy="9" r=".9" /><circle cx="14" cy="9" r=".9" /></>,
    note: <><path d="M11.6 3.4l2.9 2.9-7.6 7.6-3.6.8.8-3.6z" /><path d="M10.1 4.9l2.9 2.9M10.5 15.3h4.6" /></>,
    highlight: <><path d="M12.3 2.8l2.9 2.9-6.6 6.6-2.9-2.9z" /><path d="M5.7 9.4l-1.2 4 4-1.2M3.4 15.4h3.4" /></>,
    mic: <><rect x="6.5" y="2.5" width="5" height="8.5" rx="2.5" /><path d="M4 9a5 5 0 0 0 10 0M9 14v2M6.5 16h5" /></>,
    up: <path d="M9 14V4M4.5 8.5 9 4l4.5 4.5" />,
    trash: <path d="M3.5 5h11M7.2 5V3.4h3.6V5M5 5l.8 9.6h6.4L13 5M7.6 7.8v4.4M10.4 7.8v4.4" />,
  }[name]
  return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false" className="lab-picon">{body}</svg>
}

export interface LabPhoneCardProps {
  /** "Explain · Chapter 1": the action, then the chapter. */
  label: string
  kind: string
  onClose: () => void
  /** The bin: removes what the card holds (a note), or discards the card. */
  onDelete?: () => void
  deleteLabel?: string
  children: ReactNode
  /** The follow-up line, kept above the keyboard. */
  foot?: ReactNode
  /** A tall card (Chat, Talk) takes a fixed share of the screen; the rest grow with their content. */
  tall?: boolean
  testId?: string
}

/**
 * The phone's bottom card (the margin reader's `.mr-sheet`): a drag handle, the
 * label, the body and the follow-up line. One at a time; it slides up, closes
 * on a drag down or on a tap outside it, and rides above the software keyboard
 * (visualViewport). It is fixed over the page and never moves it.
 */
export function LabPhoneCard({ label, kind, onClose, onDelete, deleteLabel = 'Delete', children, foot, tall = false, testId = 'lab-phone-card' }: LabPhoneCardProps) {
  const ref = useRef<HTMLElement | null>(null)
  useLabKeyboardDock(ref, true)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  // A tap outside closes the card and does nothing else: the page under the finger does not turn.
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target || ref.current?.contains(target)) return
      // Another sheet or dialog over the card (the account sheet) owns its own taps.
      if (target.closest?.('.lab-v2-sheet-layer, [aria-modal="true"], .lab-super-menu, .lab-pbar')) return
      consumeDismissGesture(event)
      closeRef.current()
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); closeRef.current() } }
    window.addEventListener('pointerdown', outside, { capture: true, passive: false })
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('pointerdown', outside, true); window.removeEventListener('keydown', onKey) }
  }, [])
  // A drag down on the handle or the label closes it.
  const drag = useRef<{ y: number; id: number } | null>(null)
  const onPointerDown = (event: React.PointerEvent) => {
    drag.current = { y: event.clientY, id: event.pointerId }
    try { (event.currentTarget as Element).setPointerCapture(event.pointerId) } catch { /* a synthetic pointer */ }
  }
  const onPointerMove = (event: React.PointerEvent) => {
    const start = drag.current
    if (!start || !ref.current) return
    const dy = Math.max(0, event.clientY - start.y)
    ref.current.style.transform = dy ? `translateY(${dy}px)` : ''
  }
  const onPointerEnd = (event: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    if (ref.current) ref.current.style.transform = ''
    if (start && event.clientY - start.y > 60) onClose()
  }
  return (
    <section
      ref={ref}
      className={`lab-pcard${tall ? ' is-tall' : ''}`}
      role="dialog"
      aria-label={label}
      data-kind={kind}
      data-testid={testId}
      {...{ [LAB_KEYBOARD_SHEET_ATTR]: '' }}
    >
      <div className="lab-pcard-drag" data-testid="lab-phone-card-drag" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
        <div className="lab-pcard-grab" aria-hidden="true" />
        <header className="lab-pcard-head">
          <span className="lab-pcard-label" data-testid="lab-phone-card-label">{label}</span>
          {onDelete && <button type="button" className="lab-pcard-bin" data-testid="lab-phone-card-delete" aria-label={deleteLabel}
            onPointerDown={event => event.stopPropagation()} onClick={onDelete}><PhoneIcon name="trash" /></button>}
        </header>
      </div>
      <div className="lab-pcard-body" data-testid="lab-phone-card-body">{children}</div>
      {foot}
    </section>
  )
}

/** A passage quoted in a card, cut at 120 characters with … (the margin reader's `.mr-quote`). */
export function PhoneQuote({ text }: { text: string }) {
  const flat = text.replace(/\s+/g, ' ').trim()
  const cut = flat.length > 120 ? flat.slice(0, 119).replace(/\s+\S*$/, '') + '…' : flat
  return <p className="lab-pcard-quote" data-testid="lab-phone-card-quote">{cut}</p>
}

/** The first sentence of the first paragraph, and what follows it. */
export function splitLead(paragraph: string): { lead: string; tail: string } {
  const match = /^(.+?[.!?][”"’')\]]*)(\s+|$)/s.exec(paragraph.trim())
  if (!match) return { lead: paragraph.trim(), tail: '' }
  return { lead: match[1], tail: paragraph.trim().slice(match[0].length).trim() }
}

/**
 * An answer: its first sentence bold when more follows (the margin reader's
 * bottom line), then the rest as the reader's small Markdown vocabulary.
 */
export function PhoneAnswer({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/).filter(Boolean)
  if (!blocks.length) return null
  const { lead, tail } = splitLead(blocks[0].replace(/^\*\*(.+)\*\*$/s, '$1'))
  const more = tail || blocks.length > 1
  return (
    <div className="lab-pcard-answer" data-testid="lab-phone-card-answer">
      <p>{more ? <strong className="lab-pcard-lead"><LabInlineMarkdown>{lead.replace(/\*\*/g, '')}</LabInlineMarkdown></strong> : <LabInlineMarkdown>{lead}</LabInlineMarkdown>}{tail ? <> <LabInlineMarkdown>{tail}</LabInlineMarkdown></> : null}</p>
      {blocks.length > 1 && <LabMarkdown>{blocks.slice(1).join('\n\n')}</LabMarkdown>}
    </div>
  )
}

/** Three faint dots while an answer has not begun. */
export function PhoneWait() {
  return <p className="lab-pcard-wait" data-testid="lab-phone-card-wait" aria-label="Loading"><i /><i /><i /></p>
}

export interface PhoneFollowProps {
  value: string
  onChange: (value: string) => void
  onSend: (value: string) => void
  onMic?: () => void
  micOn?: boolean
  placeholder?: string
  label?: string
  inputRef?: MutableRefObject<HTMLTextAreaElement | null>
  disabled?: boolean
}

/** "Ask a follow-up": the field, the mic and send (the margin reader's `.mr-follow`). */
export function PhoneFollow({ value, onChange, onSend, onMic, micOn = false, placeholder = 'Ask a follow-up', label = 'Follow up', inputRef, disabled = false }: PhoneFollowProps) {
  const own = useRef<HTMLTextAreaElement | null>(null)
  const field = inputRef ?? own
  useLayoutEffect(() => {
    const el = field.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(96, el.scrollHeight)}px`
  }, [value, field])
  const send = () => { const text = value.trim(); if (text && !disabled) onSend(text) }
  return (
    <div className="lab-pcard-follow">
      <div className="lab-pcard-follow-box" onClick={() => field.current?.focus({ preventScroll: true })}>
        <textarea
          ref={field}
          className="lab-pcard-follow-input"
          data-testid="lab-phone-card-input"
          rows={1}
          enterKeyHint="send"
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() } }}
        />
        {onMic && <button type="button" className="lab-pcard-mic" data-testid="lab-phone-card-mic" aria-label="Dictate" aria-pressed={micOn}
          onPointerDown={event => event.preventDefault()} onClick={onMic}><PhoneIcon name="mic" /></button>}
        <button type="button" className="lab-pcard-send" data-testid="lab-phone-card-send" aria-label="Send" disabled={!value.trim() || disabled}
          onPointerDown={event => event.preventDefault()} onClick={send}><PhoneIcon name="up" /></button>
      </div>
    </div>
  )
}
