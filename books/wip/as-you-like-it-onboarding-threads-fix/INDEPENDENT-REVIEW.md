# Independent Review — As You Like It onboarding/threads fix

Reviewer: independent pass, done before reading the candidate's own
`RELEASE-PACKET.md`. Findings below were derived directly from:
- the candidate files in `books/wip/as-you-like-it-onboarding-threads-fix/`
- the live pre-fix files (`app/public/data/editions/as-you-like-it-threads.json`,
  `app/public/data/onboarding/as-you-like-it.json`/`.da.json`)
- the accepted 23-chapter structure
  (`books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-modern-en.json`,
  `.../as-you-like-it-modern-da-repair/editions/as-you-like-it-modern-da.json`)
- the old→new chapter correspondence table in
  `books/wip/as-you-like-it-completeness-repair/RELEASE-PACKET.md`

## Verdict: DO NOT ACCEPT (as-is)

The threads file has **two concrete chapter misplacements** for real story
content (not judgment-call ambiguities — I read the actual scene text at
both the assigned key and the correct key in each case). The onboarding
files are correct. JSON is valid in all three files. Structural checks
(no drops, no duplicates, no out-of-range keys) pass.

## 1. Chapter-by-chapter placement check

Old→new correspondence used (from the completeness-repair packet):
non-split old chapters map 1:1 (old*n* → new *n*+1, with a +1 offset that
grows by one at each split point); the five split old chapters are
old 2 → {3, 4}, old 8 → {10, 11}, old 12 → {15, 16}, old 14 → {18, 19},
old 17 → {22, 23}.

I read the full paragraph text of every new-chapter candidate a split
entry could plausibly belong to (not just one half), plus the two
non-split chapters that turned out to be wrong below.

