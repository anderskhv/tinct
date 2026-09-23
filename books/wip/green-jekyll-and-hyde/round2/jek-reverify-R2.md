# Jekyll and Hyde modern-en: R2 re-verification (independent)

## Verdict: DEFECTS FOUND (1 minor, non-blocking; everything else is clean)

## (1) Diff: BEFORE (jek-R1) vs AFTER (jek-R2)
- 52 paragraphs changed. That set matches `jekyll-and-hyde-changed-R2.txt` exactly (no extra or missing paragraphs).
- 73 edits in total across fid2-a/b/c-final, jek-room and jek-acc-final. Each file's edits were replayed in order on BEFORE. Every replayed paragraph came out identical to AFTER. No change appears that is not a listed edit.
- One edit pair cancels out. fid2-a changes 5.0 "the doctor’s private study" to "the doctor’s cabinet—his private study", and jek-room changes it back. Net result: 5.0 is unchanged, correctly left off the changed list, and reads "the doctor’s private study", which matches the room convention.

## (2) Reading each changed paragraph against the source
All 52 changed paragraphs were read in full against their source paragraphs, with one neighbouring paragraph on each side.
- **Actors, negation, causality, hedges, omissions and additions:** no errors introduced.
- **Improvements confirmed:**
  - 4.0: removes the false "such … that" cause and restores "notable" and "well-founded self-content".
  - 7.3: "do one without the other".
  - 7.6: restores the repeated "Jekyll! Jekyll!".
  - 8.87: "dead wrongdoer" for "malefactor".
  - 10.8: "old age". Note that 10.16 has "ageing".
  - 10.18: "avenger", and the swarm now has the right subject and object.
  - 10.24: "looked back", past tense as in the source.
  - 10.0: "As profound a double-dealer as I was".
  - 2.0: the will's two conditions are now split for reading aloud, with both conditions and the "burthen" clause kept.
- **Voice:**
  - 4.14: the inspector's "He don’t" is kept.
  - 8.4: Poole's "may I die if I like it" is faithful.
  - 8.52 and 8.89: "got" / "got rid of" are British and in period.
- **Deliberate ambiguity:** 2.12 "his friend’s strange preference for Hyde—or his bondage to him, call it which you please" keeps the either/or open.

### Defect (minor, aloud/flow, introduced by an edit)
- **10.23** (fid2-c edit "mailed" → "sent"): the sentence now reads "…so as to have real proof that they had been sent, had them sent by registered post." "Sent … sent" is a clumsy echo when read aloud. The source says "that he might receive actual evidence of their being posted, sent them out with directions that they should be registered." Suggested fix: change "real proof that they had been sent" to "real proof that they had been posted" (British, and matches the source). Other British options: "had them registered at the post office" or "had them posted by registered post".

## (3) Book-wide consistency
- **Room convention: clean.** Every source paragraph that uses "cabinet" for the room (5.0, 5.20, 6.12, 8.x, 9.3, 9.4, 9.9, 10.6, 10.13, 10.16, 10.22, 10.25) now says "study". "Cabinet(s)" in AFTER appears only for furniture:
  - 2.39 and 2.40: oak cabinets.
  - 5.0: glass cabinets.
  - 8.71: glass-fronted cabinets.
  - 8.83: glazed fronts of the cabinets.
  - 9.3: glass-fronted cabinet (letter E).
  - 9.9: the cabinet marked E.

  10.22 renders "presses" as "cupboards". That is acceptable as furniture, though it differs from the "glass-fronted cabinet" used in 9.3.
- **Spelling: British throughout.** No remaining -or, -ize/-yze, -er (centre-type), gotten, gray, checkbook, -eled or cozy forms. The -ed forms "burned", "learned" and "dreamed" are acceptable in British English, and the source uses them too.
  - Advisory only: "toward" appears 10 times and "towards" never, although the source uses "towards" 3 times, including 10.8 "growing towards the elderly man". Both forms are British-acceptable. But fid2-a changed "afterward" to "afterwards" for house style, so "towards" would be the consistent choice. Not a spelling error.
- **Quotation marks:** all curly; no straight quotes anywhere. The unbalanced opening quotes in 8.92–9.7 follow the multi-paragraph letter convention and are unchanged.

## (4) Structure of AFTER
- The JSON is valid.
- There are 10 chapters, numbered 1–10.
- Paragraph counts per chapter match the source: 28 / 50 / 17 / 18 / 38 / 13 / 14 / 99 / 34 / 28.
- All titles are identical to BEFORE and to the source.
- There are no empty paragraphs and no leading or trailing whitespace.

---

# R3 re-verification (jek-R3-cand.json vs jek-R2.json)

## Verdict: VERIFIED CLEAN

- **Diff:** exactly 10 paragraphs changed: 1.0, 2.2, 2.36, 8.22, 9.22, 10.0, 10.7, 10.8, 10.17, 10.23. That set is the same as the paragraphs named in jek-R3.json. All 11 edits were replayed on R2: each "old" string occurs exactly once, and every replayed paragraph matches R3 exactly. There are no other changes.
- **10.23 against the source:** it now reads "so as to have real proof that they had been posted, had them sent by registered post". This is faithful to the source ("that he might receive actual evidence of their being posted, sent them out with directions that they should be registered"), and the "sent … sent" echo is gone. The rest of the paragraph is unchanged and still faithful.
- **toward/towards:** 0 "toward" and 10 "towards". Each of the 10 changes swaps that one word only, and each sentence still reads correctly.
- **Structure:** the JSON is valid. There are 10 chapters, and each chapter's paragraph count matches the source (28/50/17/18/38/13/14/99/34/28). Titles are unchanged. There are no empty paragraphs and no straight quotes.
- **Spelling:** British throughout. A re-scan found no American forms. The only hits were false positives: forgotten, misbegotten, laboratory, raging and seized.
