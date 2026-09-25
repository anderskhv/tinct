import { TEMPORARY_HOLD_NOTICE } from '../data/editionAvailability'

/** Only reads annotations already loaded by the reader's account-aware hook.
 * No storage migration, deletion, preference substitution or network write.
 */
export function EditionHoldPanel({ title, edition, reason, highlights, onRecover }: {
  title: string
  edition: string
  reason: string
  highlights: readonly { id: string; text?: string; note?: string; chapterNumber: number; editionKey?: string }[]
  onRecover: () => void
}) {
  return <main data-testid="edition-hold" style={{ maxWidth: 680, margin: '8vh auto', padding: 24, lineHeight: 1.6 }}>
    <h1>{title}</h1>
    <h2>{edition} is temporarily unavailable</h2>
    <p>{reason}</p>
    <p>{TEMPORARY_HOLD_NOTICE}</p>
    <p>You can open the preserved edition to recover a passage or use Contents to review your notes. This recovery view contains the known defects and does not advance your saved reading place or history.</p>
    <button type="button" onClick={onRecover}>Open preserved edition and annotations</button>
    <p><a href="/library">Return to the library</a></p>
    <details><summary>Saved highlights and notes ({highlights.length})</summary>
      {highlights.map(mark => <section key={mark.id}>
        <p>Chapter {mark.chapterNumber} · {mark.editionKey}</p>
        {mark.text && <blockquote>{mark.text}</blockquote>}
        {mark.note && <p>{mark.note}</p>}
      </section>)}
    </details>
  </main>
}
