# Continuity sheet — Fear and Trembling, Chapter 1 (Forord / Preface)

Written alongside drafting `candidate-v1.json`. Term renderings follow
`../GLOSSARY.md`. This is the first chapter drafted; the general voice and
form rules it establishes (keeping Kierkegaard's own foreign-language
insertions untranslated, capitalizing "the System," rendering "Cartesius" as
"Descartes") are recorded in `../GLOSSARY.md` for later chapters to follow.

## Source

- `../PROVENANCE.md` for the full rights investigation. Short version: the
  served `original-en` is a 2026 AI paraphrase in a "Lowrie/Hannay-adjacent
  register" (its own commit message), not a real historical translation, so
  it is not used. `source-ch01.json` is extracted verbatim (byte-identical)
  from `fear-and-trembling-original-da.json`, chapter 0 ("Forord"), 5
  paragraphs.
- The Preface was read in full before drafting: five paragraphs, ~1,044
  Danish words. Its argument: (¶1–2) a satirical picture of an age where
  everyone claims to have "gone further" than doubt (Descartes' doubt) or
  further than faith, without having done the work Descartes and the old
  believers actually did; (¶2, continued) the book's title phrase, "fear and
  trembling," appears here for the first time, describing what the old man
  who kept faith to the end never quite outgrows; (¶3) de Silentio
  introduces himself: not a philosopher, unable to "comprehend" faith by
  putting it in conceptual form, positioning his book as outside and beneath
  "the System"; (¶4, signature) "Most respectfully, Johannes de silentio."

## Paragraph-by-paragraph decisions

- **P1** — "ein wirklicher Ausverkauf" kept in German (Kierkegaard's own
  insertion; see the Danish, which also has it in German, not Danish), with
  a folded gloss: "ein wirklicher Ausverkauf—a real clearance sale," so the
  German is preserved but a reader who doesn't know German isn't stopped.
  "Marqueur" (a French loanword for a scorekeeper at billiards, naturalized
  into ordinary 1840s Danish, not a special foreign insertion the way the
  German/Latin passages are) → "scorekeeper," a plain translation, not kept
  foreign. "Privatdocent" (an unsalaried academic lecturer rank, German-
  derived but used as an ordinary Danish university term) → "adjunct
  lecturer" (a functional modern equivalent; "Privatdocent" itself would need
  a gloss most modern readers don't have). "Repetent" (a university tutor who
  drills students, distinct from a lecturer) → "tutor." "Udflytter og
  Indsidder" (a real 19th-century Danish social-class pairing: a smallholder
  who has moved off common land vs. a lodger with no household of his own) →
  "drifter and lodger," keeping the sense of people with no real stake or
  standing, without importing 19th-century Danish land law into the English.
  "Cartesius" → "Descartes" throughout (see `../GLOSSARY.md`). The paragraph
  break mid-sentence at "det er en stor" / "That is a great" is kept exactly
  where the Danish (and the served English) has it — an OCR page-break
  artifact carried through from `books/raw/fear-and-trembling/SOURCE.md`,
  preserved because both served files split at the same place and paragraph
  alignment is a hard constraint (`../PROVENANCE.md` §3).
- **P2** — Continues the sentence broken at the end of P1 ("rarity in our
  age!"). The two Latin footnote quotations (Descartes, from the *Principia
  Philosophiae* and the *Dissertatio de methodo*) are kept as Kierkegaard's
  own quotation, not translated — quoted Latin is not prose to modernize.
  Mechanical OCR corrections to the Latin only (documented under "OCR
  corrections" below), no wording changes. "raabt Brand" (literally "shouted
  fire," the 1840s Danish idiom for a night watchman's fire-alarm cry) → "did
  not shout fire," kept as the literal image since it is also comprehensible
  in English; "Gadevægter" (a historical night watchman who patrolled
  Copenhagen streets calling the hours and raising alarms) → "night
  watchman." "Cf." for Kierkegaard's Latin abbreviation "Cfr." (confer,
  compare) — modernized to the equally standard English scholarly
  abbreviation. The final long sentence (the ancient Greeks / the old
  seasoned fighter) is one continuous periodic sentence in Danish; kept as
  one sentence in English rather than broken up, since the accumulating
  clauses are the rhetorical point (a comparable long periodic sentence
  survives, e.g., in Meditations continuity practice, where Long's
  accumulating clauses are likewise kept intact).
- **P3** — "Frygt og Bæven" (fear and trembling) appears for the first time
  in the book, describing what "no man wholly outgrows" — kept exactly as
  the familiar King James Bible phrase (Philippians 2:12), per
  `../GLOSSARY.md`, since this is Kierkegaard quoting/echoing a phrase his
  readers would recognize from their own Bible, not coining new language.
  Nothing else notable; short declarative sentences kept short, per the
  accessibility standard's ban on mechanical expansion.
