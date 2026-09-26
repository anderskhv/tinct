# Independent Fidelity/Completeness Review — As You Like It Repair

Reviewer: independent Claude session (not the author of the candidate).
Scope: `books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-original-en.json` and `.../as-you-like-it-modern-en.json`, checked against the source etext and the live served editions. Danish (modern-da) is out of scope.

## 1. Source verification

Downloaded `https://archive.org/download/1ws2510/1ws2510.txt`.

```
sha256sum 1ws2510.txt
b30b9db29fe670195ccb182bdeabddefb5af705fb985ba40c485dc2defb6f39a  1ws2510.txt
```

Matches the sha256 given in the task exactly. As You Like It runs from `ACT I. SCENE I.` (source line 547) to the "End of this Etext..." line (source line ~7580); "THE END" (the play's own closing marker) is at line 7539 (approx.), before the final World Library notice.

## 2. Act 1, Scene 1 — independent boundary check

Independently identified boundaries: from `ACT I. SCENE I.` / `Orchard of OLIVER'S house` through Oliver's closing line ending "...Nothing remains but that I kindle the boy thither, which now I'll go about. Exit" — 47 source dialogue/direction units, ~1,497 words including the heading tokens (~1,493 words of running text, matching the audit's estimate).

**Result: candidate chapter 1 ("Act 1, Scene 1") is a verbatim, complete, correctly-attributed transcription of this passage.**

- Line-by-line diff (both plain-text and tokenized) against the source shows **zero missing or added words** and **zero speaker misattributions**. The only differences found are typographic: the candidate uses curly apostrophes (`’`) where the source etext uses straight apostrophes (`'`) — e.g. `OLIVER'S` → `OLIVER’S`, `say'st` → `say’st`, `hir'd` → `hir’d`. This is a consistent, cosmetic quote-style normalization, not a content change, and (per spot checks below) is the same convention used throughout the rest of the file, old and new material alike.
- The known transcription defect in the source itself — `OLIVER. not Charles, the Duke's wrestler, here to speak with me?` (missing the expected leading "Is") — **is preserved verbatim** in the candidate as `OLIVER. not Charles, the Duke’s wrestler, here to speak with me?` (paragraph 31, "Act 1, Scene 1"). The candidate did not silently "fix" it. This is correct behavior.
- All stage directions (`Enter ORLANDO and ADAM`, `Enter OLIVER`, `[ADAM retires]`, `[Strikes him]`, `Exeunt ORLANDO and ADAM`, `Enter DENNIS`, `Enter CHARLES`, `Exit` / `Exit DENNIS`) are present, correctly placed, and correctly attributed as their own paragraphs.
- Speaker labels (ORLANDO, ADAM, OLIVER, DENNIS, CHARLES) match the source in every one of the 47 paragraphs.

## 3. Full scene-structure re-derivation

Independently re-scanned the entire source for every `ACT`/`SCENE` heading. Correct structure (22 scenes + Epilogue):

- Act 1: Scenes I, II, III (3)
- Act 2: Scenes I–VII (7)
- Act 3: Scenes I–V (5)
- Act 4: Scenes I–III (3)
- Act 5: Scenes I–IV (4), plus a separately-headed `EPILOGUE` (not a numbered scene) after Act 5 Scene IV

Total: 22 scenes + 1 Epilogue = **23 chapters**, in this exact order.

**Result: the candidate's chapter list matches this exactly** — 23 chapters, titled `Act 1, Scene 1` through `Act 5, Scene 4` in strict act/scene order, followed by `Epilogue`, with `number` fields sequential 1–23 and `section` fields correctly set to `Act N` for each (`Epilogue` has no section, consistent with it not being a numbered scene). No chapter is mislabeled, no scene is still merged with another, no scene is incorrectly split, and chapter ordering is correct throughout.

I additionally verified the four splice points where the audit says a Scene 1 was previously merged into the tail of the preceding chapter (Act 2 Sc.1 after Act 1 Sc.3; Act 3 Sc.1 after Act 2 Sc.7; Act 4 Sc.1 after Act 3 Sc.5; Act 5 Sc.1 after Act 4 Sc.3). In every case the candidate's last paragraph of the earlier chapter and first paragraph(s) of the new chapter match the source exactly at the boundary, with no dialogue duplicated or dropped across the split (see boundary defect noted in §5, however — the scene's short location caption did not survive the split).

## 4. World Library notice removal

All four occurrences of the `<<THIS ELECTRONIC VERSION OF THE COMPLETE WORKS OF WILLIAM SHAKESPEARE IS COPYRIGHT 1990-1993 BY WORLD LIBRARY, INC. ...>>` notice, and the trailing `End of this Etext of The Complete Works of William Shakespeare / As You Like It` line, are **fully absent** from the candidate (confirmed by scanning every paragraph of `as-you-like-it-original-en.json` for `WORLD LIBRARY`, `ELECTRONIC VERSION`, and `Etext` — no hits).

