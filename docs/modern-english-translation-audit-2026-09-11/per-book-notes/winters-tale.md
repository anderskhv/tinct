# winters-tale — The Winter's Tale (William Shakespeare)

Batch B5. Reviewed 2026-09-11. Scope: **public**.

## Edition snapshot (Phase 1 data)

| edition | sha256_16 | chapters | paragraphs | words | label |
|---|---|---|---|---|---|
| original-en | `e725492b2ca705fc` | 15 | 911 | 25,744 | Shakespeare (1623) |
| modern-en | `b85a81abca26b0a3` | 15 | 911 | 26,229 | Modern English |
| modern-da | `dc48224cf47bdced` | 15 | 911 | 27,460 | Moderne Dansk |

`en_editions_aligned: true`. Mean weighted similarity 0.6339; identical long paragraphs 0.2%;
no truncation, no empty paragraphs, no paragraph-count mismatches, last chapter not short.

## Provenance / completeness of the core English text

`original-en` is the Early Modern English original (no translator), same Project Gutenberg
"modernized" lineage as comedy-of-errors, merchant-of-venice and henry-v (curly apostrophes, scene
headings with locations, `[_Exeunt._]` stage directions). Public domain.

Structure is **correct and complete**: 15 chapters = the play's 15 scenes (1.1, 1.2, 2.1–2.3,
3.1–3.3, 4.1–4.4, 5.1–5.3). Chapter titles are real Act/Scene labels with locations
(`Act 3, Scene 3 — Bohemia. A desert Country near the Sea`). Opens with `Enter Camillo and
Archidamus.` and Archidamus's `If you shall chance, Camillo, to visit Bohemia…`; ends with Leontes's
`this is a match, And made between 's by vows…` and `[_Exeunt._]`. No prologue/epilogue exists in
this play.

**Both of the batch brief's specific structural risks check out clean:**

- **The Time-chorus interlude (Act 4 Scene 1) survives intact** as its own chapter (ch9, 3
  paragraphs, 272 source words → 282 modern), with the whole 267-word speech rendered in full,
  including the sixteen-year jump, the self-defence about overturning custom, the naming of
  Florizel, and the handover to Perdita.
- **`Exit, pursued by a bear` survives** verbatim in both editions (ch8 p11:
  `[_Exit, pursued by a bear._]` → `[Exit, pursued by a bear.]`), in its correct position after
  Antigonus's `This is the chase: I am gone for ever` and before the Shepherd's entrance.

## Passages inspected (6)

### 1. Act 1, Scene 2 (ch2) para 43 — Leontes's "Affection!" speech; the hardest text in the play
Source: `LEONTES. Thou want'st a rough pash and the shoots that I have To be full like me… Affection! thy intention stabs the centre: Thou dost make possible things not so held, Communicat'st with dreams;—how can this be?— With what's unreal thou coactive art, And fellow'st nothing… And that to the infection of my brains And hardening of my brows.`
Modern: `LEONTES. You need a rough head and the horns I have to be quite my image… Suspicion! Your reach pierces the heart of things. You make impossible things believable, you commune with dreams—how can this be?—You work hand in hand with what's unreal, you partner with nothing… And it sickens my brain and stiffens my brow with the horns of a cuckold.`

**Two findings.**
- **Added gloss (invention).** `hardening of my brows` → `stiffens my brow **with the horns of a
  cuckold**`. The cuckold's horns are the implication; the source says only "brows". This is an
  explanatory addition, and it is redundant besides — the modern already rendered `the shoots that
  I have` as `the horns I have` eight lines earlier.
- **A crux narrowed.** `Affection!` is one of the most disputed words in Shakespeare (passion /
  imagination / lust / obsession are all defended). Rendering it `Suspicion!` picks one reading and
  closes the ambiguity the standard asks us to preserve. Defensible as an editorial choice, but it
  should be a conscious one.

Everything else in this near-impenetrable 154-word speech is handled with genuine skill.

### 2. Act 1, Scene 2 (ch2) paras 54–56 — Leontes alone; lowest-similarity chapter (wsim 0.475)
Source: `Gone already! Inch-thick, knee-deep, o'er head and ears a fork'd one!—`
Modern: `Gone already! Up to my neck in it, head and ears under—and horned!—`

**Finding: minor image loss.** The source's three-step escalation (inch-thick → knee-deep → over
head and ears) is collapsed into one idiom plus the tail. The rest of the speech — `Sir Smile, his
neighbour`, `No barricado for a belly`, `it is a bawdy planet` — is complete and vivid.

