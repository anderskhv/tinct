/**
 * The desktop Margin reader's card at the reader's chapter start (LabApp.tsx). A reader who has never used Ask,
 * Explain or Simplify sees the first-visit hint (the simple first page, 16 Nov 2026); everyone else the start actions
 * ("Before you start", Primer, Summary, Quiz me). Free reading mode (freeMode.ts) keeps only the hint, without its
 * Primer: chapter notes stay off there.
 */
export function marginStartCard({ freeMode, firstVisit }: { freeMode: boolean; firstVisit: boolean }): 'hint' | 'start' | null {
  if (firstVisit) return 'hint'
  return freeMode ? null : 'start'
}

/** The hint's card. `onPrimer` adds the chapter's Primer beneath the line; free reading mode passes none. */
export function MarginFirstHint({ chapterTitle, onPrimer }: { chapterTitle: string; onPrimer?: () => void }) {
  return <div className="lab-first-hint" data-testid="margin-first-hint">
    <p className="lab-first-hint-text">Highlight any passage to have it explained, simplified, or to ask about it.</p>
    {onPrimer && <div className="lab-start-acts"><button type="button" data-testid="margin-hint-primer" onClick={() => onPrimer()}>
      <span className="lab-chapter-primer-mark" aria-hidden="true">✧</span>{`Primer for ${chapterTitle}`}</button></div>}
  </div>
}
