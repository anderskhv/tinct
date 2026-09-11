# the-tempest — The Tempest (William Shakespeare, 1611)

**Audit date:** 2026-09-11 · **Scope:** public · **Reviewer:** batch agent (Shakespeare batch)

## Edition snapshot (from Phase 1 `mechanical/the-tempest.json`)

| edition | sha256_16 | chapters | paragraphs | words |
|---|---|---|---|---|
| original-en (Original Text) | `c7b057ac30de314a` | 10 | 790 | 17,269 |
| modern-en (Modern English) | `ddbade7e7141e485` | 10 | 790 | 18,102 |
| modern-da (Moderne Dansk) | `82dcfbf3e42e6ebd` | 10 | 790 | 18,293 |

`en_editions_aligned: true`, no paragraph-count mismatches, mean weighted similarity **0.4294**
(solidly in real-rewrite range), 2.5 % identical long paragraphs, 0 truncations, 0 empty
paragraphs, **`last_chapter_suspiciously_short: true`** (149 words). modern-en runs
**+833 words (+4.8 %)** over the source.

## Provenance / completeness of the core English text — **different source from the rest of the batch**

- Core key `original-en`; English original, no translator. Registry
  (`app/src/data/bookRegistry.ts` L350-383) records no source attribution — **provenance
  undocumented**.
- **This book's `original-en` does not come from the same source family as the other four
  Shakespeare plays in this batch.** Typographic evidence:

| | hamlet / macbeth / midsummer / romeo-and-juliet | **the-tempest** |
|---|---|---|
| apostrophes | curly `’` (347–826 per book) | **straight `'` (437)** |
| dashes | em dash `—` (28–144 per book) | **`--` (78), zero em dashes** |
| aside markup | `[Aside.]` / `[_Aside._]` | `[Aside]` (no period) |

- The Tempest source also carries **OCR corruption that the other four do not**:
  - ch4 p4: `a very ancient and fish- like smell; a kind of not of the newest Poor- John`
    — two broken hyphen-space splits (the only two in the entire batch).
  - ch4 p4: `they will **lazy** out ten to see a dead Indian` — should be *lay out ten*.
  - ch8 p55: `So **fun** of valour that they smote the air` — should be *full of valour*.
  - ch8 p46: `Bear with my weakness; **my, brain** is troubled` — stray comma.
- **modern-en silently repairs several of these** (`lazy out ten` → `spend ten`,
  `So fun of valour` → `drunk and reckless with bravado`, `fish- like` → `fish-like`), which is
  good for the reader but produces the odd situation that the "Modern English" edition is textually
  *more accurate* than the "Original Text" it sits beside in split-pane.
- **modern-en inherits the `--` convention and amplifies it: 231 occurrences, zero em dashes**,
  where the other four modern-en editions use em dashes (4–683 each). In a reader that renders
  `--` literally this is a visible typographic defect unique to this book.
- Complete: all 9 scenes plus the Epilogue, Act 1 Scene 1 through Act 5 Scene 1 + Epilogue.
  `sections` correctly lists `Act 1`…`Act 5`, `Epilogue`.

## Structure check (books/AGENTS.md Shakespeare failure mode)

Apparatus scan: **0 apparatus/stub suspects.** All 10 titles are clean reader-facing labels
(`Act 3, Scene 1 — Before Prospero's Cell`, `Epilogue — Spoken by Prospero`). Editorial-collation
failure mode **disconfirmed**.

Speaker tags / stage directions: **convention followed.** `PROSPERO.`, `[Enter CALIBAN with a
burden of wood. A noise of thunder heard]`, `[Exeunt]`, and inline `[Aside]`,
`[Aside to SEBASTIAN]`, `[Within]`, `[Sings drunkenly]`, `[Sings in GONZALO's ear]`,
`[ARIEL sings and helps to attire him]` all preserved verbatim.

**But two speaker attributions are wrong, in both editions** (inherited from the source parse):

- `ch2 (Act 1 Scene 2) p116`, identical in original-en and modern-en:
  ```
  PROSPERO. ARIEL'S song. Come unto these yellow sands, And then take hands…
  ```
  This is **Ariel's** song. The parse has tagged it `PROSPERO.` and then left the real attribution
  (`ARIEL'S song.`) stranded *inside* the speech as though Prospero were saying the words
  "Ariel's song".
