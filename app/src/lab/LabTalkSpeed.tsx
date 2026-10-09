import { useEffect, useId, useRef, useState } from 'react'
import { TALK_SPEED_STEPS, clampTalkSpeed } from './labTalkSpeed'
import { VoiceControl, VoiceSpeedIcon } from './LabVoiceIcons'

/** "1×", "1.25×": the same label narration's speed control shows. */
export function talkSpeedLabel(speed: number): string {
  return `${clampTalkSpeed(speed)}×`
}

interface LabTalkSpeedControlProps {
  speed: number
  onChange: (speed: number) => void
  /** `lab-call` on the phone, `lab-voice-panel` in the desktop Talk window. */
  testIdPrefix: string
  iconSize?: number
}

/**
 * Talk's speaking speed, beside Mute and End. It follows narration's speed
 * control: the button shows the current speed and opens a small popover;
 * here the popover offers the four steps inside xAI's documented range.
 */
export function LabTalkSpeedControl({ speed, onChange, testIdPrefix, iconSize = 24 }: LabTalkSpeedControlProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const popoverId = `${useId()}-talk-speed`
  const current = clampTalkSpeed(speed)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  return (
    <div
      className="lab-talk-speed"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false) }
      }}
    >
      <VoiceControl
        testId={`${testIdPrefix}-speed`}
        word={talkSpeedLabel(current)}
        label={`Playback speed ${current} times. Open speed control`}
        icon={<VoiceSpeedIcon size={iconSize} />}
        expanded={open}
        controls={popoverId}
        onClick={() => setOpen(value => !value)}
      />
      {open && (
        <div
          id={popoverId}
          className="lab-talk-speed-popover"
          data-testid={`${testIdPrefix}-speed-popover`}
          role="group"
          aria-label="Playback speed"
        >
          {TALK_SPEED_STEPS.map(step => (
            <button
              key={step}
              type="button"
              className={`lab-talk-speed-step${step === current ? ' is-current' : ''}`}
              data-testid={`${testIdPrefix}-speed-${step}`}
              aria-pressed={step === current}
              onClick={() => { onChange(step); setOpen(false) }}
            >
              {talkSpeedLabel(step)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
