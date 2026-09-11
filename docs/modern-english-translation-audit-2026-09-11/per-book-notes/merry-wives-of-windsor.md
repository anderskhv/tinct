# merry-wives-of-windsor — The Merry Wives of Windsor (William Shakespeare)

Batch B5 · reviewed 2026-09-11 · scope: public

## Edition snapshot (from Phase 1 `mechanical/merry-wives-of-windsor.json`)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `4ee59167c634e42e` | 23 | 1,155 | 23,458 | Shakespeare (1623) |
| modern-en | `9c5531e4d3ff43f4` | 23 | 1,155 | 23,555 | Modern English |
| modern-da | `f41ce14ebf382e02` | 23 | 1,155 | 24,011 | Moderne Dansk |

`mean_weighted_similarity` 0.7495 · `pct_identical_long_paragraphs` 0.0% ·
0 truncation flags · 0 empty paragraphs · 0 chapter/paragraph mismatches ·
`en_editions_aligned: true` · not on the Phase 1 "closer attention" list.

As with `measure-for-measure`, **the 0.0% identical-paragraph figure is an
artifact of the source's apparatus** — see below.

## Provenance of the core English text — and the same source-quality problem

Registry label: **"Shakespeare (1623)", year 1623**. Not accurate. Like
`measure-for-measure` (and unlike `julius-caesar`, `twelfth-night` and
`henry-iv-part-2`, which all come from Project Gutenberg #100), this file is a
transcription of the **Clark & Wright Cambridge/Globe text with its editorial
apparatus intact**:

- Abbreviated italic speaker tags: `_Shal._`, `_Slen._`, `_Evans._`, `_Fal._`,
  `_Ford._`, `_Quick._`, `_Mrs Page._`.
- **Globe line numbers embedded in the running text** at five-line intervals:

  > `_Slen._ All his successors gone before him hath done't; and all his
  > ancestors that come after him may: they may give the dozen white luces in
  > their coat.                           15`

- **451 of 1,155 paragraphs (39.0%) contain this line-number debris.**
- 2,480 underscore characters. `ParagraphRenderer.tsx` does no markdown
  conversion, so all of it renders **literally** in the reader.

PG#100 contains a clean Merry Wives (verified: `Ay, cousin Slender, and
Custalorum.` with full speaker names and no line numbers), so this is an
avoidable ingestion choice.

Completeness: **complete** as to scenes — 23 chapters = Acts 1–5, all 23
scenes, real Act/Scene + location chapter titles (verified as real scene labels,
not apparatus).

Rights: public domain.

## Whole-corpus mechanical check run for this review

Normalized per-paragraph similarity (strip `_`, strip line numbers, strip
speaker tag, lowercase, punctuation-insensitive, paragraphs ≥25 source words):

- **56.1% of substantial paragraphs are ≥0.85 similar to the source
  (58.7% by word share).**

Batch comparison: Julius Caesar 9.6%, Twelfth Night 21.9%, Henry IV Pt 2 51.7%,
Merry Wives **56.1%**, Measure for Measure 65.0%.

Unlike Measure for Measure and Henry IV Part 2, this edition *does* do real
lexical work in places (see sample 3) — the picture is uneven rather than
uniformly light. But the central defect is not the near-verbatim rate; it is
what happens to the dialects.

## Samples inspected (5 passages, ~3,200 source words, one per act, both
registers)

### 1. Act 1 Scene 1 (ch1, paras 0–13) — opening; the play's first comic beat

modern-en cleans the apparatus (`_Shal._` → `SHALLOW.`, line numbers stripped)
and glosses well: "luces" → "pike-fish", "quittance, or obligation" → "receipt,
or contract".

**Confirmed finding (flattened joke; a malapropism silently corrected).** Source
para 6:

> `_Slen._ All his **successors gone before him** hath done't; and all his
> **ancestors that come after him** may: they may give the dozen white luces in
> their coat.`

modern-en:

> `SLENDER. All his **ancestors before him** have done it, and all his
> **descendants after him** may do it too: they may bear the dozen white
> pike-fish on their coat of arms.`

Slender's inversion of *successors* and *ancestors* is the joke — it is the
first thing the play tells us about him and it establishes him as an idiot
before he has said anything else. The modern edition corrects it into a
perfectly sensible sentence, and the characterization is gone.

Evans's Welsh "louses" for "luces" two lines later (para 8) **is** kept, so the
treatment is already inconsistent within thirteen paragraphs.

### 2. Act 1 Scene 4 (ch4, paras 30–45) — Doctor Caius's household; comic
dialect scene

**Confirmed finding (dialect erased, and erased incompletely).** Caius's
French-accented English is his entire comic register. Here it is mostly
normalized:

> `_Caius._ By my trot, I tarry too long. --Od's me! Qu'ai-j'oublié! dere is
> some simples in my closet, dat I vill not for the varld I shall leave behind.`

modern-en:

> `CAIUS. By my troth, I tarry too long. — Goodness me! What did I forget!
> There are some herbs in my closet that I would not for the world leave
> behind.`

`dere`→`There`, `vill`→`would`, `varld`→`world`, and the French tag
`Qu'ai-j'oublié!` is translated away. Caius now speaks like everyone else.

Six paragraphs later the pass fails halfway and leaves a hybrid:

> `CAIUS. What shall an honest man do in my closet? There is no honest man
> **dat** shall come in my closet.`

which reads as a typo rather than as an accent.

Note also `_Caius._ Wherefore shall I be content-a?` → `CAIUS. Why should I be
calm?` — the `-a` suffix that marks his speech throughout is dropped.

### 3. Act 2 Scene 2 (ch6, paras 60–79) — Falstaff and "Master Brook"; the play's
best-sustained prose

This is the strongest sample in the book, and shows the edition *can* do the
work: "importuned" → "pressed", "meed" → "in reward", "detection" → "evidence",
"embattled" → "arrayed", "niggardly" → "stingily", "of great admittance" → "of
great social access". Ford's central image survives intact ("Like a fair house
built on another man's ground; so that I have lost my edifice by mistaking the
place where I erected it").

Still leaves stiff constructions untouched — "To what purpose have you unfolded
this to me?", "lay an amorous siege to the honesty of this Ford's wife" — but
this passage alone would rate a 4.

### 4. Act 4 Scene 1 (ch13, paras 20–43) — the Latin lesson; taken as the
"difficult passage" sample (no Phase 1 flags to draw from)

**Confirmed finding — the scene's comedy is dismantled.** The whole scene runs
on (a) Evans's Welsh pronunciation and (b) Mistress Quickly mishearing Latin as
obscenity. modern-en removes (a) and keeps (b), so the second no longer has
anything to attach to:

| source | modern-en |
|---|---|
| `_Evans._ No, it is 'lapis:' I pray you, remember in your **prain**.` | `EVANS. No, it is 'lapis:' I pray you, remember in your **brain**.` |
| `_Evans._ Leave your **prabbles**, **'oman**.` | `EVANS. Leave your **prattling**, **woman**.` |
| `_Evans._ **'Oman**, art thou **lunaties**? hast thou no **understandings** for thy cases, and the numbers of the genders? Thou art as foolish Christian **creatures** as I would **desires**.` | `EVANS. **Woman**, are you **lunatic**? Have you no **understanding** of your cases, and the numbers of the genders? You are as foolish a Christian **creature** as I would **desire**.` |

Yet `focative` (Evans's mangling of *vocative*) **is** kept — so the reader
meets a nonsense word from a character who, in this edition, otherwise speaks
flawless standard English, with no way to tell it is a mispronunciation.

Quantified across the whole book (regex counts on the two files):

| marker | original-en | modern-en |
|---|---|---|
| `'oman` (Evans) | 12 | **0** |
| `prain` | 3 | **0** |
| `prabble` | 3 | **0** |
| `pless` | 6 | **0** |
| `Got` (for God) | 6 | 2 |
| `by gar` (Caius) | 30 | **0** (→ 36× "by God") |
| `vat ` | 9 | 2 |
| ` vill ` | 9 | 1 |
| `varld` | 1 | **0** |

So the dialects are neither preserved nor cleanly removed: they are removed
**inconsistently**, leaving residue in 2–3 places per marker.

### 5. Act 5 Scene 5 (ch23, paras 70–86) — the ending

Complete; the three marriages, Falstaff's rueful couplets and Mistress Page's
closing invitation are all present and accurate.

**The dialect inconsistency is at its worst here**, in the opposite direction
from Act 1:

> `_Caius._ Vere is Mistress Page? **By gar**, I am cozened: I ha' married un
> garçon, a boy; un paysan, **by gar**, a boy; it is not Anne Page: **by gar**,
> I am cozened.`

modern-en:

> `CAIUS. **Vere** is Mistress Page? **By God**, I am cozened: I have married un
> garçon, a boy; un paysan, **by God**, a boy; it is not Anne Page: **by God**,
> I am cozened.`

Here the accent is *kept* (`Vere`) while the signature oath is *removed*
(`by gar` → `by God`) — the exact inverse of the Act 1 treatment, within the
same character, in the same edition. "Cozened" is meanwhile left unglossed.

**Confirmed finding (meaning error).** Source para 80:

> `_Fent._ **You do amaze her**: hear the truth of it.`

modern-en:

> `FENTON. **You are amazing her**: hear the truth of it.`

"Amaze" here means *bewilder / alarm*. "You are amazing her" reads in current
English as praise, and reverses the sense of Fenton's rebuke to Anne's parents.

## Phase 1 flags confirmed / disconfirmed

- `pct_identical_long_paragraphs: 0.0%` — **technically confirmed, editorially
  disconfirmed.** Byte-identity is impossible against a source carrying line
  numbers and `_` markup; normalized comparison gives **56.1%**. Same
  instrument blind spot as `measure-for-measure`.
- `truncated_paragraphs_total: 0` — **confirmed**; no compression or omission
  found in any sample. Content fidelity is largely sound.
- `mean_weighted_similarity 0.7495` — **confirmed**; pointed the right way but
  sat below the 0.90 screening threshold.
- `last_chapter_suspiciously_short: false` (2,133 words) — **confirmed**;
  Act 5 Scene 5 read to its end.
- `chapter/paragraph mismatch: 0`, `en_editions_aligned: true` — **confirmed**
  across five chapters by index-aligned reading.
- Chapter titles verified as real Act/Scene + location labels, not apparatus.

## Phase 3 — human-edition research

**Is the original already accessible?** No — and unusually so. Merry Wives is
the most dialect-dense play in the canon (Welsh, French, and Mistress Quickly's
malapropisms), plus dead Elizabethan slang. A first-time reader needs help.

Human modern-English **translations**:

1. **No Fear Shakespeare (SparkNotes)** — complete. **Fully copyrighted.**
   Rejected on rights.
2. **Shakescleare (LitCharts)** — complete. **Fully copyrighted.** Rejected.
3. **Folger Shakespeare digital texts** — modernized-spelling *original*, not a
   translation; **CC BY-NC 3.0** (verified at
   https://www.folger.edu/copyright-policy/ — "you may not use the material
   from Folger Digital Texts for commercial purposes"). Noncommercial
   restriction blocks Tinct's paid tier.
4. **Lamb, *Tales from Shakespeare*** — does **not** include Merry Wives. Not
   applicable.

**No complete, readable, rights-clear human modern-English translation was
found in this search.** "None found in this search", not "none exists".

Human edition for the **original-language** text — a clear actionable win:

- **Standard Ebooks, *The Merry Wives of Windsor*** —
  https://standardebooks.org/ebooks/william-shakespeare/the-merry-wives-of-windsor
  — **CC0 1.0 Universal public-domain dedication**, based on the **same Clark &
  Wright 1887 Victoria edition (from the Globe edition)** Tinct's original-en
  already derives from. Verified by opening `/text/single-page`: full speaker
  names, **no line numbers**, no `_` markup, and — importantly for this play —
  **the dialect spellings are preserved in full** ("It is that fery person for
  all the 'orld", "leave our pribbles and prabbles", "Got pless your house
  here!").

  Drop-in replacement for the corrupted original-en, same textual family,
  rights-clear for commercial use, fixes a defect affecting 39% of paragraphs.
  Alignment work required (segmentation differs) — noted as work, not a quality
  strike. PG#100's Merry Wives is an equally free alternative.

## Phase 4 — rating

| dimension | weight | score |
|---|---|---|
| fidelity / completeness | 40% | 4 |
| first-read clarity | 25% | 3 |
| literary voice | 20% | 2 |
| restraint / no invention | 10% | 3 |
| naturalness | 5% | 3 |

**Weighted score 3.2 — band: Mixed.**

Fidelity 4: nothing omitted or compressed, but two confirmed content-bearing
alterations (Slender's malapropism corrected; "You do amaze her" reversed).
Clarity 3: 56.1% near-verbatim, but the prose scenes do get real work, so this
is better than Measure for Measure or Henry IV Part 2. Voice **2**: in a play
whose comedy is substantially *built* on two dialects and a malapropist, the
dialects are erased inconsistently and one malapropism is corrected away. This
is the dimension that decides the recommendation. Restraint 3: the
"corrections" are interventions, and "by God" replaces a character's signature
oath. Naturalness 3: the surviving hybrids ("no honest man dat shall come in my
closet") read as typos.

## Recommendation

**RETRANSLATE** — confidence **high**, correction scope **substantial**.

The defect is recurring and structural, not local: it runs from Act 1 Scene 1 to
Act 5 Scene 5, it is quantified corpus-wide (dialect markers reduced from 79
occurrences to 5), and it is *internally contradictory* — Act 1 strips Caius's
accent and keeps his oath; Act 5 keeps his accent and strips his oath. No
scoped edit fixes that; it needs a stated policy and a re-run.

The retranslation brief must settle one question first: **what happens to
Evans's Welsh and Caius's French?** Both defensible answers exist —

- *preserve the dialect spellings* (what Standard Ebooks and every scholarly
  edition do) and modernize only the surrounding vocabulary; or
- *render the accent differently in modern English* (consistent marked
  phrasing rather than eye-dialect)

— but the current edition has silently chosen a third option, "remove it
unevenly", which is the one that cannot work.

Also fix:
1. Restore Slender's successors/ancestors inversion (Act 1 Scene 1, para 6).
2. Correct "You are amazing her" → "You are bewildering her" or similar
   (Act 5 Scene 5, para 80).
3. Replace the "By Mary" rendering of "Marry".
4. **Replace `merry-wives-of-windsor-original-en.json`** with the Standard
   Ebooks (CC0) or PG#100 text — 39% of its paragraphs carry Globe line numbers
   and the file has 2,480 literal underscores, all of which the app renders.
   Doing this first also gives the retranslation a clean base to align against.
5. **Correct the registry provenance label** — "Shakespeare (1623)" / year 1623
   is not what this file is.

## Limitations of this review

- 5 of 23 scenes sampled line by line (~3,200 of 23,458 source words, ~14%),
  covering Acts 1, 2, 4 and 5. **Act 3 was not read** (ch8–ch12, including the
  buck-basket scene, which is the play's central farce sequence). The dialect
  counts above are corpus-wide and do not depend on the sampling, but the
  clarity judgement does.
- The 56.1% figure measures non-change, not unreadability, and cannot detect
  omission or invention.
- Dialect-marker counts are regex counts on raw text; a small number may be
  false positives (e.g. `de ` matches French articles in Caius's real French as
  well as his accented English), so treat the individual rows as indicative and
  the pattern as established.
- `modern-da` not reviewed — but note it will have inherited the same dialect
  question, and Danish may need a different answer. Audio alignment, onboarding
  JSON and cast JSON not checked.
- Rights research is a documentary review, not legal advice; I did not
  separately analyse Danish/EU treatment of CC0 or whether a commercial Folger
  licence is obtainable.
