# julius-caesar — Julius Caesar (William Shakespeare)

Batch B5 · reviewed 2026-09-11 · scope: public

## Edition snapshot (from Phase 1 `mechanical/julius-caesar.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `5368eeed76705533` | 18 | 997 | 20,592 | Shakespeare (1623) |
| modern-en | `ab371bca564b2e2f` | 18 | 997 | 20,831 | Modern English |
| modern-da | `977a7ebb2044578e` | 18 | 997 | 21,542 | Moderne Dansk |

`mean_weighted_similarity` 0.6146 · `pct_identical_long_paragraphs` 0.3% ·
0 truncation flags · 0 empty paragraphs · 0 chapter/paragraph mismatches ·
`en_editions_aligned: true` · not on the Phase 1 "closer attention" list.

## Provenance of the core English text

`bookRegistry.ts` labels original-en **"Shakespeare (1623)", year 1623**, i.e.
the First Folio. That label is **not accurate**. The file is a transcription of
**Project Gutenberg #100, *The Complete Works of William Shakespeare*** — a
19th/20th-century editorially modernized text (modern spelling, regularized
punctuation, curly quotes, Gutenberg's `[_Exeunt._]` italic markup, full
capitalized speaker names). Verified by direct comparison against
`https://www.gutenberg.org/cache/epub/100/pg100.txt` (downloaded during this
review): wording, punctuation and stage-direction conventions match exactly.

Completeness: **complete**. 18 chapters = Acts 1–5, all 18 scenes, real
Act/Scene + location titles (`Act 3, Scene 2 — The same. The Forum`), no
editorial-apparatus debris, no line numbers. Chapter titles verified as real
scene labels, not apparatus.

Rights: public domain in the US (Project Gutenberg). The underlying play is
public domain worldwide.

## Whole-corpus mechanical check run for this review

Beyond the Phase 1 numbers I recomputed a normalized per-paragraph similarity
(strip italic markup and speaker tag, lowercase, punctuation-insensitive,
paragraphs ≥25 source words) to measure how much of the modern-en is actually
near-verbatim source:

- **9.6%** of substantial paragraphs are ≥0.85 similar to the source
  (**7.9%** by word share).

That is the lowest figure of the five plays in this batch (Twelfth Night 21.9%,
Merry Wives 56.1%, Henry IV Pt 2 51.7%, Measure for Measure 65.0%) and is
consistent with a genuine modernization rather than a spelling pass.

## Samples inspected (6 passages, ~2,900 source words, one per act + comic and
high-register scenes)

### 1. Act 1 Scene 1 (ch1, paras 0–21) — opening, comic low register, full scene

The cobbler's puns survive. Source para 6:

> COBBLER. A trade, sir, that I hope I may use with a safe conscience, which is
> indeed, sir, a mender of bad soles.

modern-en:

> COBBLER. A trade, sir, that I hope I can practice with a clear conscience —
> I'm a mender of bad soles.

"soles/souls" kept intact. Para 8 "be not out with me; yet, if you be out, sir,
I can mend you" → "don't lose your temper with me. But if you're out of sorts,
sir, I can mend you" — the double sense of "out" (angry / worn out) is partly
carried by "out of sorts". Acceptable.

**Minor finding (over-specification).** Source para 15:

> What tributaries follow him to Rome, To grace in captive bonds his chariot
> wheels?

modern-en:

> What conquered kings follow his chariot to Rome in chains?

"tributaries" = tribute-paying captives; "kings" is a rank the source does not
assert. Two source clauses are correctly merged, but the added specificity is a
small invention. Local, word-level.

### 2. Act 1 Scene 2 (ch2, paras 62–87) — Casca's prose narration; the hardest
passage in the play for a modernizer (colloquial Elizabethan prose, three
sustained jokes). Chosen as the "difficult passage" sample since the book has
no Phase 1 flags.

Handling is very good — "he pluck'd me ope his doublet", "the rabblement
hooted, and clapp'd their chopt hands", "it was Greek to me" all land. Adding
"Antony" as the explicit subject in "Then Antony offered it again" is a
legitimate disambiguation.

**Confirmed finding (inconsistent term breaks a pick-up).** Source paras 75–76:

> BRUTUS. 'Tis very like: he hath the falling-sickness.
> CASSIUS. No, Caesar hath it not; but you, and I, And honest Casca, we have
> the falling-sickness.

