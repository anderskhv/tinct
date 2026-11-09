import { useEffect, useRef } from 'react'
import { READING_ANGLE_MAX_CHARS } from './labReadingAngle'

/** Book settings' first field: the reader's reading angle for this book, saved as it is typed. Always optional. */
export function ReadingAngleField({ value, onChange, focus = false, testId = 'lab-reading-angle' }: { value: string; onChange: (value: string) => void; focus?: boolean; testId?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!focus) return
    const field = ref.current
    if (!field) return
    field.focus({ preventScroll: true })
    field.setSelectionRange(field.value.length, field.value.length)
  }, [focus])
  return (
    <label className="lab-reading-angle" data-testid={`${testId}-row`}>
      <span className="lab-reading-angle-label">Reading angle</span>
      <textarea ref={ref} className="lab-reading-angle-input" data-testid={testId} rows={2} maxLength={READING_ANGLE_MAX_CHARS}
        value={value} placeholder="What you want to notice in this book" onChange={event => onChange(event.target.value)} />
    </label>
  )
}
