# PARKED — Twelfth Night (`twelfth-night`, modern-en)

**Status:** PARKED after round 2 (independent adversarial verification).
**Parked:** 2026-09-21
**Round 1 (drafting/repair + self-review):** Claude Sonnet 5 (`claude-sonnet-5`).
**Round 2 (independent verification, this record):** Claude Opus 5 (`claude-opus-5`).

**Files as parked:**
- `source.json` sha256 `bf69ddee77f588e6032f726a7cb81a18b3d60ca37f380ed2d76a5f9d756baed3` (unmodified, never edited)
- `candidate.json` sha256 `ec5f6ffdceec193c10b578106f90e97a4ac1d7fe3b09431c5f58e55cd00b890c`

The candidate hash **does** match round 1's claimed hash — that part of round 1's
record is accurate, and no edits were made in round 2. Nothing in this directory
was changed except the addition of this file and a superseding banner on
`ACCEPTANCE-RECORD.md`. No app, registry, audio, SEO or deploy action was taken.
No paid API calls were made.

---

## Why parked rather than fixed

Round 2 found **12 fresh defects in a single coherent recurring class** —
*erasure of the source's own printed forms* — spread across 8 chapters, in a
book where round 1 explicitly certified this exact class clean ("no
inconsistent epithet rendering found anywhere in the book," "whole-book
case-sensitive proper-noun/epithet occurrence sweep," and by name: "'Sowter'
— left unglossed"). That claim is false: `Sowter` is not in the candidate at
all.

One of round 1's three fixes was itself a member of this class (Sir Andrew's
`incardinate`). Round 1 fixed the single instance it found and then certified
the class book-wide clean. Round 2 found nine more instances of the *same*
class, including one in the very scene round 1 was reading when it made the
certification (Ch10, the box-tree scene, two paragraphs from the M.O.A.I.
riddle it discussed at length).

This is the documented park shape from this batch — Midsummer (malapropism
erasure surviving two fix rounds, 3 more found in round 3), Gilgamesh
(softening class only partially fixed, 6 more in round 3), Frederick Douglass
(imported wording surviving three rewrites). It is also not narrow or
mechanical: deciding *which* of these to restore verbatim and which are
legitimate modernization (is `coystril`→`wretch` a loss? is `equinoctial`→
`equator` inside a deliberately nonsensical phrase?) is a line-drawing
judgment that has to be made consistently across the whole book by the
editing owner, not patched instance by instance by a verifier. Per the task's
instruction, I did not fix.

---

## Defects found (round 2) — all paragraph numbers 1-based

### Class A — proper nouns replaced by generic descriptors

| # | Loc | Source | Candidate |
|---|---|---|---|
| A1 | Ch10 ¶70 | "**Sowter** will cry upon't for all this, though it be as rank as a fox." | "**The hound** will bay at it anyway…" |
| A2 | Ch10 ¶83 | "…a pension of thousands to be paid from **the Sophy**." | "…paid by **the Shah of Persia**." |
| A3 | Ch14 ¶126 | "They say he has been fencer to **the Sophy**." | "…fencing master to **the Shah of Persia**." |
| A4 | Ch15 ¶28 | "**Rudesby**, be gone!" | "**Rude fellow**, be gone!" |