**Rosalind** (8 entries, keys 2,3,7,12,14,15,18,22) — all correct.
- old2→**3**: the banishment/Aliena-naming scene is entirely in new
  Act 1 Scene 3 (new3), confirmed by matching final lines ("to liberty,
  and not to banishment"). Correct, not new4 (which is Duke
  Senior's forest court + the deer-weeping report — no Rosalind at all).
- old12→**15**: the Silvius/Phebe scolding is entirely inside Act 3 Scene 5
  (new15, all 27 paragraphs of old12's first half); new16 (Act 4 Scene 1,
  84 paragraphs) is a different encounter (Jaques flirts with "Ganymede,"
  the mock-wooing continues) with no Phebe. Correct.
- old14→**18**: "no sign of Orlando... past two o'clock" opens new18
  verbatim-adjacent to the entry's description; new19 (Act 5 Scene 1) is
  the Touchstone/Audrey/William scene, no Rosalind fainting. Correct.
- old17→**22**: the wedding/reveal action is new22 (Act 5 Scene 4);
  correct primary placement. See §3 below on the epilogue line inside
  this entry's text.
- 2, 7, 12, 14 (non-split) verified against their new-chapter text and
  match.

**Orlando** (8 entries, keys 2,6,9,10,12,18,20,22) — **one entry
misplaced.**
- **Key "9" is wrong.** Its text — "Desperate for food, Orlando bursts
  in on Duke Senior's forest feast with his sword drawn. The Duke
  welcomes him graciously. Orlando fetches the starving Adam and joins
  the Duke's company" — describes events that happen entirely in **new
  chapter 10** (Act 2 Scene 7: "Enter ORLANDO with his sword drawn" ...
  "Sit down and eat, and welcome to our table" ... "Re-enter ORLANDO with
  ADAM" ... "Welcome... let him eat"). New chapter 9 (Act 2 Scene 6) is
  only 4 paragraphs total — just Adam collapsing from hunger and Orlando
  comforting him ("Dear master, I can't go any further... I'll lie down
  here and mark out my grave" / "Why, what's this, Adam!"). There is no
  feast, no sword, no Duke Senior dialogue anywhere in new9.
  - This is a pre-existing bug, not one introduced by this fix: the live
    pre-fix file already had this exact text at old key "7" (which is a
    non-split, 1:1-mapped old chapter, i.e. one of the "12 straightforward
    substitutions" the fix package treated as safe). old chapter 7 is
    only 4 paragraphs (matches new9's 4), so the content was already
    keyed to the wrong old chapter before this repair ever touched the
    book. The fix's key-substitution approach (old+2 shift) faithfully
    carried the pre-existing error forward into new9 instead of catching
    it, even though this chapter wasn't one of the five flagged
    "needs judgment" splits.
  - Net effect: Orlando now has two entries (keys 9 and 10) that both
    describe material from new chapter 10, and no entry at all for new
    chapter 9's actual content (Adam's collapse).
- 2, 6, 12, 18, 20, 22 verified correct.

**Jaques** (5 entries, keys 8,10,12,13,22) — **one entry misplaced.**
- **Key "8" is wrong.** Its text — "Reported to have been found weeping
  over a wounded deer, moralizing on the cruelty of hunters — to the
  amusement of the other lords" — is the First/Second Lord's report to
  Duke Senior in **new chapter 4** (Act 2 Scene 1): "the melancholy
  Jaques grieves at that... First, about the deer's weeping into the
  needless stream..." / "We did, my lord—weeping and commenting upon the
  sobbing deer." New chapter 8 (Act 2 Scene 5) is the "Under the
  greenwood tree" song scene ("I can suck melancholy out of a song the
  way a weasel sucks eggs") — no deer, no hunting, no lords reporting
  anything.
  - Same class of pre-existing bug as Orlando's: the live pre-fix file
    already had this text at old key "6" (a non-split, 1:1 old chapter),
    and the straightforward key substitution (old6→new8) carried the
    mismatch forward unchanged.
  - Net effect: new chapter 4 currently has zero thread coverage from any
    character, even though it contains a distinct, quotable character
    beat for Jaques (via the Lords' report) that the pre-fix file did
    once intend to capture, just under the wrong chapter number both
    before and after this fix.
- 10, 12, 13, 22 verified correct (10: Jaques recounting his "I met a
  fool in the forest" story to Duke Senior and delivering "All the
  world's a stage," both in new10; 12: Act 3 Scene 2 mockery of Orlando's
  poems; 13: Act 3 Scene 3 commentary on Touchstone/Audrey; 22: Jaques's
  exit line, "I have no wish to watch the festivities... He exits," is
  literally in new22).

**Celia** (4 entries, keys 2,3,12,20) — all correct, verified against
new2/new3/new12/new20 text.

**Touchstone** (5 entries, keys 7,10,13,19,22) — all correct, verified
against new7/new10/new13/new19/new22 text, including the old8 split
(new10, where Jaques recounts meeting Touchstone, vs. new11, which is a
Frederick/Oliver scene with no Touchstone or Jaques at all).

## 2. Drops / duplicates / out-of-range keys

No drops, no duplicates, no out-of-range keys. Per-character entry counts
are unchanged from the pre-fix file (Rosalind 8, Orlando 8, Jaques 5,
Celia 4, Touchstone 5), and every key falls within 2–22 (valid range is
1–23).

## 3. Chapter 23 (Epilogue) coverage

New chapter 23 is the 4-paragraph Epilogue, spoken solely by Rosalind
directly to the audience, with no other character present. No thread
entry — from any character — has key "23".

Assessment: this is **substantially a genuine pre-existing gap**, not
something the fix negligently omitted. Under the old 17-chapter
structure, the Epilogue was the tail end of old chapter 17 (which also
contained the whole wedding/reveal scene now split into new22), and
Rosalind's old-key-17 entry already folded a mention of delivering the
epilogue into its description of the finale ("...Appears as herself,
removes the disguise, and all four couples are married. Delivers the
epilogue directly to the audience.") rather than treating it as separate
coverage. The fix preserved that same combined entry, now keyed to new22,
without adding a duplicate/split entry at new23.

That said, this is a borderline call, not a clean pass: now that the
Epilogue is its own numbered chapter (a direct consequence of the
completeness repair this package is downstream of), the existing
Rosalind-at-22 entry describes an event that textually happens in
chapter 23, not 22. A stricter fix would have either (a) added a short
Rosalind entry at key 23 for the epilogue itself, or (b) trimmed the
"Delivers the epilogue directly to the audience" clause out of the
new22 entry so entries don't reference content one chapter away from
their key. I don't consider this alone disqualifying, but it should be
addressed before/alongside the two placement bugs above.

## 4. Additional observation (not in the original scope, flagged anyway)

New chapter 1 (Act 1 Scene 1, "Oliver's orchard") is **entirely restored
content that did not exist under the old 17-chapter numbering at all**
(per the completeness-repair packet). It contains real, substantial
Orlando (and Oliver) character material — the argument about Orlando's
upbringing, and Oliver's scheme with Charles the wrestler against
Orlando's life, which the existing Rosalind/Orlando entries at chapter 2
already presuppose ("despite his brother Oliver's scheme to have him
killed"). No character has a thread entry at chapter 1. This is outside
the letter of the assigned re-keying task (which is about relocating
*existing* entries, not authoring new ones for genuinely new content),
so I'm not counting it against the verdict, but it's a real coverage gap
symmetrical to the chapter 23 question in §3, and worth a follow-up item.

## 5. Onboarding metadata check

**English** (`onboarding/as-you-like-it.json`):
- `openingChapterLabel`: `"Act I, Scene I — Oliver's orchard"` — matches
  chapter 1's first paragraph in the accepted `modern-en` candidate
  exactly (`"Oliver's orchard"`). Correct.
- `openingText`: exact, verbatim quote of chapter 1's third paragraph
  (Orlando's opening speech), truncated at a natural sentence boundary
  ("...and that's where my unhappiness begins."), not paraphrased. Length
  (~40 words) is comparable to the old (now-superseded) excerpt's length
  (~45 words, also cut at a sentence boundary). Correct.

**Danish** (`onboarding/as-you-like-it.da.json`):
- `openingChapterLabel`: `"Akt I, Scene I — Frugthave ved Olivers hus"` —
  matches chapter 1's first paragraph in the accepted `modern-da`
  candidate (`"Frugthave ved OLIVERS hus"`, normalized from the
  all-caps character-name convention to title case, consistent with how
  the old label normalized `"Hertugens"` the same way). Correct.
- `openingText`: exact, verbatim quote of the same Orlando paragraph in
  Danish, cut at the same sense-boundary as the English version ("...og
  deri begynder min sorg."). Correct, and appropriately parallel to the
  English excerpt's length and cut point.

Both onboarding files pass all checks in item 4 of the task with no
defects found.

## 6. JSON validity

All three files parse as valid JSON:
- `threads/as-you-like-it-threads.json`
- `onboarding/as-you-like-it.json`
- `onboarding/as-you-like-it.da.json`

## Comparison with the candidate's own RELEASE-PACKET.md

Read only after forming the findings above. The candidate's packet's
split-chapter table (old 2/8/12/14/17) matches my independent
re-derivation exactly, and its assessment of the chapter-23 Epilogue gap
(§3 above) matches mine — genuine pre-existing gap, correctly not
silently filled, correctly flagged for a follow-up decision.

However, the packet treats old chapters 6 and 7 (Jaques's deer report,
Orlando's feast entry) as two of the "12 straightforward 1:1
substitutions" needing no content verification, and its own "What
independent review should check" list only asks the reviewer to
re-verify the 5 *split* chapters (item 1) — not the 12 non-split ones.
That is exactly where the two real bugs in §1 above were: pre-existing
mis-keyings in the *old* file that happened to survive under old
chapter numbers whose 17-chapter boundaries didn't line up with the
content, and which a pure key-shift (not a content read) could not catch.
The packet's own method section does not mention reading new4, new8,
new9, or new10 content to confirm the non-split entries, which is
consistent with these two errors being missed rather than deliberately
accepted.

## Summary of required fixes before acceptance

1. Move Orlando's chapter-9 entry to chapter 10 (and either drop or merge
   with the existing chapter-10 entry, since both now describe the same
   Act 2 Scene 7 material); chapter 9 currently has no correct entry for
   its actual content (Adam's collapse).
2. Move Jaques's chapter-8 entry to chapter 4; chapter 8 currently has no
   entry (correctly — Jaques has no chapter-8-specific action beyond the
   greenwood-tree song, which none of the 5 tracked characters' entries
   need to additionally cover).
3. Decide and apply one of: split the Rosalind chapter-22 entry so
   chapter 23 gets its own (short) epilogue entry, or trim the epilogue
   clause out of the chapter-22 entry so it doesn't describe chapter-23
   content under a chapter-22 key.
