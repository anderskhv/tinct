# Macbeth — modern-English workflow

Saved here so future tasks find the process without conversation history.
Adapted from the Meditations package's eight-step process
(`books/staged-replacements/meditations/WORKFLOW.md` on branch
`claude/meditations-modern-en-20260911-v2`), for a play instead of a
philosophical text: chapter = scene, and a "paragraph" is whatever the
served JSON encodes as one array entry — a speech, a stage direction, or (in
other books) a scene heading — never a single verse line.

## Scope

- **Content only.** This package owns Macbeth only. Nothing here is merged,
  deployed, or registered. No changes to app code (`app/src/**`), library UI,
  registry entries, audio, or any file under `app/public/data/editions/`.
  Staged replacements live here, and only here, under
  `books/staged-replacements/macbeth/`.
- **Other books are other agents' work.** Meditations, the Odyssey, Hamlet
  and Fear and Trembling have their own agents/threads.
- **English only** for this task (modern-en). Danish is out of scope.
- **Zero Anthropic API spend.** Every candidate paragraph is drafted in the
  agent conversation and written to files. `generate-editions.cjs` is never
  run; no script in this package calls any LLM API.
- **Paragraph alignment is a hard constraint.** The served editions are
  paragraph-aligned; audio, the character/Cast cards, and saved reading
  positions key on paragraph index. A staged modern edition keeps the exact
  paragraph count and order of the served `original-en` chapter it replaces:
  one candidate paragraph per source paragraph, in the same order, with the
  same speaker labels and stage directions.
- **No consultation of other modernisations.** No Fear Shakespeare, Enotes,
  Sparknotes, or any other copyrighted modern-English Shakespeare rendering
  is read or referenced while drafting. Every line is composed independently
  in this session from the original verse and ordinary Shakespeare
  scholarship (meanings of period words, historical references), never
  copied or paraphrased from another modernisation.

## Play-specific adaptations to the Meditations template

- **Chapter = scene.** The served `macbeth-original-en.json` has 28 chapters
  (one per Shakespeare scene, Act 1 Scene 1 through Act 5 Scene 8) and a
  `sections` array grouping chapters into the five acts. This package's
  `chNN/` directories follow the served chapter numbering (`ch01` = Act 1
  Scene 1, `ch02` = Act 1 Scene 2, and so on), not per-act numbering.