**A1 is the most serious.** Sowter is a named dog. The candidate deletes the
name and substitutes a category noun. The surrounding dog imagery survives
intact (¶72's "The cur is excellent at faults" → "…at false trails"), so this
is not a systematic de-doggifying — it is specifically the *name* that was
dropped. Round 1's records name Sowter twice as a preserved, deliberately
unglossed allusion.

**A2/A3** are worse than a gloss: rather than clarifying "the Sophy" they
*replace* it, importing an editorial identification into the reading text. The
protocol permits brief clarification of a term the source makes explicit; it
does not permit substituting the identification for the source's own noun.
Both instances render identically, so this was a deliberate book-wide choice,
not a slip — which is exactly why it needs an owner's decision, not a patch.

### Class B — source's own printed forms silently normalized to the standard form

| # | Loc | Source | Candidate |
|---|---|---|---|
| B1 | Ch10 ¶98 | "To the gates of **Tartar**" | "To the gates of **Tartarus**" |
| B2 | Ch18 ¶119 | "he holds **Belzebub** at the stave's end" | "he holds **Beelzebub** at staff's length" |
| B3 | Ch8 ¶37 | "My lady's a **Cataian**" | "My lady is a **Cathayan**" |

This is the batch's first carried-forward lesson verbatim: *"Never silently
'correct' a name/spelling/quotation to a historically standard form —
reproduce the source's own printed form."* Same class as the Bacchae
speaker-tag case and the Medea name correction. All three survived round 1's
"case-sensitive whole-book occurrence sweep," because a count-based or
name-list-based sweep cannot see a form that was replaced by a *different*
spelling of the same referent — the lesson Ivan Ilyich already produced
("round 1's whole-book name audit was count-based and missed a location
mismatch"). A location-keyed map catches these; a count does not.

### Class C — deliberate malapropisms and coinages erased (same class as round 1's own fix #3)

| # | Loc | Source | Candidate |
|---|---|---|---|
| C1 | Ch3 ¶16 | "they are scoundrels and **substractors** that say so" | "…is a scoundrel and a **slanderer**" |
| C2 | Ch14 ¶126 | "I have not seen such a **firago**." | "I have never seen such a **fury**." |
| C3 | Ch5 ¶27 | "**Dexteriously**, good madonna." | "**Skillfully**, good madonna." |
| C4 | Ch8 ¶39 | "**Tilly-vally!** 'Lady'!" | "**Pish!** 'Lady'!" |
| C5 | Ch18 ¶123 | "you must allow **_vox_**." | "you must allow **the proper voice**." |

C1 (`substractors` for "detractors") and C2 (`firago` for "virago") are Sir
Toby's own manglings, structurally identical to Sir Andrew's `incardinate`
that round 1 restored. C3 is Feste's Folio form. C4 substitutes a different
interjection for a distinctive source coinage. C5 drops an italicized Latin
term the source sets off as a term.

Borderline members of the same family, listed for the owner's decision but not
counted as blocking on their own: Ch3 ¶18 `coystril`→"wretch"; Ch8 ¶11
`equinoctial`→"equator"; Ch8 ¶38 `consanguineous`→"her blood-relation";
Ch8 ¶47 `Sneck up!`→"Go hang yourself!".

### Class D — isolated meaning drift (not part of the above pattern)

| # | Loc | Source | Candidate |
|---|---|---|---|
| D1 | Ch13 ¶16 | "SEBASTIAN. **I do remember.**" | "SEBASTIAN. **I'll remember.**" |

Antonio has just said "To th' Elephant" (¶15). Sebastian's "I do remember"
is present recollection of the inn already named in ¶11; the candidate turns
it into a future undertaking. Narrow and mechanically fixable on its own, but
recorded here rather than patched, since the file is parked.

---

## Round 1 record accuracy (for the next owner)

Independently re-derived, not taken from round 1's notes:

- **Structure — round 1 correct.** 18 chapters, all real Act/Scene reading
  units (Act 1 Sc.1-5, Act 2 Sc.1-5, Act 3 Sc.1-4, Act 4 Sc.1-3, Act 5 Sc.1),
  no apparatus/editorial/crosswalk chapters, reader-facing titles identical in
  source and candidate. 1,120 paragraphs in each, per-chapter counts match
  exactly (10/23/70/17/139/14/9/103/50/100/74/32/17/190/35/68/7/162), no empty
  or whitespace-only paragraphs, `sections` key absent in both.
- **All 3 round-1 fixes are genuinely present and genuinely match source** —
  re-derived from `source.json` and read in full paragraph, not headline word:
  `dam'd-colour'd stock` → "damned-colored stocking" (not emended to
  flame/dun/damask); `constancy` restored verbatim in Feste's opal sign-off;
  `incardinate` restored verbatim.
- **Round 1's paragraph numbering is off by one throughout.** Every location
  it cites (Ch3 ¶65, Ch9 ¶32, Ch18 ¶75) is 0-based reported as if 1-based; the
  actual 1-based locations are Ch3 ¶66, Ch9 ¶33, Ch18 ¶76. Documentation-only
  — the text is correct — but it makes the record unusable for re-derivation
  and is the same indexing-mismatch-between-rounds problem that cost Taming of
  the Shrew a round. **The next owner should fix the numbering convention in
  all review artifacts.**
- **Round 1's "no other defects found anywhere in the book" is not reliable.**
  See the 12 above. Its coverage claim (18/18 chapters, 1,120/1,120
  paragraphs, non-sampled) cannot be squared with missing `Sowter` in a scene
  it discusses paragraph by paragraph.

## What round 2 verified clean

These were read word-for-word against source and are clean; the next round
does not need to redo them from scratch, but should re-verify anything it
edits:

- **Willow-cabin speech** (Ch5 ¶116-127) — clean, imagery and rhetorical shape
  intact.
- **Letter-reading / "C's, U's, T's"** (Ch10 ¶44-82) — the bawdy joke is
  reproduced letter for letter including "her great P's"; `M.O.A.I.` riddle,
  `Lucrece` seal, `Jove`, the verse and the prose postscript all intact and
  unsoftened. (The Sowter defect A1 sits inside this range at ¶70.)
- **Box-tree gulling** (Ch10 ¶10-100) — clean apart from A1 and B1.
- **Duel-arrangement scene** (Ch14 ¶108-141) — clean apart from A3 and C2;
  "hob, nob," "unhatched rapier," "on carpet consideration," grey Capilet,
  Viola's "how much I lack of a man" aside all present.
- **Final recognition/reunion** (Ch18 ¶88-115) — clean; the mole, the thirteen
  years, "a maid and man," Messaline all intact.
- **Feste's songs** — "O mistress mine," "Come away, come away, death," "I am
  gone, sir," and the closing "When that I was and a little tiny boy" (all five
  stanzas, Ch18 ¶157-161) — all preserved essentially verbatim; no stanza
  dropped, no refrain flattened.
- **Compression sweep, re-derived from scratch** — word-count ratios computed
  for all 1,120 paragraph pairs. 22 paragraphs of ordinary length (source ≥20
  words) fell below 0.92 and were read in full: all benign, no dropped clause
  or claim. The 45 lowest-ratio paragraphs overall (mostly short lines) and the
  20 highest-ratio (expansion check for invented content) were also read in
  full: no invented content, no omission.
- **Proper-noun / epithet map, location-keyed and case-sensitive** — built
  fresh over Viola/Cesario, Orsino, Olivia, Malvolio, Sir Toby/Belch, Sir
  Andrew/Aguecheek, Maria, Feste/Clown, Sebastian, Antonio, Fabian, Curio,
  Valentine and their ALL-CAPS speaker-tag forms. Speaker-tag sets match
  exactly; no character renamed, merged or normalized; the `SIR ANDREW`/
  `AGUECHEEK` alternation is preserved in its source locations. The only
  location deltas were the Sowter and Tartar losses above, plus benign
  capitalization ("the duke"→"the Duke", Ch4 ¶2) and the legitimate
  "County's man"→"Count's man" (Ch5 ¶135).
- **Book-wide capitalized-token loss sweep** — every capitalized non-sentence-
  initial token in source checked for presence in its own candidate paragraph;
  135 hits triaged, all archaic verb forms and contractions except the Class A
  and Class B losses listed above.

## Recommended next steps for the editing owner

1. Decide the **book-wide policy** first, then apply it once: source's own
   printed proper nouns and coinages are reproduced; a clarification may be
   added beside them but never substituted for them. That single decision
   resolves A1-A4, B1-B3, C1-C5 and the four borderline items consistently.
2. Apply with `content_edit_helpers.safe_replace()` + `assert_only_changed()`
   + `validate_structure()`, per `TRANSLATION_PROTOCOL.md` step D.
3. Fix the 0-based/1-based numbering convention in all review artifacts.
4. Re-run an independent verification round. Note this book has now consumed
   2 of its 3 rounds.