modern-en:

> BRUTUS. That's likely enough — he has epilepsy.
> CASSIUS. No, Caesar doesn't have it. But you and I and honest Casca — we have
> the falling sickness.

Cassius's line is a deliberate repetition of Brutus's phrase, turned to a
political meaning ("falling" = falling into subjection). By glossing Brutus's
instance as "epilepsy" and keeping Cassius's as "falling sickness", the modern
edition breaks the pick-up: a first-time reader no longer sees that Cassius is
quoting Brutus. This is the exact class of defect our standard protects
("meaningful repetition must survive"). Local and mechanically fixable.

### 3. Act 2 Scene 1 (ch4, paras 0–19) — Brutus's "It must be by his death"
soliloquy and the forged-letter sequence

Strong. "Th' abuse of greatness is, when it disjoins Remorse from power" →
"The abuse of greatness comes when it cuts conscience away from power" — image
kept, "remorse" correctly read as *conscience*. The serpent's-egg figure and
the ladder figure are preserved as images, not replaced by explanations. The
letter's "&c." is kept as "etc." so Brutus's act of filling in the blank still
makes sense.

### 4. Act 3 Scene 2 (ch9, paras 0–44 and 60–81) — the funeral orations; the
batch brief's specific check

**Confirmed strong.** The refrains are preserved verbatim and in position.
Antony's speech (para 35) keeps "Brutus is an honorable man" / "so are they
all, all honorable men" / "and Brutus is an honorable man" / "and surely he is
an honorable man" unvaried, and "Yet Brutus says he was ambitious" unvaried,
across all four returns. Brutus's prose oration (para 7) keeps the triple
"If any, speak — for he is the one I have offended", and the four-term
antithesis "There are tears for his love; joy for his fortune; honor for his
valor; and death for his ambition". The double superlative "the most unkindest
cut of all" (para 63) is deliberately retained.

**Two micro-findings in this scene:**

(a) Source para 1: `CITIZENS. We will be satisfied; let us be satisfied.` →
modern-en: `CITIZENS. We demand an explanation. Let us be satisfied.` The
source's doubling of "satisfied" is varied away in the first half.

(b) Source para 70:
`CITIZENS. Revenge,—about,—seek,—burn,—fire,—kill,—slay,—let not a traitor
live!` → modern-en: `CITIZENS. Revenge — search — burn — fire — kill — slay —
don't let a traitor live!` — "about" (= turn about, set about it) is dropped;
seven shouted verbs become six. Trivial in substance but it is a confirmed
word-level omission.

### 5. Act 4 Scene 3 (ch13, paras 20–44) — the Brutus/Cassius quarrel

