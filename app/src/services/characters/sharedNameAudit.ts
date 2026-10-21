import type { CharacterEdition } from './characterCards'

/**
 * Evidence audit for names that two or more cards in one book share.
 *
 * Every mention in a character package names its card explicitly, so the
 * reader never guesses between namesakes. What a package can still get wrong
 * is the reviewed choice itself: "Jonathan the son of Absalom" linked to
 * Simon's brother. This audit reads the text around every mention of a shared
 * name and sorts it:
 *
 * - qualified: a patronymic or kin phrase ("the son of Kish", "Saul's son") or
 *   an epithet ("the tetrarch") right next to the name agrees with the linked
 *   card (its card text, or a qualifier accepted for that card);
 * - contradiction: a kin phrase names someone the linked card does not know;
 * - unresolved: nothing in the text next to the name tells the namesakes
 *   apart, so the link rests on the review alone.
 */
export interface SharedNameAccepted {
  /** Names a card's kin phrases may carry beyond its own card text, e.g. saul-king: Kish. */
  qualifiers?: Record<string, string[]>
  /** `edition|chapter.paragraph.offset` → why a kin phrase there does not describe the mention. */
  exceptions?: Record<string, string>
}
export interface SharedNameContradiction { key: string; characterId: string; text: string; relation: string; named: string; context: string }
export interface SharedNameReport { shared: number; qualified: number; contradictions: SharedNameContradiction[]; unresolved: Record<string, number> }

const KIN = 'son|sons|daughter|wife|husband|brother|sister|father|mother|nephew|niece|uncle|grandson|granddaughter|widow'
const NAME = "[A-Z][\\p{L}’'-]*"
const AFTER_KIN = new RegExp(`^,? (?:the )?(${KIN}) of (${NAME}(?: ${NAME})?)`, 'u')
const BEFORE_KIN = new RegExp(`(${NAME})(?:’s|'s) (${KIN}) $`, 'u')
const AFTER_EPITHET = /^,? the (\p{Ll}+)/u

export const sharedNameForm = (text: string) => text.replace(/(’s|'s|’|')$/, '')
const words = (text: string) => new Set(text.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean))

export function auditSharedNames(editionKey: string, edition: CharacterEdition, paragraphs: Record<string, string[]>, accepted: SharedNameAccepted = {}): SharedNameReport {
  const owners = new Map<string, Set<string>>()
  for (const m of edition.mentions) {
    const form = sharedNameForm(m.text)
    if (!owners.has(form)) owners.set(form, new Set())
    owners.get(form)!.add(m.characterId)
  }
  const known = new Map(edition.characters.map(c => [c.id, words([c.id.replace(/-/g, ' '), ...c.snapshots.flatMap(s => [s.name, s.subtitle, s.body]), ...(accepted.qualifiers?.[c.id] ?? [])].join(' '))]))
  const report: SharedNameReport = { shared: 0, qualified: 0, contradictions: [], unresolved: {} }
  for (const m of edition.mentions) {
    const form = sharedNameForm(m.text)
    if ((owners.get(form)?.size ?? 0) < 2) continue
    report.shared++
    const paragraph = paragraphs[m.chapterNumber]?.[m.paragraphIndex] ?? ''
    const after = paragraph.slice(m.endOffset, m.endOffset + 60)
    const before = paragraph.slice(Math.max(0, m.startOffset - 40), m.startOffset)
    const card = known.get(m.characterId) ?? new Set<string>()
    const kinAfter = AFTER_KIN.exec(after)
    const kinBefore = kinAfter ? null : BEFORE_KIN.exec(before)
    const key = `${editionKey}|${m.chapterNumber}.${m.paragraphIndex}.${m.startOffset}`
    if (kinAfter || kinBefore) {
      const [relation, named] = kinAfter ? [kinAfter[1], kinAfter[2]] : [kinBefore![2], kinBefore![1]]
      if (accepted.exceptions?.[key] || [...words(named)].some(word => card.has(word))) report.qualified++
      else report.contradictions.push({ key, characterId: m.characterId, text: m.text, relation, named, context: `${before}[${m.text}]${after}` })
      continue
    }
    const epithet = AFTER_EPITHET.exec(after)
    if (epithet && card.has(epithet[1])) { report.qualified++; continue }
    const bucket = `${form} → ${m.characterId}`
    report.unresolved[bucket] = (report.unresolved[bucket] ?? 0) + 1
  }
  return report
}