- **Paragraph = the served JSON's own unit, not a verse line.** Inspection of
  the served file (see `PROVENANCE.md` §2) shows every paragraph is either:
  (a) a bracketed stage direction, e.g. `[Thunder and Lightning. Enter three
  Witches.]`, copied character-for-character between original and any
  modern edition — stage directions are already plain modern English and are
  never rewritten; or (b) one character's speech, given as `SPEAKER NAME
  IN CAPS. ` followed by the speech text with internal verse line breaks
  already collapsed to single spaces (the served JSON contains no `\n`
  characters at all — confirmed for the whole file). A candidate paragraph
  therefore keeps the exact speaker-label prefix, in the same capitalisation
  and punctuation (`SPEAKER. `), and renders the speech as flowing modern
  prose sentences — there is no verse lineation in the JSON to preserve.
- **Stage directions and speaker labels are copied verbatim, not
  modernised.** They are not translated at all; only the spoken lines
  between them change.
- **Famous lines are not flattened.** Several lines in Shakespeare are
  already plain, contemporary-sounding English (e.g. "Fair is foul, and foul
  is fair") — these are kept essentially as printed, not paraphrased into a
  duller equivalent. Modernisation here means replacing archaic vocabulary,
  syntax and word order (thee/thou/thy, "ere", "gainst", inverted questions,
  suspended verse clauses) with natural current English, not replacing
  Shakespeare's own already-clear phrasing.
- **Proper names, titles and personifications are unchanged**: character
  names (Macbeth, Duncan, Macdonwald, Sweno...), place names (Forres, Fife,
  Saint Colme's Inch), titles (Thane of Cawdor, Thane of Ross — "Thane" is
  never translated to "Lord"), and classical/mythological personifications
  used as figures of speech (Fortune, Valour, Bellona, Golgotha) are kept as
  printed; only the surrounding grammar and archaic diction around them is
  modernised.
- **Word ratio is a screening signal only**, exactly as in the Meditations
  package: computed per chapter and per paragraph, recorded in
  `provenance.json`, not proof of semantic completeness. Very short lines
  (one to three words) naturally swing the ratio further than longer
  speeches; this is expected and is not itself a finding.

## The eight steps (per chapter/scene)

1. **Verify the source.** Identify the served `original-en`'s actual textual
   lineage (which historical edition of the play, by comparison against
   Project Gutenberg texts), confirm public domain, record hashes and any
   textual anomalies in `PROVENANCE.md`. Inspect the paragraph format first
   (speaker labels, stage directions, absence of verse line breaks) so the
   candidate matches it exactly (done once, for the whole play, in
   `PROVENANCE.md` §2 — not repeated per scene unless a scene shows a new
   pattern, e.g. the Porter's prose scene later in Act 2).
2. **Draft with full chapter (scene) context.** Read the whole scene before
   drafting any paragraph, so pronouns, running images and character voice
   stay consistent across speeches. Fix stable renderings for recurring
   terms and forms of address first (`GLOSSARY.md`).
3. **Freeze the draft.** Write `chNN/candidate-v1.json`, record its sha256 in
   `chNN/provenance.json` and `chNN/manifest.json`, and do not edit
   `candidate-v1.json` afterwards. Corrections go to `candidate-v2.json`.
4. **Independent review, three paragraphs at a time, with neighbouring
   context.** Prepare `chNN/review-packets/packet-NN.md` (source beside
   candidate, one paragraph of context before and after marked
   `CONTEXT ONLY`), plus `chNN/manifest.json` and
   `chNN/review-instructions.md`. Push and stop. A separate reviewer session
   does the review; this task does not review its own draft. Findings come
   back on this branch under `chNN/review/`.
5. **Record a finding or "No material issue found" for every paragraph.**
   The reviewer's output covers every assigned paragraph ID exactly once.
6. **Apply supported corrections and verify changed passages.** Write
   `candidate-v2.json`, list every change by paragraph ID with the finding
   it answers, re-check each changed passage against the source, and note
   any finding not applied and why.
7. **Read the complete scene for flow.** A continuous read of the corrected
   candidate for voice, pacing, terminology and stage rhythm. Record
   scene-level findings and fixes.
8. **Accept only when no substantive issue remains.** Record acceptance in
   `chNN/ACCEPTANCE.md` with the accepted file's hash, the review rounds
   applied, and what remains open. Then move to the next scene.

Order of scenes: Act 1 Scene 1 (`ch01`) and Act 1 Scene 2 (`ch02`) first,
both short, drafted and frozen together in this task. Later work continues
scene by scene in chapter-number order through `ch28`, each scene going
through all eight steps with its own independent review round.

## Process template

The Meditations package is the template for the drafting, freezing and
review-packet steps for this whole family of staged-replacement tasks:

- branch `claude/meditations-modern-en-20260911-v2`
- directory `books/staged-replacements/meditations/` (see especially
  `book5/` for a complete, accepted example: `README.md`, `provenance.json`,
  `manifest.json`, `continuity.md`, `review-instructions.md`,
  `review-packets/`, `candidate-v1.json`, `candidate-v1-readable.md`,
  `ACCEPTANCE.md`).

## Accessibility standard (the reading standard)

Same standard as Meditations: clear, natural English for a thoughtful modern
adult, preserving the work's complete meaning and literary character. Every
claim, image, example, qualification and meaningful repetition survives; old
vocabulary and tangled syntax are simplified without simplifying away the
ideas; ambiguity, contradiction and voice are kept; essential unfamiliar
terms are explained briefly at the point of need; nothing is added
(interpretations, motives, historical facts, explanatory transitions not in
the source); logical distinctions are preserved; no mechanically short
sentences or generic explanatory prose.

For Macbeth specifically: preserve each character's register (the Witches'
riddling brevity, the Captain/Soldier's martial report, Duncan's courtly
address, Ross's formal news-bringing), the play's images (blood, sleep,
clothing, darkness, planting/growth — introduced later in the play; Act 1
Scenes 1–2 carry the battle-report and witch-riddle images), and the
difference between verse speeches (kept as flowing prose sentences, since
the JSON holds no line breaks) and prose speeches (none in Act 1 Scenes 1–2;
the Porter's scene, much later, is prose and will need its own note when
reached).

## Files in this package

- `WORKFLOW.md` — this file.
- `PROVENANCE.md` — what the served `original-en` and `modern-en` actually
  are, source identification, rights, and paragraph-format description.
- `00-progress-ledger.md` — done / decided and why / next / needs Anders.
  Kept current at every push.
- `GLOSSARY.md` — stable renderings and forms of address fixed before
  drafting, extended scene by scene as new recurring terms appear.
- `chNN/` — one directory per scene with the eight-step artefacts.
