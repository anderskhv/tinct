import { ContextualLookupView } from '../../../components/reader/DefinitionFallback'
import { parseContextualLookup, parsePartialContextualLookup } from '../../../components/reader/contextualLookup'
import { parsePrimer } from '../../../companion/primerParse'
import { LabInlineMarkdown } from '../../LabMarkdown'
import { LabChapterNotesEntries } from '../../LabChapterNotesSheet'
import { primerBeats } from '../../userBook/ownChapterNotes'

/** Folded source entries show prose, while their full structured answer stays unchanged in storage. */
export function pdfOriginalAnswerPreview(kind: string, raw: string): string {
  if (kind === 'primer') return parsePrimer(raw)?.gist || 'Open saved Primer'
  if (kind === 'define') {
    const answer = parseContextualLookup(raw)
    return answer ? answer.kind === 'person' ? answer.subtitle : answer.kind === 'place' ? answer.description : answer.definition : 'Open saved definition'
  }
  return /^[\s]*(?:\{|\[|```)/.test(raw) ? 'Open saved answer' : raw
}

/** Display the completed companion shape; callers retain the unmodified answer for saving and export. */
export function PdfOriginalAnswer({ kind, raw, busy = false }: { kind: string; raw: string; busy?: boolean }) {
  if (kind === 'define') {
    const answer = busy ? parsePartialContextualLookup(raw) : parseContextualLookup(raw)
    return answer ? <ContextualLookupView answer={answer} ready={!busy} />
      : busy ? null : <UnreadableAnswer label="definition" raw={raw} />
  }
  if (kind === 'primer') {
    const primer = busy ? null : parsePrimer(raw)
    const beats = primer && primerBeats(primer)
    return beats?.length ? <div className="lab-catch-up-body" data-testid="pdf-original-primer"><ol className="lab-catch-up-timeline"><LabChapterNotesEntries beats={beats} /></ol></div>
      : busy ? null : /^[\s]*(?:\{|```)/.test(raw) ? <UnreadableAnswer label="primer" raw={raw} /> : <LabInlineMarkdown>{raw}</LabInlineMarkdown>
  }
  return <LabInlineMarkdown>{raw}</LabInlineMarkdown>
}

function UnreadableAnswer({ label, raw }: { label: string; raw: string }) {
  return <div className="pdf-original-reader__unreadable"><p role="status">This {label} could not be formatted.</p>
    <details><summary>Show original answer</summary><LabInlineMarkdown>{raw}</LabInlineMarkdown></details>
  </div>
}
