# Independent Review Instructions — Fear and Trembling, Chapter 1 (Forord / Preface)

Give this exact text to the independent reviewer, unmodified.

---

You are independently reviewing a proposed modern-English reading edition of
Søren Kierkegaard's *Fear and Trembling* (written under the pseudonym
Johannes de Silentio), Chapter 1 (the Preface, "Forord"), against its
supplied source: the 1843 Danish original, one paragraph as printed
(5 paragraphs total). This candidate was drafted directly from the Danish,
**not** from any published English translation — read `../PROVENANCE.md`
first for why: the file served to Tinct readers as "Original (English)" is
in fact a 2026 AI paraphrase written in a "Lowrie/Hannay-adjacent register"
per its own commit message, not a real historical translation, so it was not
used as a source, and neither was any other English translation (Lowrie
1941, Hannay 1985, Hong & Hong 1983, Payne 1939, or Tinct's own prior
`modern-en`). Read `../GLOSSARY.md` next: it fixes renderings for recurring
concepts met in this chapter (faith, the System) and for the book's core
technical vocabulary that has not yet appeared (the knight of faith, infinite
resignation, the teleological suspension of the ethical, the absurd, the
single individual) fixed in advance so later chapters don't improvise. Read
`ch01/continuity.md` next: it records every paragraph-level decision,
including the choice to keep Kierkegaard's own German and Latin insertions
untranslated, the Cartesius → Descartes renaming, the OCR corrections made to
the quoted Latin, and the two deliberate departures from wording surfaced
elsewhere in the provenance search (Extra-Skriver, Posekigger).

Review each packet carefully. Neighboring context is supplied to help
interpret the assigned paragraphs. For every assigned paragraph, return
either specific findings or "No material issue found."

Check:

- The argument: the satirical picture of an age that claims to have gone
  further than Descartes' doubt or further than faith without doing the work
  either required (¶1–2); the appearance of the title phrase "fear and
  trembling" describing what the tested old believer never wholly outgrows
  (¶2–3); de Silentio's self-introduction as no philosopher, unable to
  "comprehend" faith, and his ironic submission to "the System" (¶4).
- Voice: Johannes de Silentio is an ironic, self-deprecating, essayistic
  first-person persona, not Kierkegaard speaking plainly and not a neutral
  modern explainer. Flag any passage that reads as flattened, or as
  addressed reassuringly to a modern reader rather than performing de
  Silentio's own anxious, mocking self-positioning.
- Kierkegaard's own foreign-language insertions (German "ein wirklicher
  Ausverkauf," the two Latin footnote quotations from Descartes, "poetice et
  eleganter") are kept in their original language, per `continuity.md` and
  `../GLOSSARY.md` — not translated into English, and not dropped.
- Imagery and concrete detail kept, not explained away: the clearance sale;
  the night watchman crying fire vs. the quiet solitary Descartes; the
  ancient Greek/"old seasoned fighter" who kept doubt's balance through every
  snare; the gardener's apprentice hat in hand in the newspaper; the
  after-dinner nap a modern author's book must survive; the paragraph-glutton
  who would cut de Silentio into "§§"; the man who divided speech by counting
  words (fifty to a full stop, thirty-five to a semicolon); the "systematic
  bag-inspector"; the Danish shareholders in an "Omnibus" that will scarcely
  become a tower.
- Missing content and unsupported additions, including glosses not licensed
  by `../GLOSSARY.md` or `continuity.md`.
- The rendering choices recorded in `continuity.md` for Danish terms with no
  single obvious English equivalent: "Extra-Skriver" → "a scribe on the
  side"; "Udflytter og Indsidder" → "drifter and lodger"; "Privatdocent" →
  "adjunct lecturer"; "Repetent" → "tutor"; "Posekigger" → "systematic
  bag-inspector"; "Paragraphsluger" → "paragraph-glutton"; say whether each
  captures the Danish image and register, and whether a better rendering
  exists that does not import wording from a specific published translation.
- The OCR corrections to the quoted Latin, listed in `continuity.md`'s "OCR
  corrections" section — these are apparatus fixes (garbled scanning
  restored to grammatical Latin), not translation choices; flag only if a
  correction looks wrong on its own terms (i.e., does not restore
  grammatical, sensible Latin), since verifying against a critical edition
  of Descartes was outside this drafting session's scope.
- The preserved mid-sentence paragraph break between P1 and P2 ("that is a
  great" / "rarity in our age!") — confirm it is correctly treated as an
  inherited OCR artifact required for paragraph alignment, not an error to
  silently merge away.
- Remaining vocabulary or syntax that obstructs a general modern reader.
- Whether suggested corrections preserve natural prose and Kierkegaard's
  meaning.

For each finding, provide:

- Stable paragraph ID (C01-P001 … C01-P005).
- Short exact source (Danish) and candidate quotations.
- The precise difference and why it matters.
- Severity: Must fix / Worth improving / Optional preference.
- The smallest proposed correction.
- Confidence and any plausible alternative reading.

Do not invent objections to fill a quota. Do not equate different wording
with an error. Do not claim a candidate phrase was imported from a published
translation unless you can point to the specific matching wording in that
translation. Word and paragraph counts do not prove semantic completeness.

Save findings by paragraph ID under `ch01/review/`. Make no changes to
`candidate-v1.json`.

After reviewing every packet, read the full candidate continuously
(`candidate-v1-readable.md`) for voice, pacing, repetition, terminology, and
transitions. Report any additional chapter-level findings.

Finish with: Accept / Accept after corrections / Substantial revision
required. State review coverage and limitations. Do not assign a numerical
score or claim that no errors can remain.
