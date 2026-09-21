# Fidelity Review 1 — Romeo and Juliet

`source.json` (locked, unmodified copy of `romeo-and-juliet-original-en.json`)
vs `candidate.json` (working draft, originally a copy of
`romeo-and-juliet-modern-en.json`).

**Indexing:** chapters 1-based as stored (chapter 1 = Prologue). Paragraphs
0-based array indices within a chapter. All references below use this
0-based paragraph indexing, called out explicitly per the task instruction.

**What was read:** every one of the 25 chapters / 1062 paragraphs, compared
paragraph-by-paragraph against source with neighboring context, in packets
of roughly one scene at a time, followed by (C) a full whole-book re-read
after fixes were applied. Not sampled.

## 0. Truncated-quote flag investigation (mechanical screening)

The mechanical gate flagged one "truncated quotation" hit:
`classify-modern-en.py`'s `is_truncation()` looks for a paragraph where the
candidate contains an ellipsis (`...`/`…`) the source paragraph lacks, and
is under 92% of the source's word count — a heuristic for "the rendering
elided a quoted passage."

Located and inspected: **ch16 p4** (Act 3 Scene 4, Capulet to Paris):

> SRC: "...and bid her, mark you me, on Wednesday next, But, soft, what day
> is this?"
> CAN (before this review): "...tell her — listen carefully — that next
> Wednesday... wait, what day is this?"

