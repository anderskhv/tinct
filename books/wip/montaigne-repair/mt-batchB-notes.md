# Montaigne Batch B — Content Fidelity Review Notes

Scope: `mt-batchB-current-modern-en.json` (chapters 12–22) checked paragraph-by-paragraph
against `mt-batchB-source.json` (locked ground truth). 266 paragraphs total across 11
chapters, all read in full.

## Method

Every paragraph pair was read side-by-side in full (not sampled/skimmed), checking for:
dropped or invented clauses/sentences, meaning inversions, compression/summarization,
dropped citations or anecdotes, and factual/historical distortions (names, dates,
attributions). This was followed by two automated sanity passes as a second check:
(1) flagging any paragraph where the modern-en word count fell below 60% of the source
word count for source paragraphs over 15 words (a proxy for silent compression) —
zero flags; (2) flagging paragraphs with a large mismatch in negation-word count
(not/no/never/nothing/none) between source and modern-en, a proxy for meaning
inversion — zero flags.

## Verdict: PASS — no content-fidelity defects found in any chapter

Every chapter in this batch is a faithful, purely-modernized rendering of the source.
No dropped clauses, no invented content, no meaning inversions, no compressed or
summarized passages, no dropped classical citations/anecdotes, and no factual/
historical distortions were found. Every Latin/Greek/Italian citation is preserved
verbatim with its attribution (author + work + book/line reference) intact and
correctly matched to the source's attribution in every instance. All personal names,
place names, dates, and historical claims (e.g., regnal details, battle outcomes,
anecdote content) match the source.

Per-chapter verdicts:

| Ch. | Title | Paragraphs | Verdict |
|-----|-------|-----------|---------|
| 12 | Of constancy | 8 | PASS — faithful |
| 13 | The ceremony of the interview of princes | 4 | PASS — faithful |
| 14 | That men are justly punished for being obstinate in the defence of a fort that is not in reason to be defended | 4 | PASS — faithful |
| 15 | Of the punishment of cowardice | 6 | PASS — faithful |
| 16 | A proceeding of some ambassadors | 11 | PASS — faithful |
| 17 | Of fear | 11 | PASS — faithful |
| 18 | That men are not to judge of our happiness till after death | 14 | PASS — faithful |
| 19 | That to study philosophy is to learn to die | 124 | PASS — faithful (longest chapter in the batch; every citation and anecdote intact) |
| 20 | Of the force of imagination | 26 | PASS — faithful (frank content on impotence/sex/bodily matters preserved, not softened) |
| 21 | That the profit of one man is the damage of another | 3 | PASS — faithful |
| 22 | Of custom, and that we should not easily change a law received | 55 | PASS — faithful (long catalogue-of-customs passage in para 16, including frank sexual/incest/cannibalism content, fully preserved) |

## Defects found and fixed

None. No edits were required. `mt-batchB-corrected.json` is byte-for-byte the same
content as `mt-batchB-current-modern-en.json` (paragraph text unchanged), just copied
to the required output filename as the deliverable per the task instructions.

## One judgment call, noted but not changed

- **Chapter 15, paragraph 4**: The source (a public-domain 19th-century translation
  with an evident transcription slip) reads "those who ran away with **Aeneius**
  Fulvius at his defeat." The modern-en rendering has "**Cnaeus** Fulvius" — the
  historically correct praenomen for the Roman commander Gnaeus (Cnaeus) Fulvius
  Flaccus/Centumalus associated with this defeat tradition. This is a name spelled
  differently from the locked source text, but it does not change who is being
  referred to, invert any meaning, or misattribute the anecdote to a different
  historical event or person — if anything it corrects an OCR-era garbling in the
  source's proper name. Flagging for visibility; left unchanged since it is not a
  fidelity break (no content, meaning, or attribution distortion), and "fixing" it
  to match the source's garbled spelling would move away from historical accuracy
  rather than toward source fidelity.

## Verification

`mt-batchB-corrected.json` programmatically verified to match `mt-batchB-source.json`
in chapter count (11), chapter numbers/order, and per-chapter paragraph counts
(8, 4, 4, 6, 11, 11, 14, 124, 26, 3, 55 — all match).