- **P4** — "Extra-Skriver" (literally "extra scribe/writer" — someone who
  writes on the side, not as an established author) → "a scribe on the
  side." Not rendered "supplementary scribe" or "extra clerk," to avoid any
  overlap with phrasing associated with other translations of this passage
  found in a provenance search (`../PROVENANCE.md` §1) — this task drafts
  from the Danish only and does not import wording from any other
  translation, including by coincidence where a distinct rendering is
  available. "poetice et eleganter" (Latin, Kierkegaard's own insertion) kept
  untranslated, as elsewhere. "Systemet" → "the System," capitalized
  throughout (Kierkegaard's own running joke against Hegelian
  system-building; see `../GLOSSARY.md`). "Adresseavisen" (a real Copenhagen
  classified-advertisement newspaper of the period) kept as a proper noun,
  unglossed — a passing period reference, not essential to follow the
  argument (accessibility standard). "Paragraphsluger" (literally
  "paragraph-swallower/-glutton" — "sluger" is the ordinary Danish word for
  glutton) → "paragraph-glutton," a natural, nearly transparent cognate
  rendering; not imported from another translation (none found in the
  provenance search using this exact phrase). "Trop" and "Menneskeslægtens
  Ødelæggelse" ("The Destruction of the Human Race," an actual period stage
  work Trop is said to have cut down) are kept as period references,
  unglossed, per the same accessibility-standard allowance as Adresseavisen.
  "$8" in the OCR (Danish "§§," section marks, garbled by OCR into dollar
  signs) → "§§," corrected as an OCR artifact (documented below), not a
  translation choice. "systematisk Posekigger" (literally "bag-peeker" — a
  customs officer who peers into travelers' luggage; Kierkegaard's image is
  of the System's enforcers inspecting his book like customs at a border) →
  "systematic bag-inspector," keeping the customs-officer image without
  reusing the "bag-peerer" phrasing found for another translation in the
  provenance search. "Omnibus" (kept as "omnibus," the period English word
  for a large public multi-part undertaking — also literally the horse-drawn
  public coach, which is why the next clause's joke about "a tower" works:
  de Silentio jokes about the "Danish shareholders" in this "Omnibus"
  scarcely amounting to a [Tower of Babel]) is kept untranslated as it is
  already an English word borrowed the same way in Danish; no gloss added
  (the Tower-of-Babel joke is left for the reader to catch, per the
  accessibility standard's ban on supplying interpretation not in the text).
- **P5** — "Ærbødigst" → "Most respectfully," the ordinary period
  correspondence closing; "Johannes de silentio" kept exactly as signed
  (lowercase "de silentio," matching both the Danish and the served
  English).

## OCR corrections to the quoted Latin (mechanical, not translation)

The Danish source's OCR scan introduces obvious scanning errors inside the
two Latin footnote quotations in P2. These are corrected as apparatus, since
they are Descartes' Latin being quoted, not Kierkegaard's Danish being
translated:

- "$ 28 og $ 76" → "§28 and §76" (OCR read the section-mark "§" as a dollar
  sign; "og" translated as the ordinary Danish "and" inside an otherwise
  Latin/abbreviation citation, matching how Kierkegaard's own citations mix
  Latin section numbers with a Danish "og").
- "divinæ -potius" → "divinæ potius" (a stray OCR hyphen/line-break
  artifact, no missing or altered word).
- "exæponere" → "exponere" (OCR-inserted stray "æ"; "exponere" is the
  correct Latin verb, "to set forth," consistent with the rest of the
  sentence).
- "sequti" → "sequi" (OCR misread; "sequi," "to follow," is the grammatical
  form the sentence requires).
- "juventulis" → "juventutis" (OCR misread of "iuventutis"/"juventutis,"
  "of youth" — the word the abbreviation "sc." (scilicet, "namely") is
  glossing).
- "discendt" → "discendi" (OCR misread; "discendi," "of learning," is
  required by the Latin grammar).
- "magtisque" → "magisque" (OCR misread of "magis...que," "more and more,"
  matching the paired "magis magisque" earlier in the same clause).
- "Cfr." → "Cf." (Kierkegaard's own Latin abbreviation for "confer,"
  modernized to the equally standard English scholarly abbreviation; not an
  OCR error, a period-convention update, listed here rather than in the
  main decisions above because it sits inside the same apparatus.)

None of these corrections change the Latin's meaning; they restore the
grammatically and lexically required Latin word where OCR scanning
introduced an impossible or nonsensical spelling. Flagged for the
independent reviewer to spot-check against a clean edition of the Latin if
one is available; not independently verified against a critical edition of
Descartes' *Principia Philosophiae* or *Dissertatio de Methodo* in this
session (no API/lookup budget was spent, and this is quotation apparatus,
not the translated prose the review is centered on).

## Nothing imported from other translations

No wording was taken from any English translation of Fear and Trembling —
not the served `original-en`, not the served `modern-en`, not Lowrie 1941,
Hannay 1985, Hong & Hong 1983, or Payne 1939. Several choices above
(`scribe on the side` rather than the phrasing associated with other
translations for "Extra-Skriver"; `bag-inspector` rather than the phrasing
associated with another translation for "Posekigger") were deliberately
chosen to differ from wording surfaced in the `../PROVENANCE.md` rights
investigation, precisely to avoid any appearance of importing another
translator's specific word choices even where only a general search summary,
not the full copyrighted text, was seen.

## Unresolved source issues (Danish text)

- The mid-sentence paragraph break in P1/P2 ("det er en stor" / "rarity in
  our age!") is an inherited OCR page-break artifact, not a real paragraph
  break in Kierkegaard's text; kept because it is present identically in
  both served files and paragraph alignment is a hard constraint. A
  reviewer should not expect the candidate to "fix" this into a single
  paragraph — the app depends on the 5-paragraph count matching Danish and
  English.
- No other truncated or garbled paragraphs in Chapter 1 beyond the Latin OCR
  issues listed above.