- `ch2 p123`, same pattern:
  ```
  FERDINAND. Full fathom five thy father lies; Of his bones are coral made…
  ```
  This is also **Ariel's** song — the stage direction at p122 is literally `[ARIEL sings]`.
  Ferdinand is the *listener*; the parse has given him the song.

So the play's two most famous lyrics are both assigned to the wrong speakers, and the error is
reader-visible in every edition. No other mis-attributions were found in this book.

## Samples inspected (6)

### 1. Act 1 Scene 2, paras 110–124 and 152–161 — Prospero / Caliban / Ariel / Ferdinand

Quality is high outside the two mis-attributions.

- SRC p112: `CALIBAN. I must obey: his art is of such power, It would control my dam’s god, Setebos, and make a vassal of him.`
- MOD p112: `CALIBAN. I have to obey him. His magic is so powerful it could overpower my mother's god, Setebos, and make him a slave.`
  → `Setebos` preserved (contrast the dropped proper nouns in hamlet and macbeth).

- SRC p159: `To the most of men this is a Caliban And they to him are angels.`
- MOD p159: `To most men, this one is a Caliban, and they are angels compared to him.`
  → correctly disambiguated without adding anything.

**Finding (a genuinely light/mechanical spot in an otherwise real rewrite), p123:**
- SRC: `Full fathom five thy father lies; Of his bones are coral made; Those are pearls that were his eyes: Nothing of him that **doth** fade But **doth** suffer a sea-change Into something rich and strange. Sea-nymphs hourly ring his **knell**`
- MOD: `Full fathom five thy father lies. Of his bones are coral made. Those are pearls that were his eyes. Nothing of him that **does** fade but **does** suffer a sea-change into something rich and strange. Sea nymphs hourly ring his **funeral bell**.`

The only changes are `doth`→`does`, `knell`→`funeral bell`, and punctuation. `Full fathom five thy
father lies` and `Of his bones are coral made` are left with their Early Modern inversions intact.
This is arguably the right call for a lyric this famous — but if so it is an editorial decision
that should be stated, because it is exactly the "LIGHT/MECHANICAL false modern" pattern the audit
is looking for, and it is inconsistent with how the rest of the book is handled. The other song
(p116, `Come unto these yellow sands`) *is* genuinely modernized in the same scene.

### 2. Act 2 Scene 1, paras 20–47 — Gonzalo vs. Antonio and Sebastian (dense courtly wordplay)

**The best wordplay handling in the batch.** This is a passage of relentless quibbling and almost
all of it survives:

- SRC p29/p30/p31: `It must needs be of subtle, tender and delicate **temperance**.` / `**Temperance** was a delicate wench.` / `Ay, and a subtle; as he most learnedly delivered.`
- MOD: `The climate here must be remarkably mild and pleasant.` / `"Temperance" was the name of a lovely girl.` / `Yes, and a subtle one, as he so learnedly explained.`
  → the puritan-name joke is kept and made legible by the quotation marks, and `subtle` and
  `delicate` are carried across both speeches so the callback still works.

- SRC p46/p47: `If but one of his pockets could speak, would it not say he lies?` / `Ay, or very falsely **pocket up** his report`
- MOD: `If just one of his pockets could talk, wouldn't it call him a liar?` / `Yes, or it would very dishonestly **pocket** his claim.`
  → the pocket/pocket-up pun preserved.

**Finding (minor, arguable):** SRC p24 `Ha, ha, ha! So, you're paid.` → MOD `Ha, ha, ha! You lose!`
reverses who the line addresses. `you're paid` most naturally means *you've collected your
winnings*. Low confidence — the source line is genuinely disputed — but worth a look.

### 3. Act 2 Scene 2, paras 0–13 — Caliban, Trinculo, Stephano (low-register comic prose)

Register differentiation is clear and correct: Caliban keeps elevated cursing, Trinculo and
Stephano get flat drunken prose.