### 3. Act 3, Scene 2 (ch7) paras 24–29 — the oracle
Source: `subject; Leontes a jealous tyrant; his innocent babe truly begotten; and the king shall live without an heir, if that which is lost be not found.`
Modern: `subject; Leontes a jealous tyrant; his innocent baby truly begotten; and the king shall live without an heir, if that which is lost be not found.`

**Finding: strong.** The oracle's conditional (`if that which is lost be not found`) — the hinge of
the whole plot — is preserved exactly, not paraphrased into a prediction.

### 4. Act 3, Scene 3 (ch8) paras 10–17 — Antigonus, the bear, the Shepherd
Source: `SHEPHERD. …A boy or a child, I wonder? …Sure, some scape. Though I am not bookish, yet I can read waiting-gentlewoman in the scape. This has been some stair-work, some trunk-work, some behind-door-work.`
Modern: `SHEPHERD. …A boy or a girl, I wonder? …Surely some accident. Though I'm not bookish, I can read 'waiting-gentlewoman' in this mishap. This has been some stair-business, some chest-business, some behind-the-door business.`

**Finding: strong**, with one dialect flattening: `A boy or a child` relies on "child" meaning
"girl" in period usage; `A boy or a girl` is the right meaning but loses the oddity that marks the
Shepherd's speech. The triple `stair-work / trunk-work / behind-door-work` is preserved as a triple.

### 5. Act 4, Scene 1 (ch9) — the Time chorus (see above); and Act 4, Scene 4 (ch12) paras 47–53 — the sheep-shearing, Autolycus
Source: `SERVANT. …with such delicate burdens of dildos and fadings, "jump her and thump her"; and where some stretch-mouthed rascal would, as it were, mean mischief and break a foul gap into the matter…`
Modern: `SERVANT. …with such delicate refrains of dildos and fadings, 'jump her and thump her'; and where some big-mouthed rascal would, as it were, mean mischief and break a foul gap into the matter…`

**Finding: strong; not sanitized.** The bawdy is kept; `burdens`→`refrains`, `inkles, caddisses`→
`tape, threads`, `sleeve-hand and the work about the square` → `cuff and the embroidery around the
bodice` are exactly the kind of familiar-equivalent substitutions the standard asks for.

### 6. Act 5, Scene 3 (ch15) paras 28–39 — the statue scene; the ending
Source: `PAULINA. It is requir'd You do awake your faith.` / `Music, awake her: strike! [_Music._] 'Tis time; descend; be stone no more; approach; Strike all that look upon with marvel.`
Modern: `PAULINA. It is required that you wake your faith.` / `Music, wake her: strike! [Music.] It is time; descend; be stone no more; approach; strike all that look on you with marvel.`

