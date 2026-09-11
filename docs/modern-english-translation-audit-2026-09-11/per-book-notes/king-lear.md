# King Lear — modern-en audit (batch B5)

- **Book ID:** `king-lear`
- **Title / author:** King Lear / William Shakespeare
- **Scope:** public (in `BOOKS`)
- **Reviewer:** batch agent B5, 2026-09-11

## Edition snapshot (Phase 1 data)

| Edition | sha256_16 | Chapters | Paragraphs | Words | Label |
|---|---|---|---|---|---|
| original-en | `6a8c008eae109059` | 26 | 1371 | 27,157 | Shakespeare (1608) |
| modern-en | `9f4719b82396b06f` | 26 | 1371 | 27,973 | Modern English |
| modern-da | `b330f5edaddf7217` | 26 | 1371 | 28,472 | Moderne Dansk |

Mechanical comparison: mean weighted similarity **0.6787**; identical long paragraphs
**0.6%**; truncation flags **0**; empty paragraphs **0**; no chapter or paragraph
mismatches; `en_editions_aligned: true`. Not on the README's 33-book watchlist.

## Provenance and completeness of the core English text

26 chapters, all genuine Act/Scene units with location subtitles, matching the canonical
5+4+7+7+3 = 26-scene structure. No apparatus debris.

