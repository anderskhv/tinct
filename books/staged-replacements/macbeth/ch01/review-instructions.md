# Independent Review Instructions — Macbeth, Act 1 Scene 1

Give this exact text to the independent reviewer, unmodified.

---

You are independently reviewing a proposed modern-English reading edition of
Shakespeare's *Macbeth*, Act 1 Scene 1, against its supplied source: the
served `macbeth-original-en.json`, chapter 1 ("Act 1, Scene 1 — A Desert
Place"), 12 paragraphs — the scene's two stage directions and the Witches'
ten-line exchange, one paragraph per source paragraph. Read `../GLOSSARY.md`
first: it fixes renderings for this play (thee/thou modernised to you/your;
"Thane" kept unchanged; personifications like Fortune and Valor kept
capitalized and unchanged; "hurlyburly" → "uproar"; "Anon" → "Coming";
Graymalkin and Paddock, the familiars' names, kept unchanged). Read
`ch01/continuity.md` next: it records the per-paragraph decisions for this
scene and the one known source anomaly (the served scene title, "A Desert
Place," differs from the identified textual source's "An open Place" — see
`../PROVENANCE.md` §3; the candidate keeps the served title, which is not
itself a finding).

Review each packet carefully. Neighboring context is supplied to help
interpret the assigned paragraphs. For every assigned paragraph, return
either specific findings or "No material issue found."

Check:

- Every image and beat is kept: the meeting time and weather (thunder,
  lightning, rain), the "hurlyburly"/battle's outcome, the appointed place
  (the heath), the familiars calling the Witches away (Graymalkin, Paddock),
  and the closing paradox ("Fair is foul, and foul is fair") with its image
  of hovering through fog and filthy air.
- Stage directions (`[Thunder and Lightning. Enter three Witches.]`,
  `[Exeunt.]`) are copied character-for-character from the source, not
  rewritten.
- Speaker labels (`FIRST WITCH.`, `SECOND WITCH.`, `THIRD WITCH.`, `ALL.`)
  are copied character-for-character, in the same order as the source.
- The riddling brevity of the Witches' exchange is kept — no line is
  expanded into explanation, and none of the short exchanges (some as
  short as two or three words) is padded out.
- The closing couplet ("Fair is foul, and foul is fair... ") is not
  flattened into blander or more explanatory phrasing — it is already plain
  modern English in the source and should read essentially as printed.
- Nothing is added: no motive, no stage business, no gloss beyond what
  `../GLOSSARY.md` or `ch01/continuity.md` records.
- Remaining vocabulary or syntax that would obstruct a general modern
  reader (check in particular "hurlyburly," "ere," "Anon," and the
  elliptical "Where the place?").

For each finding, provide:

- Stable paragraph ID (B01-P001 … B01-P012).
- Short exact source and candidate quotations.
- The precise difference and why it matters.
- Severity: Must fix / Worth improving / Optional preference.
- The smallest proposed correction.
- Confidence and any plausible alternative reading.

Do not invent objections to fill a quota. Do not equate different wording
with an error. Do not claim a candidate phrase came from another
modernisation (e.g. No Fear Shakespeare) unless you can show the exact
match; this task's drafter was instructed not to consult one, but flag any
suspicious verbatim overlap with a well-known modern paraphrase if you
happen to recognize one. Word counts are a screening signal only, not
evidence of completeness.

Save findings by paragraph ID under `ch01/review/`. Make no changes to
`candidate-v1.json`.

After reviewing every packet, read the complete scene continuously (all 12
paragraphs of `candidate-v1.json` in order) for voice, pacing, and
transitions between the three Witches. Report any additional
scene-level findings.

Finish with: Accept / Accept after corrections / Substantial revision
required. State review coverage and limitations. Do not assign a numerical
score or claim that no errors can remain.