- SRC p1: `All the infections that the sun sucks up From bogs, fens, flats, on Prosper fall` → MOD: `May every infection the sun sucks up from bogs, marshes, and swamps fall on Prospero`
- SRC p4: `a kind of not of the newest Poor- John` → MOD: `like the cheapest dried cod` — correct
  gloss of a dead term, and it repairs the OCR break at the same time.
- SRC p4: `they will lazy out ten to see a dead Indian` → MOD: `will gladly spend ten to gawk at a
  dead Indian` — the OCR corruption is fixed and the content is **not** softened (compare
  macbeth ch18 p8, where comparable content *was* softened).
- SRC p11 Stephano's song keeps its rhymes: `tang`/`hang`, `pitch`/`itch`.

### 4. Act 3 Scene 2, paras 53–59 — Caliban, Stephano and the catch

Short but confirms the comic register holds. `troll the catch You taught me but while-ere` →
`sing the round you taught me a little while ago`; `Flout 'em and scout 'em` → `Mock them and
scorn them` with the chiasmus preserved.

### 5. Act 4 Scene 1, paras 45–55 — "Our revels now are ended" (high-register verse)

**Excellent. The strongest single speech in the batch.** Complete, and images are kept as images:

- SRC p46: `And, like the baseless fabric of this vision, The cloud-capp’d towers, the gorgeous palaces, The solemn temples, the great globe itself, Ye all which it inherit, shall dissolve And, like this insubstantial pageant faded, Leave not a **rack** behind.`
- MOD p46: `And, like the flimsy fabric of this vision, the cloud-capped towers, the gorgeous palaces, the solemn temples, the great globe itself — yes, everything that exists upon it — shall dissolve, and, like this insubstantial pageant that has faded, leave not a **wisp of cloud** behind.`
  → `rack` correctly glossed (a wisp of cloud), not deleted; `We are such stuff as dreams are made
  of, and our little life is rounded with a sleep` kept intact.

Ariel's report at p55 is likewise complete — the tabor, the unbacked colts, the calf-like
following, the briars, the filthy-mantled pool all survive.

### 6. Epilogue (ch10, complete unit, 2 paragraphs) — **the Phase 1 short-final-chapter flag**

Full text of the modern-en Epilogue, second paragraph (the first is the stage direction
`[Spoken by Prospero]`, preserved):

> PROSPERO. Now all my spells are broken, and whatever strength I have left is only my own, which
> is very little. Now it's true: I must be kept here, confined by you, or sent to Naples. Do not
> let me -- since I have regained my dukedom and pardoned the man who betrayed me -- remain on
> this bare island, trapped by your spell. Instead, release me from these bonds with the help of
> your kind applause. Let the gentle breath of your approval fill my sails, or else my project
> fails, which was to entertain you. Now I have no spirits to command, no art to enchant, and my
> ending will be despair unless I am saved by prayer, which is so powerful it assaults mercy
> itself and frees all faults. As you would want your own sins pardoned, let your generosity set
> me free.

**Verdict: the flag is a false positive. The Epilogue is present and complete.** Every clause of
the source's 20 lines is accounted for; 131 source words → 149 modern words, i.e. it *expands*
like the rest of the book rather than truncating. `Gentle breath of yours my sails Must fill` →
`Let the gentle breath of your approval fill my sails` and `Give me your hands` → `the help of
your kind applause` are both correct unpackings of theatrical idiom. As the batch brief
anticipated, the short final unit is Shakespeare's, not a truncation bug.

The one loss: the Epilogue is in rhymed tetrameter couplets and modern-en renders it as prose.
Same issue as midsummer's epilogue, and less damaging here because nothing in the text draws
attention to the form.

## Phase 1 flags: confirmed vs disconfirmed

| flag | verdict |
|---|---|
| **`last_chapter_suspiciously_short: true` (149 words)** | **DISCONFIRMED as a defect.** The Epilogue is a real, intentionally short final unit of Shakespeare's text, and modern-en's version is complete — full text quoted above. Short is correct here. |
| `pct_identical_long_paragraphs: 2.5` | **No defect found.** My ≥15-word normalised scan returned **zero** identical long paragraphs in this book. The flagged ones are short exclamations and stage-adjacent lines. |
| `truncated_paragraphs_total: 0` | Confirmed. |
| `empty_paragraphs_total: 0` | Confirmed. |
| `en_editions_aligned: true` | Confirmed — 790 = 790 paragraphs across 10 units. |
| Shakespeare apparatus-debris failure mode | **Disconfirmed** — 0 suspects, all 10 titles clean. |
| *(not in Phase 1 data)* speaker mis-attribution | **New finding** — ch2 p116 and p123, both editions. |
| *(not in Phase 1 data)* divergent source text + OCR corruption + `--` typography | **New finding** — see Provenance. |