Strong. The stichomythia ("I durst not?" / "No." / "What? durst not tempt
him?") keeps its rhythm; "such rascal counters" → "such worthless coins" is a
correct, unfussy gloss; Cassius's "dearer than Plutus' mine" is kept as an
image with no added explanation.

### 6. Act 5 Scene 5 (ch18, paras 30–48) — the ending

Complete and accurate through Antony's "This was the noblest Roman of them all"
and Octavius's closing couplet. "Live free men" / "the elements so mixed in
him" preserved. No truncation; the Phase 1 `last_chapter_suspiciously_short`
flag is correctly `false` (713 words).

## Phase 1 flags confirmed / disconfirmed

- `truncated_paragraphs_total: 0` — **confirmed**; no truncation seen in any
  sampled passage.
- `pct_identical_long_paragraphs: 0.3%` — **confirmed**; only stage directions
  and one- or two-word lines come through unchanged.
- `last_chapter_suspiciously_short: false` — **confirmed** by reading Act 5
  Scene 5 to its end.
- `chapter/paragraph mismatch: 0` and `en_editions_aligned: true` —
  **confirmed** by index-aligned reading across six chapters; paragraph *i* of
  chapter *c* matched in every sample.

## Phase 3 — human-edition research

The original is Early Modern English verse and prose. It is **not** already
accessible in the sense our standard means: Antony's and Brutus's orations are
readable, but the Casca prose, the Cassius/Brutus quarrel, and the Act 2
soliloquies carry enough dead vocabulary and inverted syntax to be a real
barrier. So a modern edition is worth maintaining here, and "SOURCE + GLOSSES"
is not sufficient.

Candidates for a **human modern-English translation**:

1. **No Fear Shakespeare (SparkNotes/Barnes & Noble)** — complete, line-facing
   modern prose. **Fully copyrighted**; no reuse licence. Rejected on rights.
2. **Shakescleare (LitCharts)** — complete modern translation.
   **Fully copyrighted.** Rejected on rights.
3. **Folger Shakespeare digital texts** (https://www.folgerdigitaltexts.org/) —
   these are *modernized-spelling editions of the original*, not translations,
   and are released under **CC BY-NC 3.0** (verified at
   https://www.folger.edu/copyright-policy/ : "you may not use the material
   from Folger Digital Texts for commercial purposes"). Tinct sells a $3/mo
   Premium tier, so this is a **noncommercial restriction** that blocks use
   without a licence from editions@folger.edu.
4. **Public-domain prose retellings** — Lamb's *Tales from Shakespeare* (1807)
   does **not** include Julius Caesar; E. Nesbit's *Beautiful Stories from
   Shakespeare* retellings are abridged, not complete. Unsuitable as a reading
   edition regardless of rights.

**Conclusion: no complete, readable, rights-clear human modern-English
translation of Julius Caesar was found in this search.** This is "none found in
this search", not "none exists" — but the structural reason is strong: every
complete modern-English Shakespeare translation is a 20th/21st-century work
still in copyright.

Best rights-clear human edition found, for the **original-language** text:

- **Standard Ebooks, *Julius Caesar*** —
  https://standardebooks.org/ebooks/william-shakespeare/julius-caesar —
  based on Clark & Wright's 1887 Victoria edition (from the Globe edition),
  dedicated to the public domain via **CC0 1.0**. Verified by opening the
  Standard Ebooks text: clean, no line numbers, no italic markup, full speaker
  names. It is a *lateral* move for this book — Tinct's PG#100-derived
  original-en is already clean and equally rights-clear — so no action needed
  here. (It matters for `measure-for-measure` and `merry-wives-of-windsor`; see
  those notes.)

## Phase 4 — rating

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 5 |
| first-read clarity | 25% | 5 |
| literary voice | 20% | 4 |
| restraint / no invention | 10% | 4 |
| naturalness | 5% | 5 |

**Weighted score 4.7 — band: Strong.**

Voice is 4 rather than 5 only because of the falling-sickness/epilepsy break and
the varied "satisfied" repetition. Restraint is 4 because of "conquered kings"
and the "epilepsy" substitution.

## Recommendation

**LIGHT EDIT** — confidence **medium**, correction scope **local**.

The edition meets the reading standard across every register I sampled,
including the set-piece rhetoric the batch brief singled out. Three scoped
fixes:

1. Restore the pick-up in Act 1 Scene 2: render Brutus's "falling-sickness" the
   same way as Cassius's (keep "falling sickness" in both, glossing once if
   needed), so Cassius's repetition reads as a repetition.
2. Restore the dropped "about" in the citizens' cry (Act 3 Scene 2, para 70).
3. Reconsider "conquered kings" for "tributaries" (Act 1 Scene 1, para 15) and
   the varied "We demand an explanation" / "let us be satisfied" doubling
   (Act 3 Scene 2, para 1).

Separately, and not a translation issue: the registry label
**"Shakespeare (1623)" / year 1623 is wrong provenance** for a PG#100-derived
modernized text and should be corrected across Tinct's Shakespeare set.

## Limitations of this review

- 6 of 18 scenes sampled (~2,900 of 20,592 source words, ~14%). Acts 1, 2, 3, 4
  and 5 each represented; Act 2 Scenes 2–4, Act 3 Scenes 1 and 3, Act 4 Scenes
  1–2 and Act 5 Scenes 1–4 were **not** read line by line.
- "Strong in samples" is not "the whole book is verified". The whole-corpus
  near-verbatim scan (9.6%) is mechanical evidence that the rest is also
  genuinely rewritten, but it cannot detect invention or omission.
- I did **not** review `modern-da` at all, did **not** check audio alignment,
  and did **not** check onboarding/cast JSON.
- Rights research is a documentary review, not legal advice; I did not resolve
  whether Folger's CC BY-NC terms could be licensed for Tinct's use.
