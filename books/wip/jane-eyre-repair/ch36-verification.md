# Jane Eyre Ch. 36 — Independent Verification of modern-en Repair

Reviewer: independent (did not draft the repair). Method: programmatic index-by-index
diff of the `paragraphs` arrays, plus clause-by-clause manual comparison of paragraph 48
against `ch36-source.json`, plus a continuous read of paragraphs 46–51.

Files compared:
- `/home/user/tinct/books/wip/jane-eyre-repair/ch36-source.json`
- `/home/user/tinct/books/wip/jane-eyre-repair/ch36-current-modern-en.json`
- `/home/user/tinct/books/wip/jane-eyre-repair/ch36-corrected.json`

---

## 1. Independently confirmed diff set

All three files: 80 paragraphs, `number: 36`, `title: "Chapter 36"`.

Top-level object keys outside `paragraphs` are byte-identical between current and corrected
(`number`, `title` — compared as a dict equality, `True`).

**Changed paragraph indices (0-based): `[48]` — exactly one.**

Paragraphs 0–47 and 49–79 are character-for-character identical between
`ch36-current-modern-en.json` and `ch36-corrected.json`. The drafter's scope claim is
confirmed. No paragraph merges, splits, reorders, insertions, or deletions.

Word count: source p48 = 351 words; pre-repair = 184 words (52%, below the 75% floor);
corrected = 312 words (**88.9%** of source — passes).

---

## 2. Fire geography — clause-by-clause trace

The load-bearing source clause:

> "However, on this night, she set fire first to the hangings of the room next her own,
> and then she got down to a lower storey, and made her way to the chamber that had been
> the governess's—(she was like as if she knew somehow how matters had gone on, and had a
> spite at her)—and she kindled the bed there; but there was nobody sleeping in it, fortunately."

| # | Source clause | Corrected rendering | Verdict |
|---|---|---|---|
| 1 | "on this night" | "Anyway, on this night" | ✅ |
| 2 | "she set fire **first** to the hangings **of the room next her own**" | "she set fire **first** to the hangings **in the room next to her own**" | ✅ correct room, correct ordinal |
| 3 | "and then she got **down** to a **lower storey**" | "then made her way **down** to a **lower floor**" | ✅ direction **down**, not up |
| 4 | "made her way to **the chamber that had been the governess's**" | "to **the chamber that had been the governess's**" | ✅ governess's room is the *second*, *lower* target |
| 5 | "(she was like as if she knew somehow how matters had gone on, and had a spite at her)" | "as if she somehow knew how matters stood, and had a grudge against her" | ✅ parenthetical preserved in sense |
| 6 | "and she **kindled the bed** there" | "and **set fire to the bed** there" | ✅ the *bed*, not the hangings |
| 7 | "but there was **nobody sleeping in it**, fortunately" | "But **luckily nobody was sleeping in it**." | ✅ bed is **empty** |

Pre-repair defects, each independently confirmed **eliminated** (string search over
corrected p48 returns `False` for all of them): "went up", "third floor",
"husband was sleeping", "already woken", "blazing".

So: **first** the room *next to Bertha's own* (hangings), **then down** to the
*governess's old chamber* (the bed), which was **empty**. Rochester is not placed in
either room. The geography now matches the source exactly, and the inverted
up/down and the false "husband was sleeping in the room she burned" plot corruption
are both gone.

One earlier, separate source claim is also correctly preserved and correctly kept
*separate* from the fire night: "They say she had nearly burnt her husband in his bed once:
but I don't know about that." → "They say she once nearly burned her husband in his bed—but
I don't know about that." This is reported hearsay about a *past* occasion, and the corrected
text keeps the innkeeper's disclaimer, so it cannot be misread as part of the fire sequence.
(The pre-repair text had mangled this into "set fire to the room next to her husband's bed"
and then reused the "next to her own room" fact incorrectly — that conflation is resolved.)

---

## 3. Invented rescue scene

Confirmed **absent**. The pre-repair tail —

> "But he had already woken—the whole floor was blazing. He got up and managed to save the
> servants. Then he went back for her."

