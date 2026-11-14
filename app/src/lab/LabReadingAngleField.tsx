import { useEffect, useRef } from 'react'
import { READING_ANGLE_MAX_CHARS } from './labReadingAngle'
import { PhoneIcon } from './marginPhone/LabPhoneCard'
import { SavedNote, useSavedNote } from './LabSavedNote'

/** The reader's reading angle for this book, saved as it is typed, in the "Before you start" card (AI settings' This book has its own field for the same value). Always optional. */
export function ReadingAngleField({ value, onChange, focus = false, testId = 'lab-reading-angle', mic }: {
  value: string; onChange: (value: string) => void; focus?: boolean; testId?: string
  /** Dictation into the field (Anders, 10 Nov 2026: the mic as everywhere else you type to Tinct). */
  mic?: { on: boolean; onToggle: () => void }
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const saved = useSavedNote(value)
  useEffect(() => {
    if (!focus) return
    const field = ref.current
    if (!field) return
    field.focus({ preventScroll: true })
    field.setSelectionRange(field.value.length, field.value.length)
  }, [focus])
  return (
    <label className="lab-reading-angle" data-testid={`${testId}-row`}>
      <span className="lab-reading-angle-top"><span className="lab-reading-angle-label">Reading angle</span><SavedNote shown={saved} testId={`${testId}-saved`} /></span>
      <span className={`lab-reading-angle-box${mic ? ' has-mic' : ''}`}>
        <textarea autoComplete="off" ref={ref} className="lab-reading-angle-input" data-testid={testId} rows={2} maxLength={READING_ANGLE_MAX_CHARS}
          value={value} placeholder="What you want to notice in this book" onChange={event => onChange(event.target.value)} />
        {mic && <button type="button" className="lab-reading-angle-mic" data-testid={`${testId}-mic`} aria-pressed={mic.on}
          aria-label={mic.on ? 'Stop dictation' : 'Dictate your reading angle'} onClick={event => { event.preventDefault(); mic.onToggle() }}><PhoneIcon name="mic" /></button>}
      </span>
    </label>
  )
}

/**
 * The start cards' way to the reading angle (Anders, 11 Nov 2026): "Set reading angle" opens AI settings on This
 * book with the caret in the field; once an angle is set the card shows it, cut to one line, and the same press edits it.
 */
export function ReadingAngleLink({ value, onOpen, testId }: { value: string; onOpen: () => void; testId: string }) {
  const angle = value.trim()
  return (
    <button type="button" className="lab-start-angle-link" data-testid={testId} data-set={angle ? 'true' : 'false'} onClick={onOpen}
      aria-label={angle ? `Reading angle: ${angle}. Edit in AI settings` : 'Set reading angle in AI settings'}>
      <span className="lab-start-angle-text">
        <span className="lab-start-angle-label">{angle ? 'Reading angle' : 'Set reading angle'}</span>
        {angle && <span className="lab-start-angle-value">{angle}</span>}
      </span>
      <span className="lab-start-angle-chevron" aria-hidden="true">›</span>
    </button>
  )
}
