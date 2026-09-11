# Hamlet — modern-English workflow

Adapted from the Meditations package template
(`books/staged-replacements/meditations/WORKFLOW.md`,
branch `claude/meditations-modern-en-20260911-v2`) for a play. Saved here so
future tasks find the process without conversation history.

## Scope

- **Content only.** This package owns Hamlet only. Nothing here is merged,
  deployed, or registered. No changes to app code (`app/src/**`), library UI,
  registry entries, character cards, audio, or the served editions under
  `app/public/data/editions/`. Staged replacements live here, and only here,
  under `books/staged-replacements/hamlet/`.
- **Other books are other agents' work.** Meditations, the Odyssey, Macbeth
  and Fear and Trembling have their own agents/packages.
- **English only.** No Danish edition work here.
- **Zero Anthropic API spend.** All drafting happens in the agent conversation
  and is written to files. No script calls any LLM API.
- **Paragraph alignment is a hard constraint.** The served editions are
  paragraph-aligned; audio, character cards and saved reading positions key on
  paragraph index. A staged modern edition keeps the paragraph count and order
  of the `original-en` it is aligned to, exactly: one candidate paragraph per
  source paragraph.
- **No copyrighted modernisations consulted.** No Fear Shakespeare or any
  other copyrighted modern-English version of Hamlet is read, quoted, or
  used as a source for wording, at any step.

## Unit of work for a play

- **Chapter = scene.** The served `hamlet-original-en.json` has 20 chapters
  (one per scene), grouped into 5 acts via its `sections` array, 1,391
  paragraphs total.
- **"Paragraph" = whatever the served JSON keeps as one array entry**: a
  single speech (one character's continuous lines until the next speaker or
  stage direction), a stage direction (`[Enter …]`, `[Exit.]`, `[Aside.]`,
  etc.), or a heading. The served file already joins a speech's verse lines
  into one string with internal line breaks flattened to spaces (capitals at
  each former line-start are kept, since Shakespeare's verse capitalizes the
  start of every line). The candidate matches this exactly: one candidate
  string per source paragraph, same order, same count.

## The eight steps (per chapter/scene)

1. **Verify the source.** Identify the exact edition behind the served
   `original-en` (compare sample lines against Project Gutenberg and other
   known editions), confirm public domain, record in `PROVENANCE.md` with
   hashes. Record the served `modern-en` hash and that it is being replaced.
   Inspect the paragraph format (speaker labels, stage directions, verse-line
   handling) and describe it in `PROVENANCE.md` so the candidate matches it
   exactly.
2. **Draft with full chapter (scene) context.** Read the whole scene before
   drafting any paragraph. Fix stable renderings for recurring terms and
   forms of address first (`GLOSSARY.md`).
3. **Freeze the draft.** Write `chNN/candidate-v1.json` and the readable copy,
   record hashes in `chNN/provenance.json`, and do not edit
   `candidate-v1.json` afterwards. Corrections go to `candidate-v2.json`.
4. **Independent review, three paragraphs at a time, with neighbouring
   context.** Prepare `chNN/review-packets/packet-NN.md` (source beside
   candidate, one paragraph of context before and after marked
   `CONTEXT ONLY`), plus `chNN/manifest.json` and
   `chNN/review-instructions.md`. Push and stop. A separate reviewer session
   does the review; this task does not review its own draft. Findings come
   back under `chNN/review/`.
5. **Record a finding or "No material issue found" for every paragraph.** The
   reviewer's output covers every assigned paragraph ID exactly once.
6. **Apply supported corrections and verify changed passages.** Write
   `candidate-v2.json` (and v3 if a second round is needed), list every
   change by paragraph ID with the finding it answers, re-check each changed
   passage against the source, and note any finding not applied and why.
7. **Read the complete scene for flow.** A continuous read of the corrected
   candidate for voice, pacing, verse rhythm where it matters, terminology
   and stage-direction placement. Record chapter-level findings and fixes.
8. **Accept only when no substantive issue remains.** Record acceptance in
   `chNN/ACCEPTANCE.md` with the accepted file's hash, the review rounds
   applied, and what remains open. Then move to the next scene.

Order of scenes: Act 1 Scene 1 (`ch01`) first, as the pilot for this task.
This drafting task covers ch01 only (draft + freeze); later scenes follow the
same eight steps once ch01 has been through independent review.

## Process template

The Meditations Book 5 package on `claude/meditations-modern-en-20260911-v2`
(`books/staged-replacements/meditations/book5/`) is the template for the
drafting, freezing and review-packet steps, adapted here for verse/prose
speeches instead of numbered meditations, and for stage directions instead of
apparatus.

## Accessibility standard (the reading standard)

Clear, natural contemporary English for a thoughtful modern adult, preserving
the work's complete meaning and literary character. Every image, argument
step, qualification and meaningful repetition survives; archaic vocabulary
and inverted syntax are simplified without simplifying away the ideas;
ambiguity and voice are kept; nothing is added (no interpretations, motives,
modern glosses beyond what the glossary licenses, or explanatory
transitions). No expansion: candidate word count stays close to source word
count (target ratio ≥0.90 per scene; recorded per scene and per paragraph in
`provenance.json`).

## Voice rules for Hamlet (adapted from the Meditations brief)

- Keep each character's voice distinct: Francisco and Barnardo plain and
  clipped; Horatio measured and learned; Marcellus urgent. Do not flatten
  differences in register into one uniform modern voice.
- Keep every image (the star, the sledded Polacks, the cock as trumpet to the
  morn, the bird of dawning, the morning in its russet mantle) — never
  replace an image with an explanation of what it means.
- Do not flatten a famous or metrically shaped line into a cliché
  paraphrase; where the line is already plain modern English ("Not a mouse
  stirring", "Who's there?"), leave it as is.
- Keep the line/beat structure where the source paragraph keeps it (a
  multi-line speech stays one flowing passage of the same number of
  sentences/clauses, not compressed into fewer beats or expanded into more).
- Proper names, place names, and titles (Barnardo, Francisco, Horatio,
  Marcellus, Hamlet, Fortinbras, Denmark, Norway, "the Dane", Rome, Julius,
  Neptune) are unchanged.
- Stage directions are copied verbatim from the source — they are already
  plain English and are not paraphrased.
- Establish stable renderings for recurring archaic forms (thou/thee/thy →
  you/your, 'tis → it's, hath → has, doth → does, e'en → even) and recurring
  terms of address or period vocabulary (`GLOSSARY.md`). Add rows before
  first use in a scene.

## Files in this package

- `WORKFLOW.md` — this file.
- `PROVENANCE.md` — what the served `original-en` and `modern-en` actually
  are, rights, and the paragraph-format description.
- `00-progress-ledger.md` — done / decided and why / next / needs Anders.
  Kept current at every push.
- `GLOSSARY.md` — stable renderings fixed before drafting, extended scene by
  scene.
- `chNN/` — one directory per scene with the eight-step artefacts.
