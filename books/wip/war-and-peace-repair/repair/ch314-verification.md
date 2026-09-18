Model: opus

# Chapter 314 — Book Fourteen (1812), Chapter 16 — independent verification

Verifier did not draft, review or correct this chapter. Files compared:
`ch314-candidate.json` (pre-correction), `ch314-corrected.json`, `ch314-corrections-log.md`,
`ch314-source.json` (Maude). Paragraph indices below are 0-based, matching the review and the log.

## 1. Diff vs log

Paragraphs that actually differ between candidate and corrected (computed by string comparison,
not read off the log): **0, 1, 2, 3, 5**. Unchanged: 4.

Paragraphs with a log entry: **0, 1, 2, 3, 5**.

- Logged but not changed: none.
- Changed but not logged: none.
- Every log entry's `Before:` string is byte-identical to the corresponding candidate paragraph, and
  every `After:` string is byte-identical to the corresponding corrected paragraph (5/5).

No mismatch.

## 2. Per-change verdicts (re-derived from the source, not from the log)

| ¶ | Change | Source warrant | Verdict |
|---|---|---|---|
| 0 | "burned themselves alive at campfires" → "roasted themselves to death at campfires" | "with men freezing, or roasting themselves to death at the campfires" | Correct. The source's men scorch themselves trying to get warm; the deliberate-self-immolation reading is gone, and no new claim is added. |
| 1 | "the terms of the progression" → "the succeeding terms of the progression"; "the cold's intensity" → "the greater or lesser intensity of the cold" | "the succeeding terms of the progression could be determined mathematically"; "independently of the greater or lesser intensity of the cold" | Both correct. "Succeeding" restores the point that later terms follow from the first; the degree-range is back. "Calculated" for "determined" is unflagged and carries the same claim. |
| 2 | "wander off in every direction" → "wander off by themselves in different directions"; "they all look" → "they look"; "Your Majesty's interests require" → "the interest of Your Majesty's service demands"; "noncombatants—" → "ineffectives, such as"; "died recently … at camp" → "died these last days … at the bivouacs"; "growing worse every day" → "continually growing worse" | "the others go off by themselves in different directions"; "In general they regard Smolénsk…"; "the interest of Your Majesty's service demands"; "freed from ineffectives, such as dismounted cavalry, unnecessary baggage, and artillery material…"; "Many have died these last days on the road or at the bivouacs. This state of things is continually becoming worse" | **MODERATE cleared.** "Ineffectives" now heads a list whose three items (dismounted cavalry, baggage, artillery equipment) all fit it, and "such as" restores the list as exemplary. The five MINOR restores are each exact and reverse the drift that was sharpening Berthier's dispatch. Register is again that of a formal staff document, matching the narration that frames it. |
| 3 | "Written twenty miles from Smolensk, November 9." → "November 9: twenty miles from Smolensk." | "November 9: twenty miles from Smolénsk." | Correct, and exactly the editor's ruling: dateline form restored, source order (date then place) restored, accent stripped per CONVENTIONS.md §Diacritics. Date, distance and place all intact. |
| 5 | "that supposed genius" → "that genius"; "But he and those around him still clung to" → "But still he and those about him retained"; "Highnesses, and Cousins" → "or Cousins"; "they all knew … great evil" → "they all felt … much evil"; "+ and save himself" | "Still less did that genius, Napoleon, know it"; "But still he and those about him retained their old habits"; "they entitled one another Majesties, Highnesses, or Cousins"; "they all felt that they were miserable wretches who had done much evil"; "each was thinking only of himself and of how to get away quickly and save himself" | **All three MODERATEs cleared.** The irony is back in the bare epithet, "felt" no longer raised to knowledge, and the closing beat again carries both aims. The three MINORs ("or", "much evil", "retained") are exact restores. No new drift. |

No correction introduced a new claim, dropped a claim, or sharpened one.

## 3. New reader pass

Read end to end as a first-time reader. The chapter's shape — narration (¶0–1) → Berthier's dispatch
(¶2–3) → narration (¶4–5) — is now legible precisely because the dispatch sounds like a dispatch
again. "Ineffectives" is the one word a modern reader may pause on, but "such as dismounted cavalry,
unnecessary baggage, and artillery equipment" defines it in the same sentence, so nothing is opaque.
¶3 as a bare dateline reads correctly as the letter's sign-off rather than as narration. The
arithmetic of ¶1 (seventy-three thousand → thirty-six thousand, five thousand fallen) is followable.
No paragraph is harder to read than the pre-correction candidate.

## 4. Structure and punctuation

- Paragraph count: source 6, candidate 6, corrected 6. Order unchanged; no empty paragraphs.
- `number` 314 and title "Book Fourteen (1812) — Chapter 16" identical across source, candidate and corrected.
- Question marks: zero in source and zero in corrected, all 6 paragraphs. Exclamation marks: zero and zero, all 6.
- No punctuation counts changed between candidate and corrected.
- Word count never falls below 0.94 of the source paragraph (chapter mean 0.98); ¶3 is 6 words in both.

## 5. New findings

- **¶0, MINOR (carried, logged).** "the essential nature of the flight … continued as before" still stands for
  "the process … went on essentially as before". Correctly logged as deliberately not applied: the fix is a
  restructure rather than a local restore, so leaving it avoids new drift. Acceptable; may be revisited.
- **¶5, MINOR (carried, logged).** The French titles ("Sire," "Mon Cousin," "Prince of Eckmuhl," "King of Naples")
  carry no "(in French)" cue and "mon cousin" is untranslated among translated neighbours. Per the editor's
  ruling this belongs to the separate scripted French pass across ~180 passages (CONVENTIONS.md §French), not
  to a per-chapter fix. Correctly left untouched; **out of scope for this verdict**.
- **¶2, cosmetic.** "artillery equipment no longer proportionate to **our** present forces" for the source's
  "the present forces" is inherited from the candidate and was not flagged; the first person suits a dispatch
  from an officer inside the army and adds no claim. No action.
- No MAJOR finding was raised for this chapter; both MODERATE rows (¶2 "ineffectives", ¶5 across three rows)
  are fully answered. No MAJOR or MODERATE finding from `ch314-fidelity.md` remains outstanding.

Verification: ACCEPT
sha256: cc8fa6798f17d718cb1b466fdb668844accecab145f95a517fdffbcccebcb067
