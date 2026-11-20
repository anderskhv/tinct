import { ContextualLookupView } from '../../../components/reader/DefinitionFallback'
import { parseContextualLookup, parsePartialContextualLookup, splitDefinition } from '../../../components/reader/contextualLookup'
import { parsePrimer } from '../../../companion/primerParse'
import { LabInlineMarkdown } from '../../LabMarkdown'
import { LabChapterNotesEntries } from '../../LabChapterNotesSheet'
import { primerBeats } from '../../userBook/ownChapterNotes'
import { PhoneAnswer } from '../../marginPhone/LabPhoneCard'
import { answerLead } from '../cardPreview'

/** Folded source entries show prose, while their full structured answer stays unchanged in storage. */
export function pdfOriginalAnswerPreview(kind: string, raw: string): string {
  if (kind === 'primer') {
    // A whole document's primer (v5) has no first part: its first part of How it's built instead.
    const primer = parsePrimer(raw), item = primer?.sections[0]?.items[0]
    return primer?.gist || (item && ('term' in item ? item.term : item.text.replace(/\s*\{[^}]*\}\s*/g, ' ').trim())) || 'Open saved Primer'
  }
  if (kind === 'define') {
    const answer = parseContextualLookup(raw)
    return answer ? answer.kind === 'person' ? answer.subtitle : answer.kind === 'place' ? answer.description : splitDefinition(answer.definition).sense : 'Open saved definition'
  }
  // A plain answer folds to its bottom line, whole (cardPreview.ts).
  return /^[\s]*(?:\{|\[|```)/.test(raw) ? 'Open saved answer' : answerLead(raw)
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
  // An answer reads as the text reader's cards do: its first sentence bold, then paragraphs, lists and headings.
  // Simplify is the passage rewritten: no sentence of it is bold.
  return <PhoneAnswer text={raw} plain={kind === 'simplify'} />
}

function UnreadableAnswer({ label, raw }: { label: string; raw: string }) {
  return <div className="pdf-original-reader__unreadable"><p role="status">This {label} could not be formatted.</p>
    <details><summary>Show original answer</summary><LabInlineMarkdown>{raw}</LabInlineMarkdown></details>
  </div>
}