## Phase 3 — human-edition research

**Does the source already meet the reading standard?** No. The Tempest is among the densest of the
late plays (`trammel`-class compression throughout, plus `whist`, `featly`, `burthen`, `hight`,
`bombard`, `gaberdine`, `unback'd colts`, `filthy-mantled`). And in this book's case the source
text additionally carries OCR corruption, which makes reading the "original" harder than it should
be. A modern edition is justified.

**Rights-clear human modernization?**

| candidate | what it is | rights | verdict |
|---|---|---|---|
| **Play On Shakespeare / ACMRS Press** — *The Tempest* modern-verse translation (translator **not verified in this search**; Play On commissioned all 39 plays) | Complete line-by-line modern verse | **Permission required.** "© 2026 Play On Shakespeare. All Rights Reserved."; per-production script request; ACMRS Press states no CC licence and routes rights to acmrs@asu.edu. | **Rejected — rights.** |
| **Folger Shakespeare** digital text | Modern **spelling** + notes; Shakespeare's own words | **CC BY-NC 3.0**; folger.edu/copyright-policy: "you may not use the material from Folger Digital Texts for commercial purposes" | **Rejected** — NC blocks a paid product; not a modernization. |
| **Standard Ebooks** — *The Tempest*, from Clark & Wright's 1887 Victoria/Globe text | Original language, modern spelling, clean typography, no OCR corruption, correct speaker attributions | **Public domain / CC0** (SE additions CC0; source US-PD, with SE's standard caveat that non-US users should check local law) | **Not a modern-en candidate — but the highest-value action for this book.** Re-basing `original-en` on it would plausibly fix the two mis-attributed songs, the four OCR corruptions and the `--` typography in one move. **Verify against the SE text before hand-patching.** |
| Lamb (1807, PG #20657) — verified opening: "There was a certain island in the sea, the only inhabitants of which were an old man, whose name was Prospero…" | Narrative prose retelling, no speeches, heavily abridged | Public domain | **Rejected — incomplete.** |
| Nesbit (1907, PG #1430) | Same category | Public domain | **Rejected — incomplete.** |
| No Fear Shakespeare, Shakescleare, NoSweatShakespeare, Shakespeare Retold, Fluid Shakespeare | Complete modern parallel texts, free to read | All-rights-reserved commercial sites; free reading ≠ reuse | **Rejected — rights.** |
| PlayShakespeare.com | Original-language edited texts + notes; search results indicate GFDL | Licence page returned HTTP 403 to WebFetch — **unverified**. Not a modernization regardless. | Not applicable. |

**Conclusion:** none found in this search; for the public-domain corpus, effectively "none exists" —
every line-by-line modernization of Shakespeare postdates 1930 and is in copyright. The AI
modern-en fills a real gap here.

**Sources:** https://www.folger.edu/copyright-policy/ · https://standardebooks.org/ebooks/william-shakespeare ·
https://acmrspress.com/series/play-on-shakespeare/ · https://playonshakespeare.org/our-translations/ ·
https://www.gutenberg.org/files/20657/20657-h/20657-h.htm

## Phase 4 — ratings

| dimension | weight | score | reasoning |
|---|---|---|---|
| fidelity / completeness | 40 % | **4** | All 9 scenes and the Epilogue complete; +4.8 % word count; proper nouns preserved (`Setebos`); no softening of difficult content. Docked for the two inherited speaker mis-attributions (reader-visible in modern-en), the essentially unmodernized `Full fathom five`, and one arguable reversal at ch3 p24. |
| first-read clarity | 25 % | **5** | Clear throughout, including the Gonzalo/Antonio quibbling, which is the hardest prose in the play. Several OCR corruptions in the source are silently repaired in the reader's favour. |
| literary voice | 20 % | **4** | Strong register separation (Prospero / Ariel / Caliban / the drunks), images kept as images (`rack` → `wisp of cloud`, not deleted), songs keep some rhyme. Docked for the prose Epilogue and the untouched `Full fathom five`. |
| restraint / no invention | 10 % | **5** | No invented content found in six samples. Glosses stay inside what the source supports. |
| naturalness | 5 % | **4** | The prose itself is natural, but 231 literal `--` sequences with zero em dashes make this the only book in the batch with a visible typographic defect on the page. |

**Weighted score: 4.4** · **Band: Good with fixes**

Highest weighted score in the batch — but the highest number of *mechanical* fixes needed.

## Recommendation

**LIGHT EDIT** · confidence **medium** · correction scope **local**

Reasoning: the translation itself is the best in this batch — restraint is clean, the hardest
passages (Gonzalo's wordplay, "Our revels now are ended", Ariel's report) are excellently handled,
and the flagged short Epilogue turned out to be complete. What holds it back from KEEP is not the
prose but four inherited mechanical defects, all of which are cheap to fix and none of which
require retranslation.

Scoped fix list, in priority order:
1. **Fix the two mis-attributed songs in BOTH English editions** (check `modern-da` too): ch2 p116 (`PROSPERO. ARIEL'S song. Come unto these yellow sands…` → `ARIEL. Come unto these yellow sands…`) and ch2 p123 (`FERDINAND. Full fathom five…` → `ARIEL. Full fathom five…`).
2. **Normalize `--` to em dashes in modern-en** (231 occurrences) so this book matches the other four.
3. **Consider re-basing `original-en` on the Standard Ebooks / Clark & Wright text.** That single change would plausibly resolve items 1 and 2 plus the four OCR corruptions (`fish- like`, `Poor- John`, `lazy out ten`, `So fun of valour`, `my, brain is troubled`) and give the source documented provenance. Verify against SE first.
4. Decide explicitly on `Full fathom five` (ch2 p123): either modernize it like the rest of the book, or keep it and record the decision. Right now it reads as an oversight.
5. Re-check ch3 p24 (`So, you're paid` → `You lose!`) — low confidence, low stakes.
6. Optional: re-render the Epilogue (ch10 p1) in rhymed couplets.

**Note the ordering matters:** do item 3 before items 1 and 2, or the hand-patches will be
overwritten by the re-base.

## Limitations of this review

- I inspected **6 of 10 units** (ch2, ch3, ch4, ch6, ch8, ch10) — roughly 2,900 of 17,269 source
  words read closely, including the full Epilogue — plus mechanical coverage of all 10 units for
  alignment, titles, apparatus, identical paragraphs, speaker-tag parsing, OCR artifacts and
  typography. Act 1 Scene 1 (the storm), Act 3 Scene 1 (Ferdinand and Miranda), Act 3 Scene 3
  (the banquet / Ariel as harpy) and Act 5 Scene 1 (2,907 modern words — the play's longest scene
  and its resolution) were **not** read line by line. **Act 5 Scene 1 should be first in any
  follow-up.**
- The OCR-corruption survey used pattern scans (`\w- \w`, `--`, apostrophe class) plus what I
  happened to read; there may be further corruptions in the four unsampled scenes that neither the
  scans nor my reading caught.
- `modern-da` and `the-tempest-threads.json` not audited (out of scope), though the two
  mis-attributed songs should be checked there too.
- App integration, split-pane alignment and audio not checked. Note that split-pane will show the
  `--` / straight-apostrophe original beside the `--` modern, so the typographic issue compounds
  there.
- I did **not** open the Standard Ebooks Tempest text to confirm it repairs the specific defects
  listed — that is a recommendation to verify, not a verified fix.
- Rights research is desk research on published licence statements, not legal advice; no rights
  holder was contacted. Danish/EU vs US differences were not separately analysed because all
  candidates fail on plain all-rights-reserved or NonCommercial terms.
- PlayShakespeare.com's licence page returned HTTP 403; its GFDL status is **unverified**.
- I did not identify the Play On Shakespeare translator for *The Tempest*; the rights conclusion
  does not depend on the name.