All four notices in the source sit cleanly between scenes (end of Act 1 Sc.3 / start of Act 2 Sc.1; end of Act 3 Sc.5 / start of Act 4 Sc.1; end of Act 4 Sc.3 / start of Act 5 Sc.1; end of the play after "THE END"), never mid-dialogue. Checking the Shakespeare text immediately before and after each of the four notice sites against the candidate confirms **nothing adjacent was corrupted or dropped when the notices were excised** — the preceding scene's final line (e.g. Celia's "...To liberty, and not to banishment. Exeunt", Rosalind's "...Will you go? Exeunt", Duke Senior's dance-scene close) and the following scene's opening material are both intact. (The candidate does keep the etext's own `THE END` marker as the final paragraph of the Epilogue chapter; this is legitimate source text — it precedes the notice, is not part of the notice, and is a harmless closing marker rather than Shakespeare's own words, so keeping or dropping it is an editorial choice, not a completeness defect.)

## 5. Defects found on a full independent re-scan

I ran a full independent word-level diff (difflib SequenceMatcher over a cleaned, tokenized version of the whole play) between the source and every one of the candidate's 23 chapters, not just the four known defect sites. Findings:

| # | Location | Defect | Severity | Introduced by this candidate? |
|---|---|---|---|---|
| 1 | Act 2, Scene 1 / Act 3, Scene 1 / Act 4, Scene 1 / Act 5, Scene 1 — each chapter's **first paragraph** | The scene's location/setting caption line, present in the source immediately after the `SCENE` heading and before the `Enter...` stage direction, is **missing** from the candidate. Specifically: `The Forest of Arden` (before 2.1), `The palace` (before 3.1), `The forest` (before 4.1), `The forest` (before 5.1). Every other scene in the candidate (including 1.1, whose caption `Orchard of OLIVER'S house` is present) correctly retains its caption as paragraph 0. This is exactly the class of thing the split-repair needed to carry over and did not, in these four specific chapters — the ones that had to be freshly separated out from the end of the preceding chapter. | Minor but real completeness defect (dropped source content, 4 occurrences) | Yes — plausible that this text simply never made it into the new chapter when it was split out of the old merged chapter. |
| 2 | Act 3, Scene 2, paragraph 39 | Rosalind's line reads `O most gentle Jupiter!` in the candidate, but the source (this specific 1990s etext) reads `O most gentle pulpiter!` — a distinct, deliberate Shakespearean coinage (a pun on "pulpit" + "-er"), not an OCR error. This is a real deviation from the specified source text. | Note only — **pre-existing**, not introduced by this candidate | **No** — verified this exact substitution ("Jupiter") is already present in the currently-served `app/public/data/editions/as-you-like-it-original-en.json`. It predates this repair and the candidate simply carried it through unchanged, which is consistent with the repair's stated scope (structure/notices, not word-level proofreading). Flagged per the task's "re-scan the ENTIRE candidate" instruction, but should not count against this candidate specifically. |
| 3 | Act 1, Scene 3 ("follow the" vs "follow thee"); Act 2, Scene 3 and Act 2, Scene 6 ("the" vs "thee"); Act 2, Scene 4 ("chopt" vs "chapt"); Act 2, Scene 7 and Act 3, Scene 5 ("arn" vs "am"); Act 1, Scene 2 (missing "is" in "if you swear by that that [is] not") | Several other small word-level deviations from the raw 1990s-etext source (mostly the etext's own apparent OCR typos silently normalized to modern-sensible readings). | Note only — **pre-existing** | **No** — spot-checked each against the currently-served original-en.json; all are already present there in the same (deviating) form. Not something this candidate touched, for better or worse. |

No other completeness defects (missing text, extra text, wrong order, wrong speaker) were found anywhere else in the 23 chapters. Per-scene word counts (tokenized, source vs. candidate) track within a small constant offset explained entirely by heading/caption tokens in every case except the four caption-loss instances above, which is consistent with there being no larger blocks of dropped or duplicated dialogue anywhere in the play.

## 6. Modern-en structural and quality check

**Structural match:** confirmed all 23 chapters in `as-you-like-it-modern-en.json` have identical titles, in the same order, with identical paragraph counts per chapter to `as-you-like-it-original-en.json` (verified programmatically — 23/23 chapters match exactly, e.g. Act 1 Sc.1: 47/47, Act 3 Sc.2: 151/151, Act 5 Sc.4: 67/67, Epilogue: 4/4).

**Quality assessment** (sampled across 7 chapters spanning the whole play):

- **Act 1, Scene 1** (Orlando/Oliver quarrel) — genuine sentence-level rewrite throughout: restructured clauses, replaced idioms ("stalling of an ox" → "stabling an ox"; "unmuzzle your wisdom" retained as an idiom elsewhere but paraphrased here), modernized syntax, not a word-swap. Fidelity to meaning confirmed complete against the restored original-en scene (spot-checked ~6 paragraphs line by line).
- **Act 1, Scene 2** (Touchstone's "pancakes and mustard" oath routine) — genuine rewrite; wordplay ("unmuzzle your wisdom," "knavery"→"roguery") is carried and clarified, not flattened.
- **Act 2, Scene 7** (Jaques's "All the world's a stage") — **this one is close to the original**, essentially the same sentence structure with mostly single-word swaps (schoolboy/school-boy, leopard/pard, honor/honour, sayings/saws, examples/instances). This is a defensible editorial choice for a famous, still-largely-comprehensible set-piece, but it is the one passage sampled that borders on the "shallow word-swap" pattern the task asked me to watch for. Worth a second look if a similarity-gate script flags it.
- **Act 3, Scene 3** (Touchstone/Audrey/Jaques) — genuine rewrite ("Lord warrant us" → "Lord protect us," "capricious poet" retained but recontextualized cleanly).
- **Act 4, Scene 1** (Rosalind/Orlando wooing, plus Jaques exit) — genuine rewrite, natural modern phrasing throughout.
- **Act 5, Scene 4** (the "degrees of the lie" / "seventh cause" exchange and the "If" speech, plus the Hymen masque) — genuine, careful modernization that preserves the comic structure and escalation of Touchstone's taxonomy of insults ("Retort Courteous" etc. correctly kept as proper-noun terms of art, not translated away), and clarifies "stalking-horse" as "a hunter uses a decoy." This is the passage the task specifically flagged as easy to flatten, and it was not flattened.

**Restored Scene 1's modern-en** was checked paragraph-by-paragraph against its own original-en counterpart: complete (47/47 paragraphs), correctly attributed, and a genuine (not shallow) modernization — confirmed above.

Overall verdict on modern-en: substantially a genuine modernization, not a word-swap job, with one sampled scene (2.7, "seven ages of man") that stays unusually close to the source and could be double-checked against a similarity gate if one is run.

## 7. JSON validity

Both files parse successfully with Python's standard `json` library (`json.load` succeeds without error for both `editions/as-you-like-it-original-en.json` and `editions/as-you-like-it-modern-en.json`). Both are well-formed JSON.

## 8. Verdict

**DO NOT ACCEPT as-is** — but only because of one real, narrow, easily-fixed defect class; everything else checked out clean.

**Defects to fix before merge:**

1. Restore the missing location/setting caption as the first paragraph of four chapters:
   - `Act 2, Scene 1` — should begin with `The Forest of Arden`
   - `Act 3, Scene 1` — should begin with `The palace`
   - `Act 4, Scene 1` — should begin with `The forest`
   - `Act 5, Scene 1` — should begin with `The forest`

   (Insert as paragraph 0 in each chapter of both `as-you-like-it-original-en.json` and, phrased however the modern-en house style handles scene captions elsewhere, in `as-you-like-it-modern-en.json`, which has matching paragraph counts to original-en and would need the same insertion to keep the two editions structurally aligned.)

**Everything else passes:**
- Act 1 Scene 1 restoration: verbatim, complete, correctly attributed, correctly preserves the source's own "not Charles" transcription quirk instead of silently fixing it.
- Full 23-chapter act/scene structure: correctly re-derived and correctly labeled, no merges, no mislabeling, no bad splits, all splice-point boundaries verified against the source with no lost or duplicated dialogue.
- World Library notice: fully removed in all 4 places, no collateral damage to adjacent Shakespeare text.
- No other completeness defects (missing/extra/reordered text, wrong speaker) found anywhere else in a full independent re-scan.
- The "Jupiter"/"pulpiter" substitution and a handful of "the"/"thee", "arn"/"am", "chopt"/"chapt" deviations from the raw etext are pre-existing in the currently-served edition and were not introduced by, nor within the stated scope of, this repair; flagged for awareness only, not blocking.
- Modern-en: structurally matches original-en 1:1 across all 23 chapters; genuine sentence-level modernization confirmed in 7 sampled chapters, including the hardest wordplay passages (degrees-of-the-lie, the "If" speech); one sampled passage ("All the world's a stage") stays close to the source, flagged as a possible similarity-gate borderline case, not a fidelity failure.
- Both candidate JSON files are valid, well-formed JSON.
