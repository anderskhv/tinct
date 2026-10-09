import { LAB_CALL_COPY } from './labVoiceCall'

/**
 * "You're talking to an AI." (EU AI Act art. 50; DECISIONS.md 2026-10-08).
 * A legal condition of Talk, so it must stay on both the phone call and the
 * desktop Talk window. It is one element with one shared class
 * (`.lab-ai-disclosure`) so its look and placement can change in one place
 * (fade after the start, a header label, or as it is) without touching the
 * surfaces that render it.
 */
export function LabAiDisclosure({ className, testId }: { className: string; testId: string }) {
  return (
    <p className={`lab-ai-disclosure ${className}`} data-testid={testId}>
      {LAB_CALL_COPY.aiDisclosure}
    </p>
  )
}