**Provenance label is wrong.** The registry labels original-en `Shakespeare (1608)`
with `year: 1608`, i.e. the First Quarto. The file is a *conflated* text: it contains
Act 3 Scene 6, the mock trial (chapter index 14, 49 paragraphs), which the Folio cuts,
**and** it gives the closing quatrain *"The weight of this sad time we must obey"* to
Edgar, which is the Folio's assignment (Q gives it to Albany). It also contains Act 4
Scene 3 (`The French camp near Dover`, chapter index 18), a scene omitted entirely from
the Folio. A text holding all three of those simultaneously is the Globe/conflated
lineage, not Q1 1608. See
[Internet Shakespeare Editions, *Differences between the Quarto and Folio texts*](https://internetshakespeare.uvic.ca/doc/Lr_TextIntro/section/Differences%20between%20the%20Quarto%20and%20Folio%20texts/)
and [Folger, *An Introduction to This Text: King Lear*](https://www.folger.edu/explore/shakespeares-works/king-lear/an-introduction-to-this-text/).
The delivered text is complete and in fact *more* complete than either single early
text; only the label is inaccurate.

## Samples inspected (6)

### 1. Act 1, Scene 1, paras 1–21 (opening: Gloucester on Edmund; the love-test) — strong
Source (para 2): *"…it appears not which of the Dukes he values most, for qualities are
so weighed that curiosity in neither can make choice of either's moiety."*
Modern: *"…it isn't clear which of the Dukes he values most—the portions are weighed so
evenly that no scrutiny could choose between them."*

**Finding:** Good. "moiety" and "curiosity" (= fastidious discrimination) both handled;
the sentence is genuinely opened up. Gloucester's coarse joke about Edmund's conception
is preserved, not softened: *"there was good sport at his making, and the whoreson must
be acknowledged"* → *"there was good sport in his making, and the bastard must be
acknowledged."*

### 2. Act 1, Scene 2, paras 1–7 (Edmund's "Thou, Nature, art my goddess") — strong
Source: *"Wherefore should I Stand in the plague of custom, and permit The curiosity of
nations to deprive me?"*
Modern: *"Why should I stand under the plague of custom and let the prudery of nations
rob me?"*

**Finding:** Energetic and faithful; "some twelve or fourteen moonshines Lag of a
brother" → "some twelve or fourteen months younger than a brother" is correct. One
questionable word choice: `"the curiosity of nations"` → `"the prudery of nations"`.
"Curiosity" here is fussy legalistic nicety, not prudishness; "the fine distinctions of
nations" or "the fussiness of the law" would be closer. Minor, single instance.

### 3. Act 1, Scene 4, paras 58–99 (the Fool) — **strong; the key test for this play**
Source (para 92): *"Why, after I have cut the egg i' the middle and eat up the meat, the
two crowns of the egg. When thou clovest thy crown i' the middle and gav'st away both
parts, thou bor'st thine ass on thy back o'er the dirt…"*
Modern: *"Why, after I've cut the egg in the middle and eaten up the contents, the two
crowns of the eggshell. When you cleaved your crown in the middle and gave away both
parts, you carried your ass on your back across the mud…"*

**Finding:** The brief's specific worry — that the modernization would *explain* the
Fool's jokes instead of preserving them as jokes — is not borne out. The egg/crown
riddle, the coxcomb bit, the "Truth's a dog must to kennel" gibe, the "bitter fool /
sweet fool" exchange and the nothing-out-of-nothing exchange all survive as jokes with
no interpretive gloss attached. `"coxcomb"`, `"nuncle"`, `"Lady Brach"`, `"motley"` are
all left standing as vocabulary. The Fool's verse keeps its shape and most of its rhyme
(*"Have more than you show, Speak less than you know, Lend less than you owe…"*), though
the second half of that stanza loses the rhyme (`goest/trowest/throwest` → `walk/trust/
throw`). `"bo-peep"` → `"peek-a-boo"` is a legitimate modern equivalent.

Two trivial slips: para 86 *"Do thou for him stand"* → *"Or do you stand for him"* adds
an "Or" that turns a command into an alternative; para 81–82 adds "now" to *"that's just
what the rent of his land comes to now"*.

### 4. Act 3, Scene 2, whole scene, 20 paras (the storm) — **strong; second key test**
Source (para 3): *"Rumble thy bellyful! Spit, fire! spout, rain! Nor rain, wind,
thunder, fire are my daughters; I tax not you, you elements, with unkindness."*
Modern: *"Rumble your bellyful! Spit, fire! Spout, rain! Neither rain, wind, thunder,
nor fire are my daughters. I do not accuse you, elements, of unkindness."*

**Finding:** Lear's broken, exclamatory syntax is preserved as broken. The modernization
does not stitch his fragments into coherent modern sentences — the short imperatives stay
short, the self-interruptions stay. `"thought-executing fires"` → `"thought-swift
fires"`, `"Vaunt-couriers"` → `"advance guards"`, `"all germens"` → `"all seeds"`,
`"pudder"` → `"uproar"`, `"simular of virtue"` → `"false imitator of virtue"` are all
good. The Fool's prophecy (para 18) keeps its full anaphoric list. `"Alack,
bareheaded!"` → `"Alas, bareheaded!"` is fine.

### 5. Act 4, Scene 6, paras 50–71 (mad Lear meets blind Gloucester) — mixed
Source (para 59): *"None does offend, none, I say none; I'll able 'em; Take that of me,
my friend, who have the power To seal the accuser's lips."*
Modern: *"None offends, none, I say none; I'll vouch for them. Take that from me, my
friend, who have the power to seal the accuser's lips."*

**Finding:** The great "reason in madness" speech is handled well — `"I'll able 'em"` →
`"I'll vouch for them"`, `"a scurvy politician, seem To see"` → `"a scurvy politician,
pretend to see"`, `"handy-dandy"` → `"presto-change-o"` (a slightly jarring Americanism,
but it does preserve the guessing-game reference rather than explaining it). The
fragmentation is again preserved. But two opaque cruxes are left untranslated with no
help: `"This a good block"` → `"This is a good block"` (a hat-block; meaningless as
rendered), and `"a man of salt"` left as-is.

### 6. Act 5, Scene 3, paras 130–154 (the ending) — **the weakest sample**
Source (para 142): *"With boot and such addition as your honours Have more than merited."*
Modern (para 142): *"with extra and such addition as your honours have more than merited."*

**Finding: a genuine defect.** `"With boot"` means "in addition, over and above";
rendering it "with extra" produces **"with extra and such addition"**, which is not
English. A reader hits a broken phrase, not an archaic one. This is the clearest
single error I found in the whole batch.

Around it, the final scene is the least-modernized stretch of the play. Four of the
book's twelve least-modernized long paragraphs sit in 5.3. Left unhelped:
- para 132: *"That from your first of difference and decay Have follow'd your sad
  steps"* → *"Who, from your first of difference and decay, have followed your sad
  steps"* — "first of difference and decay" is completely opaque and untouched.
- para 150: *"He but usurp'd his life"* → *"He but usurped his life"* — pronoun-only pass.
- para 131: *"I'll see that straight"* → *"I'll see **to** that straight"* — this shifts
  the sense from "I'll look into that shortly" to "I'll attend to that", and leaves
  "straight" (= straightaway) unmodernized.
- para 148: *"He hates him That would…"* → unchanged; now reads as ambiguous modern English.

Lear's death speech itself (para 143) is handled correctly and the five "never"s are
intact.

## Phase 1 flags: confirmed vs. disconfirmed

- **0 truncation / 0 empty / 0 mismatches** — confirmed; all 26 scenes present and
  paragraph-matched, including the Q-only 3.6 and 4.3.
- **0.6% identical long paragraphs** — confirmed low, but *misleadingly reassuring*.
  Ranking all 310 source paragraphs ≥25 words by similarity: 11 (3.5%) exceed 0.90 and
  the highest-similarity cluster is in Acts 4–5, not in the already-plain prose where
  identity would be benign. The book's quality is **not uniform across acts**: Acts 1–3
  are thoroughly modernized, Acts 4–5 measurably less so.
- **Archaic-token sweep:** 847 source instances of thou/thee/thy/hath/doth/ere/etc. → 17
  in modern-en (**2% retained**). A real modernization pass, not a mechanical copy.
- **Similarity distribution:** mean 0.675, median 0.684; 25% of long paragraphs below 0.60.

## Additional defects found (not in Phase 1 data)

1. **Stage-direction formatting is internally inconsistent in modern-en.** Source: 169
   bracketed / 64 bare. Modern: 222 bracketed / 21 bare, and 89 of those use ALL-CAPS
   character names (`[Enter KENT.]`) while the rest use mixed case (`Enter Gloucester.`).
   Two conventions coexist in one book.
2. **Spelling house style is split down the middle:** `honor` 9 / `honour` 9;
   `favor` 5 / `favour` 7.
3. **Provenance label** `Shakespeare (1608)` / `year: 1608` is inaccurate (see above).

## Phase 3 — human-edition research

Same finding as the rest of the Shakespeare batch. King Lear is an English original but
early-modern dramatic verse, so a modernization does remove a real barrier — SOURCE +
GLOSSES alone would leave readers stranded in the storm scenes.

Candidates checked and their rights status:

- **Standard Ebooks** — King Lear **not published** (only the histories and *The
  Winter's Tale*); and their texts are original-language modern-spelling, not
  translations. SE content is CC0. [standardebooks.org/ebooks/william-shakespeare](https://standardebooks.org/ebooks/william-shakespeare)
- **Wikisource / Project Gutenberg / Globe-Moby** — complete, **public domain**,
  commercial reuse permitted ([Wikisource: Reusing content](https://en.wikisource.org/wiki/Wikisource:Reusing_Wikisource_content)).
  Original language — this is what `original-en` already is.
- **Folger Shakespeare digital texts** — **CC BY-NC**, noncommercial only.
  [folger.edu](https://www.folger.edu/blogs/collation/free-cultural-works-come-get-your-free-cultural-works/) — rights-blocked for Tinct.
- **Internet Shakespeare Editions** — "educational, non-profit purposes" only; editor
  holds copyright. [ISE copyright](https://internetshakespeare.uvic.ca/Foyer/copyright.html) — rights-blocked.
- **Open Source Shakespeare** — CC BY-NC 4.0 — rights-blocked; original language anyway.
- **No Fear Shakespeare (SparkNotes), Shakescleare (LitCharts), NoSweatShakespeare** —
  complete modern-English translations, all proprietary. Permission required.
- **Durband, *Shakespeare Made Easy*** (Stanley Thornes 1990 / OUP 2014) — complete
  facing-page modern English, © Durband, no reproduction without written permission.
- **OSF *Play On!*** — complete modern translations of 39 plays, copyrighted, scripts
  issued only on request. [playonshakespeare.org](https://playonshakespeare.org/)
- **Lamb, *Tales from Shakespeare* (1807)** — King Lear *is* one of the 20 tales and it
  is public domain, but it is an **abridged prose retelling for children**, not the play.
  Fails completeness by design. [PG #573](https://www.gutenberg.org/cache/epub/573/pg573.txt)

**Conclusion: no complete, human-authored, rights-clear modern-English King Lear found in
this search.** Every rights-clear text is the original language; every modern-English
human rendering is copyrighted or NC-restricted.

## Phase 4 — rating

| Dimension | Weight | Score |
|---|---|---|
| Fidelity / completeness | 40% | 4 |
| First-read clarity | 25% | 3 |
| Literary voice | 20% | 5 |
| Restraint / no invention | 10% | 4 |
| Naturalness | 5% | 3 |

**Weighted score: 3.9 — band: Good with fixes.**

**Recommendation: LIGHT EDIT.**
The two things that are hardest to get right in this play — the Fool's wordplay and
Lear's fragmented mad syntax — are both got right, and nothing substantive is omitted or
invented. The problems are a defined set: one broken phrase ("with extra and such
addition"), a handful of opaque archaisms concentrated in Acts 4–5, split spelling
conventions, and two competing stage-direction formats. All are scoped and addressable
without re-rendering the play.

- **Confidence:** medium-high. 6 passages / roughly 1,800 source words read closely,
  plus a full-text similarity ranking and archaic-token sweep over all 1,371 paragraphs.
  Acts 4–5 deserve a fuller read than I gave them before the edit is scoped.
- **Correction scope:** local.

## Limitations of this review

- Acts 2 and 3 were sampled thinly (one scene in Act 3, none in Act 2 beyond the
  similarity ranking); Gloucester's blinding (3.7) and the Dover cliff trick (4.6 opening)
  were not read closely.
- `modern-da` not evaluated.
- Threads/onboarding/audio JSON not checked.
- The Q/F provenance claim rests on three internal markers I verified in the file plus
  published scholarship; I did not collate our text against a diplomatic transcript.
- Rights conclusions are research summaries, not legal advice.