— has no counterpart anywhere in source paragraph 48, and does not appear in corrected
paragraph 48 in any form. Rochester's actual rescue attempt is narrated later in the chapter
by the innkeeper (from paragraph 51 onward, prompted by "Then Mr. Rochester was at home when
the fire broke out?"), which is where it belongs. No duplication was introduced there —
paragraphs 49–79 are untouched.

---

## 4. Restored ~150 words — accuracy check

All five restored beats are present and faithful:

| Source | Corrected | Verdict |
|---|---|---|
| "The governess had run away two months before" | "The governess had run off two months before" | ✅ |
| "for all Mr. Rochester sought her as if she had been the most precious thing he had in the world, he never could hear a word of her" | "though Mr. Rochester searched for her as if she were the most precious thing he had in the world, he could never learn a word of her whereabouts" | ✅ |
| "he grew savage—quite savage on his disappointment: he never was a wild man, but he got dangerous after he lost her" | "He grew savage—truly savage—over the disappointment. He'd never been a wild man, but he turned dangerous after he lost her." | ✅ |
| "He would be alone, too." | "He wanted to be alone, too." | ✅ (sense-correct modernization of the archaic volitional "would") |
| "He sent Mrs. Fairfax, the housekeeper, away to her friends at a distance; but he did it handsomely, for he settled an annuity on her for life: and she deserved it—she was a very good woman." | "He sent Mrs. Fairfax, the housekeeper, away to live with friends at a distance—but he did it handsomely, settling an annuity on her for life, and she deserved it, being a very good woman." | ✅ annuity, for life, handsomely, and the endorsement all preserved |
| "Miss Adèle, a ward he had, was put to school." | "Miss Adèle, a ward of his, was sent off to school." | ✅ diacritic on Adèle preserved |
| "He broke off acquaintance with all the gentry, and shut himself up like a hermit at the Hall." | "He broke off with all the local gentry and shut himself up at the Hall like a hermit." | ✅ |

Also verified restored earlier in the paragraph (these had been degraded, not just cut):
- "kept a private bottle of gin **by her**" — the "by her" restored.
- "when Mrs. Poole was **fast asleep after the gin**" — pre-repair had the flatter and
  slightly wrong "passed out from the gin"; corrected matches source sense.
- "the mad lady, **who was as cunning as a witch**" — restored ("the madwoman—cunning as a
  witch"); this characterizing clause was missing entirely pre-repair.

---

## 5. Continuity read, paragraphs 47–50

- **47** (Jane): "Was it suspected that Mrs. Rochester had anything to do with it?" — sets up 48.
- **48** (innkeeper): now ends "…shut himself up at the Hall like a hermit."
- **49** (Jane): "What! He didn't leave England?"
- **50** (innkeeper): "Leave England? God, no! He wouldn't so much as cross the doorstep—except at night…"

The knock-on continuity defect flagged by the audit is **resolved**. Pre-repair, paragraph 48
ended with Rochester rescuing servants in a burning house, so paragraph 49's "He didn't leave
England?" was a non-sequitur — nothing had been said about where he went. With the hermit
sentence restored, 49 lands exactly as in the source: Jane's surprise tests whether a man in
that state of withdrawal stayed in the country, and 50 answers it directly by escalating the
same image (didn't leave England, didn't even leave the house). The 48→49→50 chain now reads
continuously and matches the source's sequence.

No change to 49 or 50 was needed, and none was made.

---

## 6. New issues introduced

**None found.** Checks run:

- JSON parses cleanly; paragraph count unchanged at 80; alignment with source preserved 1:1.
- Quote style: corrected p48 contains **zero** curly Unicode quotes (`""''`), matching the
  rest of the file (0 of 80 paragraphs use curly doubles). Typographically consistent.
- No stray markdown/underscore artifacts carried over from the source's `_italics_` markup.
- Proper nouns intact and correctly spelled: Mrs. Poole, Mr. Rochester, Mrs. Fairfax,
  Miss Adèle (with grave accent).
- No content from elsewhere in the chapter duplicated into 48.

Minor, non-blocking modernization losses inside p48 (acceptable condensation, flagged for
the record only, no action recommended):
- "nurses **and matrons**" → "nurses" (one noun of a doublet dropped).
- "after the gin **and water**" → "after the gin" (period drink detail simplified).
- Source's italic emphasis on "_she kept a private bottle of gin by her_" is not carried as
  emphasis — but this edition carries no inline markup anywhere, so it is consistent.

### Pre-existing defects outside the repair scope (NOT introduced by this pass)

Noted while reading 46–51 continuously. Both are identical in the pre-repair file, so they
are not regressions from this repair, but they are real fidelity problems in neighbouring
paragraphs and should be queued:

- **Paragraph 46** — source ends "when gentlemen of his age fall in love with girls, they are
  often like as if they were bewitched. Well, he would marry her." The modern-en substitutes
  invented material: "When he proposed to her, you can bet there were plenty of raised
  eyebrows. But he was determined, and he was the master." The "bewitched" observation is
  dropped and replaced with fabrication.
- **Paragraph 50** — source ends "I knew him from a boy, you see: and for my part, I have
  often wished that Miss Eyre had been sunk in the sea before she came to Thornfield Hall."
  The modern-en replaces this with invented text: "He was quite fond of me too—I've often
  thought more should have been done to stop him from going wrong. He was no saint. But he
  was not the devil people made him out to be either." This deletes the innkeeper's
  memorable and characterizing curse on Miss Eyre — which is pointed, because Jane is
  standing right there — and substitutes a generic sentiment. This is the same class of
  defect as the one just repaired in 48.

---

## Verdict

**READY TO ACCEPT.** The repair does exactly what it claims and nothing else: one paragraph
changed (index 48), the fire geography is now clause-for-clause correct against the 1847
source, the invented rescue scene is gone, all ~150 words of omitted content are restored and
accurate, the 48→49 continuity break is fixed, and no new error was introduced. Word count is
at 89% of source, above the 75% floor.

**Follow-up recommended (separate pass, do not block this one):** paragraphs 46 and 50 of
Chapter 36 contain pre-existing invented endings and should be repaired in a subsequent
targeted pass.