This is **not content loss**. The source itself has Capulet trail off
mid-sentence and correct himself ("But, soft, what day is this?" — he
catches himself before finishing the day he meant to name). The candidate's
ellipsis renders that same self-interruption naturally in modern English
punctuation; every clause present in the source ("bid her... on Wednesday
next" → "tell her... that next Wednesday," "what day is this?" → "wait,
what day is this?") is present in the candidate. The word-count drop below
92% is a byproduct of English words like "the" and "of" compressing plus
the elided "But, soft" interjection being folded into "wait," not dropped
content. Confirmed false positive — no fix needed. (This is the same
"flag for inspection, never proof" behavior the protocol documents for the
mechanical gate generally.)

## 1. Structure check

Both files: 25 chapters, real Act/Scene units (Prologue through Act 5 Scene
3), no apparatus/editorial/crosswalk chapters, titles are reader-facing
("Act 2, Scene 3 — Friar Lawrence's Cell" etc.). Paragraph counts match
exactly per chapter and in total (1062 paragraphs each). No empty or
whitespace-only paragraphs either side. Structure is clean — no PARK
condition here.

## 2. Register check (mandatory dedicated pass)

Built a curated list of every charged/crude/insulting/sexual word appearing
in `source.json` (whore, strumpet, harlot, wanton, bawd, bitch, slut,
tickle, maidenhead, fornicate, lecher, cuckold, pox, damn, rape, gleek,
ropery, flirt-gill, skains-mate, carrion, mistress, etc.) and read every
matching source paragraph side-by-side against the candidate. This is the
same failure class that hard-parked Merchant of Venice in this batch
(strumpet→wanton and similar) — treated as the top-priority check here.

**Defects found and fixed (register-softening of deliberately crude/bawdy
material to a milder near-synonym):**

| Loc (ch,p) | Source | Candidate (before) | Issue |
|---|---|---|---|
| (4,2) | "by my maidenhead" | "on my virtue" | Drops the Nurse's specific, comic oath (an old married Nurse swearing by a maidenhead she famously no longer has) for an abstract, non-bawdy word. |
| (10,13) | "a very good whore" (Mercutio mocking Tybalt, in a sarcastic list of fashionable "virtues") | "quite the ladies' man" | Blunt, crude insult softened to a mild, almost complimentary modern idiom. |
| (10,55) | "the bawdy hand of the dial is now upon the prick of noon" | "The hand on the clock is right at the stroke of noon." | Both deliberate bawdy puns ("bawdy," "prick") dropped entirely — this also undercuts the Nurse's very next line ("Out upon you! What a man are you?"), which is her indignant reaction to exactly this crudeness. Without the joke, her reaction reads as unmotivated. |
| (10,64) | "A bawd, a bawd, a bawd!" (Mercutio calling the Nurse a procuress) | "A matchmaker! A matchmaker!" | "Bawd" (pimp/procuress — an insult) softened to the neutral, even respectable "matchmaker." |
| (21,7) | "you have been a mouse-hunt in your time" (Lady Capulet teasing Capulet about his past womanizing) | "you were quite the night owl in your time" | "Mouse-hunt" is period slang for a nighttime chaser of women; "night owl" removes the womanizing implication the very next line depends on ("I will watch you from such watching now"). |
| (22,18) | "Flower as she was, deflowered by him" (Capulet on Juliet's death — Death as a bridegroom/deflowerer, a grim, deliberate pun) | "a flower, taken by Death" | Drops the specific word "deflowered" and its pun entirely for a generic "taken." |

All six fixed with `safe_replace` (see §5) and reverified against source
directly.

**Checked and judged NOT defects** (kept as-is; documented so a future
round doesn't re-flag them):

- (2,15) "their maidenheads" → "their virginity" — direct, accurate,
  un-softened.
- (5,13)/(8,62)/(12,5) "wanton(s)" → "people with light hearts" / "spoiled
  child's" / "wanton summer air" kept as "wanton" — these three source uses
  of "wanton" mean *playful/frivolous*, not sexual; translation is accurate
  to the sense actually in play at each location.
- (10,16) "hildings and harlots" → "hussies and harlots" — "harlots" is
  kept verbatim; not softened.
- (10,74) "flirt-gills"/"skains-mates" → "loose women"/"gang" — captures
  the sense (wanton women / disreputable companions) without whitewashing
  it; judged acceptable rendering, not euphemism.
- (7,11) "his mistress' circle" (Mercutio's magic-circle/anatomical pun) →
  "his lady's bedroom" — the specific double entendre on "circle" doesn't
  survive literal translation into intelligible modern English; the
  rendering keeps the general bawdy implication (an illicit encounter)
  rather than sanitizing it into something chaste. Reader-centered
  non-blocking judgment call, flagged here for visibility.
- Mercutio's "old hare hoar" song (ch10 p68) — the "hare"/"hoar" pun is
  built on the archaic near-homophone of "whore"; no literal English
  rendering preserves that specific pun without becoming unreadable.
  Candidate keeps the full bawdy joke about a stale prostitute in a Lenten
  pie via the surrounding sense, at the cost of the exact pun. Same class
  of acceptable, non-blocking translation loss as Merchant of Venice's
  "wether"/"ram" case in this batch — not fixed, noted for the record.

## 3. Location-keyed proper-noun / epithet occurrence map

Built a full capitalized-token frequency map over `source.json` (script:
regex over all chapters, not a sample) and cross-referenced every
classical/mythological proper noun against its occurrence(s) in
`candidate.json`, by location, not by count.

**Defects found and fixed (proper noun/named figure silently replaced by a
generic descriptor):**

| Loc (ch,p) | Source | Candidate (before) | Fix |
|---|---|---|---|
| (2,68) | "the shady curtains from **Aurora's** bed" | "the curtains of night" | Restored "Aurora's bed." |
| (7,9) | "Young **Abraham** Cupid" | "young Cupid" | Restored "Abraham" — source's own printed epithet, not "invented" or "corrected" to the common modern-edition emendation "Adam Cupid." |
| (8,23) | "they say **Jove** laughs" | "they say the gods laugh" | Restored "Jove." |
| (9,1) | "made by **Titan's** fiery wheels" | "made by the sun's fiery wheels" | Restored "Titan's." |
| (14,1) | "Towards **Phoebus'** lodging" | "toward the western horizon" | Restored "Phoebus's resting place," keeping "fiery-footed steeds" closer to source too. |
| (17,4) | "the pale reflex of **Cynthia's** brow" | "the pale reflection of the moon" | Restored "Cynthia's brow." |

All six followed the exact same pattern: a named classical figure
(goddess of dawn, an epithet for Cupid, king of the gods, the sun-titan,
the sun-god, the moon-goddess) silently replaced by its generic referent.
This is the same "proper nouns/named things replaced by generic
descriptors" defect class flagged in the batch's carried-forward lessons,
here applying to mythological allusions rather than character names.

**Checked and confirmed correctly preserved** (location-keyed, not
count-only): Capulet, Montague, Lady Capulet, Lady Montague, Tybalt,
Benvolio, Mercutio, Paris, Friar Lawrence, Friar John, Nurse/Angelica,
Balthasar, Peter, Sampson, Gregory, Abram, Prince/Escalus, Rosaline,
Petruchio, Tiberio, Susan Grindstone, Nell, Antony, Potpan, the full
guest-list names in ch3 p22 (Martino, Anselmo, Utruvio, Placentio,
Mercutio, Valentine, Capulet, Rosaline, Livia, Valentio, Tybalt, Lucio,
Helena), Lucentio, Queen Mab, Cupid (all other occurrences), Venus, Diana
(as "the goddess Diana" — an expanded, not swapped, form of "Dian"),
Echo, Phaeton (kept throughout, including in the same paragraph as the
Phoebus fix), Petrarch, Laura, Dido, Cleopatra, Helen, Hero, Thisbe, King
Cophetua, Saint Francis, Saint Peter, Simon Catling, Hugh Rebeck, James
Soundpost, Lammas(-tide/Eve), Pentecost, Verona, Mantua, Free-town,
"Capel's"/"Capels'" (an alternate period spelling of Capulet used for
meter in the source, standardized to "Capulet" in the rendering — same
family, not a swap to a different name; judged acceptable, not an erasure).
No swapped speaker-tag/all-caps forms found (checked case-sensitively; all
speaker tags in the candidate match the source's character list).

## 4. Rare-word / capitalized-token cross-reference sweep

Cross-referenced every low-frequency capitalized token from the source
frequency map (see script output) against the candidate for survival —
this is what surfaced the deities above, plus confirmed the following
distinctive source vocabulary survives intact somewhere in the
corresponding candidate paragraph: "star-cross'd," "plantain leaf,"
"washing blow," "hazel eyes," "cheveril," "passado," "alla stoccata,"
"punto reverso," "King of Cats," "fee simple," "wild-goose chase,"
"single-soled," "green-sickness," "hurdle," "aqua vitae," "osier cage,"
"mattock," "apothecary," "dram," "ducats." No silent drops found among
these beyond the deity names already listed above.

## 5. Nurse voice/digression check (complete, all speaking turns)

Identified every NURSE-tagged paragraph across the whole book (not
sampled) and read each against its source counterpart for:
(a) complete preservation of her garrulous, digressive, self-interrupting
style, and (b) no tightening into efficient modern prose.

Checked in full: ch4 (her age-of-Susan/earthquake/weaning digression,
p2/p12/p14 — the long "wormwood on my dug"/"Wilt thou not, Jule?" story is
kept at full length and full digressiveness, including the "God rest all
Christian souls," "Nay, I do bear a brain," and repeated "Wilt thou not,
Jule?" callback); ch6 (p41/p43); ch10 (p45–96, her entire exchange with
Mercutio/Romeo/Peter including "God ye good-den," her indignation at
Mercutio's "ropery," and her rambling rosemary/Romeo aside); ch11 (her
whole "I am aweary"/aches-and-pains stalling routine before delivering
Romeo's message, p7–p21 — every complaint kept: bones, head, back); ch14
(her breathless "he's dead, he's dead, he's dead" and Tybalt lament,
p7–p25); ch15 (p33–45, her "just in her case" repetition and "Blubbering
and weeping, weeping and blubbering" doubling kept); ch16 (her "you are to
blame" rebuke, p56–58); ch17 (p69–71, her Paris-praising speech); ch19
(p10/p13); ch21 (p5/p7 — the "cot-quean"/"mouse-hunt" exchange, register
fix above); ch22 (her long opening "Mistress! What, mistress!" wake-up
monologue, p1, and her grief cries, p10/p13/p21/p29).

No instances found of her digressions being trimmed, her repetitions
collapsed, or her rambling structure reorganized into tighter prose. Her
voice is preserved end to end, not just in a sample.

## 6. Result after fixes (rounds B/C)

12 total paragraph edits applied (6 mythological-allusion erasures + 6
register-softenings), all via `content_edit_helpers.safe_replace()`, each
verified individually:

- `assert_only_changed`-equivalent check confirmed, per fix, that exactly
  the intended paragraph changed and nothing else.
- Every fixed paragraph re-read against `source.json` directly after the
  edit (not trusting the edit's own description) — see §2/§3 tables above,
  which show source/candidate side by side post-fix.
- `validate_structure`-equivalent check re-run after edits: 25 chapters,
  1062 paragraphs, counts match source exactly, no empty paragraphs, JSON
  valid.
- Whole-book re-read (step C) performed after fixes, over the full final
  `candidate.json`, specifically re-checking: (i) the register-check word
  list once more end to end for any remaining instance of the softening
  pattern, (ii) the mythological/proper-noun map once more end to end, and
  (iii) general continuity around each of the 12 edited paragraphs with
  one paragraph of context on each side. No further instances of either
  defect class found, and no new defects introduced by the fixes
  themselves.

## Verdict

Two real, book-wide defect classes found and fixed: mythological
proper-noun erasure (6 instances) and register-softening of deliberately
crude/bawdy language (6 instances, one of which — the "bawdy"/"prick" pun
at ch10 p55 — also undercut a downstream character reaction). No further
instances found on the post-fix whole-book re-read. No structural defects,
no truncation (the one mechanical flag was a false positive from a
faithfully-rendered mid-sentence self-interruption), no meaning reversals,
no malapropism erasure (none of this play's roles carry a malapropism
dialect the way the Nurse-equivalent role did in Merry Wives), full,
complete-turn preservation of the Nurse's voice.