Leontes's `[Embracing her.] O, she's warm!` and `If this be magic, let it be an art as lawful as
eating` land correctly. **Finding: strong.**

## Other observations (whole-book, not sample-level)

- The modern edition **adds 15 conventional editorial directions** the source lacks — `[Aside.]`,
  `[To Antigonus.]`, `[To Florizel.]`, `[Picks his pocket.]`, `[Takes off his false beard.]`,
  `[Music.]`. These are standard modern-edition practice and materially help a reader follow a play
  with this much concealed identity. I do not count them as inventions, but they should be a
  declared editorial policy rather than an emergent habit — and they are applied unevenly across the
  batch (15 here, 7 in merchant-of-venice, 6 in henry-v, 1 in as-you-like-it, 0 in
  comedy-of-errors).
- Quoted speech inside speeches is re-punctuated from curly double quotes to straight single quotes
  (`"jump her and thump her"` → `'jump her and thump her'`), inconsistently with the rest of the
  corpus. Cosmetic.
- `Exeunt` is correctly preserved in all 21 source occurrences (unlike merchant-of-venice, where all
  26 were downgraded to `Exit`).

## Phase 1 flags: confirmed vs disconfirmed

- `truncated_paragraphs_total: 0`, `empty_paragraphs_total: 0`, `para_count_mismatch_total: 0` —
  **confirmed**. Paragraph word ratios run 0.9–1.21 book-wide; no compression.
- `pct_identical_long_paragraphs: 0.2` (1 paragraph — `Here come those I have done good to against
  my will, and already appearing in the blossoms of their fortune.`) — **disconfirmed as a defect**;
  the line is already plain modern English. This is the lowest identical-paragraph rate in the batch.
- `mean_weighted_similarity: 0.6339` — the second-lowest in the batch, i.e. a genuinely substantial
  rewrite, verified as faithful in six samples.
- `last_chapter_suspiciously_short: false` — **confirmed**; ch15 (5.3) is 1,394 words, which is the
  real length of the statue scene.
- The high-expansion outliers (ch2 p78 1.21, ch2 p98 1.17, ch2 p81 1.16, ch2 p70 1.11) were all
  inspected: they are Leontes's and Camillo's compressed, syntactically knotted verse, and the
  expansion is unpacking, not padding.

## Phase 3 — human-edition research

English original. The original emphatically does **not** meet the reading standard — Acts 1–3 of
The Winter's Tale contain some of the most syntactically difficult verse Shakespeare wrote
(`Affection! thy intention stabs the centre`), and a modern edition is clearly worth maintaining.

1. **Play On Shakespeare / ACMRS Press — *The Winter's Tale*, tr. Tracy Young.** Complete
   modern-verse translation, in print from ACMRS Press.
   https://acmrspress.com/series/play-on-shakespeare/ · https://playonshakespeare.org/publications/
   **Rights: permission required** (in copyright, living translator; performance rights licensed via
   Play On; ACMRS's open-access platform covers scholarly titles and I found no Play On text on it).
   Text **unverified** — I found no free sample to read, so I am not claiming it is good, only that
   it exists and is complete.
2. **Folger Shakespeare digital texts** — **CC BY-NC 3.0**; the Folger states "you may not use the
   material from Folger Digital Texts for commercial purposes"
   (https://www.folger.edu/copyright-policy/). Blocked for a paid service, and it is a
   modern-spelling edition of the original, not a modern-English rendering.
3. **Lamb, *Tales from Shakespeare* (1807)** — public domain (PG #573), includes The Winter's Tale,
   but verified to be an abridged third-person prose retelling. Fails completeness.
4. **No Fear Shakespeare / NoSweatShakespeare** — free to read, fully copyrighted. Rejected.
5. **PG modernized series / #100** — public domain, but that is our `original-en` lineage.

**Conclusion: no complete, readable, rights-clear human modern-English edition found in this
search** (not: none exists).

## Ratings

| dimension | score |
|---|---|
| fidelity / completeness (40%) | 5 |
| first-read clarity (25%) | 5 |
| literary voice (20%) | 4 |
| restraint / no invention (10%) | 3 |
| naturalness (5%) | 5 |

**Weighted score 4.6 — band: Strong.**

Restraint is 3 because two added/narrowing glosses turned up inside a single sampled speech, which
suggests a habit rather than an accident; voice is 4 for the collapsed `inch-thick, knee-deep`
escalation and the flattened `boy or a child`.

## Recommendation

**LIGHT EDIT** — confidence **medium-high** (6 passages, ~1,600 source words, all five acts,
including the two structural elements the brief specifically asked about, both verified intact, plus
whole-book checks on `Exeunt`, added stage directions and expansion outliers).

Correction scope: **local**. This is a strong edition of a very hard play; the fixes are a handful
of lines.

Next action: remove the added `with the horns of a cuckold` at 1.2 p43; reconsider `Affection!` →
`Suspicion!` (a less committed word such as `Passion!` or `Obsession!` keeps more of the crux);
restore the three-step escalation in `Inch-thick, knee-deep, o'er head and ears`; and decide a
consistent corpus-wide policy for added `[Aside.]`/`[To X.]` directions and for quote-mark style.

## Limitations of this review

- 6 of 911 paragraphs read closely (~6% of the book by words). Act 4 Scene 4 is 288 paragraphs /
  7,218 words — a quarter of the play — and I read only one stretch of it closely; the Perdita
  flower speech, the Polixenes confrontation and the long Autolycus/Clown sequences were scanned
  mechanically, not compared line by line.
- Act 2 (Hermione's arrest, Paulina and the baby) and Act 5 Scene 2 (the gentlemen's report of the
  recognition) were not sampled at all beyond mechanical screening.
- `modern-da` not reviewed.
- I did not verify the threads/cast file, onboarding JSON, or audio alignment.
- Rights research is desk research; no legal opinion, no EU/Denmark-specific counsel. The Play On
  candidate is unverified as text and inferred as unlicensed from the absence of any open-access
  statement.
