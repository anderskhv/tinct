# Danish (modern-da) translation instructions — To the Lighthouse

You translate one bundle of Virginia Woolf's *To the Lighthouse* from the Tinct modern English edition into Danish, for Tinct's `modern-da` edition. Do not call any external API or translation service; write the Danish yourself.

Input: `src/<BUNDLE>.json` — a list of chapters `{number, title, paragraphs[]}` (the modern English text). Output: `out/<BUNDLE>.json` — the same list, same order, same `number`, same number of paragraphs per chapter (strictly 1:1: never merge, split, drop or add paragraphs), with `title` kept as is (titles are set separately) and every paragraph translated into Danish.

Quality bar: a real literary translation, not a gloss. Woolf's long, flowing, comma-and-semicolon-driven sentences should stay long and flowing in Danish, with the same rhythm, parentheses, dashes and shifts of consciousness from one mind to another; do not chop them into short sentences and do not flatten free indirect speech into plain reported speech. Idiomatic, natural, contemporary Danish (not word-for-word English syntax, no anglicisms); keep every fact, image, hedge (perhaps / seemed / as if), repetition and refrain (e.g. "the Lighthouse", "Such is life", "the bar of iron", "the arrow", "the wave") consistent across the bundle and recognisable in Danish.

Conventions (same as Tinct's other Danish editions):
- Dialogue quotes use Danish guillemets: »…« for the outer level and ›…‹ for inner quotes. Convert the English curly quotes “ ” and ‘ ’ accordingly; keep apostrophes out of the way (Danish has no English possessive 's).
- Names are not translated. Titles: Mrs. → fru, Mr. → hr., Miss → frøken, Dr. → dr. (e.g. fru Ramsay, hr. Ramsay, hr. Tansley, hr. Bankes, frøken Briscoe, fru McNab, hr. Carmichael). "the Lighthouse" → "Fyret" when it is the destination/title ("turen til Fyret"), "fyret" for the building in running text where natural; use one consistent choice.
- Keep numbers, brackets [ ], dashes — and ellipses … as in the source (use the same marks: a spaced em dash " — " where the source has one). Bracketed passages in "Time Passes" (e.g. [Mr. Ramsay stumbling along a passage…]) stay in square brackets.
- Keep poems/verse lines (Tennyson, "Luriana Lurilee", "We perished, each alone", the nursery rhyme) recognisable: translate them; keep line structure if the paragraph has line breaks (\n) exactly as in the source.
- Do not add notes, scaffolding, commentary, translator marks or quotation wrappers.

Process: read `src/<BUNDLE>.json` completely, write `out/<BUNDLE>.json` with the same structure, then run this self-check and fix any problems: paragraph counts equal per chapter; no remaining straight or curly English quotes (“ ” ‘ ’ " ) in the output; no paragraph left in English; no paragraph empty. Finally report: bundle id, paragraph counts, and the passages you are least sure of (with chapter:paragraph coordinates, 0-based paragraph index).

Base directory for all paths: /tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/lighthouse-da/
