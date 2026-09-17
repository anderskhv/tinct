# Confessions Book 4 — independent verification of the corrected modern-en candidate

- Ground truth: `book04-source.json` (Pusey 1838, 31 paragraphs)
- Pre-correction: `book04-candidate.json`
- Verified file: `book04-corrected.json`, sha256 `8ae7e1e1c98d73a4a4f280d08a00c3cde74fdb24a7efe4316532b1ca624ce3ff`
- Method: every claim in `book04-corrections-log.md` re-derived from source independently. Diffs computed mechanically (candidate → corrected, word-level), then each changed span read back against the corresponding source clause. The log was used only as a checklist of what to look for, not as evidence.

## Mechanical re-checks (independently run, not taken from the log)

| Check | Result |
|---|---|
| Paragraph count | 31 / 31, one-to-one. PASS |
| JSON shape | `number` 4, `title` "Book 4", `paragraphs` — identical structure to candidate. PASS |
| Paragraphs actually differing from candidate | exactly `[0, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 16, 17, 20, 21, 22, 26, 29, 30]` — matches the claimed 19 exactly. No undeclared edits. PASS |
| Archaism sweep (`thou\|thee\|thy\|thine\|verily\|doth\|didst\|hast\|hath\|whence\|whither\|wherefore\|unto\|nay\|yea\|shalt`) | 0 hits. PASS |
| Question-mark parity vs source, all 31 paragraphs | matches everywhere except para 30 (source 2, corrected 3) — the known, reviewed, deliberately-declined case. PASS |
| Word-ratio floor (corrected/source, per paragraph) | no paragraph below 1.00; none above 1.30. No clause-dropping introduced. PASS |

## Major + moderates — independent verdicts

| # | Sev | Para | Source clause | Corrected clause | Verdict |
|---|---|---|---|---|---|
| 1 | **MAJOR** | 13 | "And who leaveth Thee, whither goeth or whither fleeth he, **but from Thee well-pleased, to Thee displeased?**" | "And whoever leaves you — where does he go, where does he flee, **except from you in your kindness to you in your anger?**" | **CONFIRMED FIXED.** The pleased/displeased predicates are now unambiguously God's (*a te placido ad te iratum*). The nonsensical reading ("flees *toward* God at the moment God displeases him") is gone; the sentence now says what Augustine says — you cannot leave God, only move from his favour into his wrath. The following clause is now "your law in his own punishment", which also follows logically as the reason. No new problem. |
| 2 | MOD | 9 | "…that Thou mayest tell me **why weeping is sweet to the miserable?**" | "…and put the ear of my heart close to your mouth — **will you tell me why weeping is sweet to the miserable?**" | **CONFIRMED FIXED.** Genuinely interrogative, ends on "?". Para 9 question count now 6, matching source 6 (was 5). The governing question of the whole grief meditation is restored, and the five unfolding questions after it now read as its expansion. Construction (petition + dash + direct question) is slightly mixed but reads naturally. |
| 3 | MOD | 20 | "But what moved me… to dedicate these books unto Hierius… **and some words of his I had heard, which pleased me?**" | "But what moved me, Lord my God, to dedicate those books to Hierius — an orator of Rome I did not know by sight, but loved for the fame of his learning, which was outstanding in him, **and for some words of his I had heard that pleased me?**" | **CONFIRMED FIXED.** Self-interrogation frame restored; question count 2, matching source 2 (was 1). Minor interpretive tightening: "some words" becomes a second object of "loved for" rather than a loose appended clause. Defensible reading of Pusey's loose construction, no content added or lost. |
| 4 | MOD | 16 (a) | "Why then be perverted and follow thy flesh? **Be it converted and follow thee.**" | "Why then be perverted and follow your flesh? **Let it be converted instead, and follow you.**" | **CONFIRMED FIXED.** Question and separate imperative are both present; the added "rather than" connective is gone; perverted/converted wordplay restored. Referents check out: "it" = the flesh, "you" = the soul addressed since para 15. |
| 5 | MOD | 16 (b) | "when any one thing is made up of many, **all of which do not exist together**" | "when any one thing is made up of many parts **that do not all exist at the same time**" | **CONFIRMED FIXED.** Correct quantifier scope (not-all coexist, rather than the candidate's each-part-fails-to-exist). Now consistent with the syllable example one sentence earlier, and with para 14's "portions of things which do not all exist at once". |
| 6 | MOD | 22 | "that I had loved him more **for the love of his commenders**" | "that I had loved him more **because of the love of the men who praised him**" | **CONFIRMED FIXED.** *Love* is restored as the operative noun, reconnecting to para 20's conclusion "when one that loves him, praises him" / corrected "one who loves kindles love in another". The social-deference misreading is gone. |
| 7 | MOD | 8/11 | "that **phantasm** she was bid to trust in" (8) / "a mere **phantom**" (11) | "the **phantom** she was being told to trust in" (8) / "a mere **phantom**" (11, untouched) | **CONFIRMED FIXED.** `shadow-thing` appears 0 times in the corrected file; `phantom` appears in paras 8 and 11 only. The recurring Manichean image now reads as one term across the grief meditation. |

No major or moderate finding is unresolved.

## Minor findings — spot-checked against source (not the log)

All 20 minor line-items listed in the review were independently confirmed applied and correct. Sampled in depth against source:

- **Para 0** — "the food that never perishes" (imperishability restored, not supply); "…to the men they called 'the elect' and 'the holy' — **food out of which**, in the factory of their stomachs, they would manufacture for us angels and gods who would cleanse us" (material relation restored, purpose clause gone, grammatical).
- **Para 2** — "commit **fornication** against you" (softening + invented hedge both removed); first instance now "**feed the wind**", so the callback "For what else is it to feed the wind…" lands. Internal inconsistency resolved.
- **Para 3** — "Christian and true **piety**"; "a broken and **contrite** heart". `piety` now appears in 3 and 30, `religion` only in para 0 where the source says *religion*. Cross-paragraph inconsistency resolved.
- **Para 4** — "being a serious man" (*gravis* as character, not rank); "the **force of** chance" (*vis* restored).
- **Para 5** — "holy fear". **Para 7** — "sudden **boldness**" (*libertas* as frankness).
- **Para 11** — "neither rest nor **counsel**" (*consilium*). **Para 12** — "the **causes** of other griefs".
- **Para 13 minor** — invented "waiting" deleted; now "your law in his own punishment".
- **Para 17** — "you **transgressors**". **Para 21** — "in the **theatre**".
- **Para 22 minor** — "people **who deal only in opinion**". **Para 26** — "and **the bones that had not yet been humbled** did not exult" (relative clause restored, "since" and "my" both gone).
- **Para 29** — "so good a portion of **my inheritance**" (Luke 15 allusion restored; "far country" and "prostitutes" still downstream, so the allusion now holds across all three markers).
- **Para 30** — "**Too great a perversity!**"; "we are turned aside" (added emphasis gone).
- **Para 30 (c)** — declined. Re-checked: the review itself ruled it defensible and required no correction. Declining it is correct, not a miss.

**Bookkeeping note (not a defect in the corrected file):** the original review's summary table says "Minor: 18", but the paragraph list in that same row enumerates 20 items (0×2, 2×2, 3×2, 4×2, 5, 7, 11, 12, 13, 17, 21, 22, 26, 29, 30×2). The true totals are 1 major + 6 moderate + 20 minor = 27 findings, not 25. The corrector applied all 20 minors, so the discrepancy is in the review's arithmetic only; nothing was skipped.

## Newly introduced errors

| Para | Finding | Source evidence | Corrected wording | Severity |
|---|---|---|---|---|
| 0 / 21 | **Spelling inconsistency introduced by the para 21 fix.** The file now mixes US and UK spelling of the same venue word. | Source has "theatrical prize" (2), "in the theatre" (21). | Para 0 "theater ovations" (untouched) vs para 21 "in the theatre" (newly corrected). | Trivial / copy-edit |
| 16 | **Register note, not a fidelity error.** "Why then be **perverted** and follow your flesh?" is the review's own prescribed wording and restores the perverted/converted wordplay, but in present-day English "perverted" carries a sexual primary sense the Latin *perversus* does not. | "Why then be perverted and follow thy flesh?" | as prescribed | Note only — no action required unless the house style objects |

No other new fidelity or readability problem was found. Specifically checked and clean: no clause dropped by any substitution, no dangling referent created (paras 0, 16, 20, 26 re-read in full for this), no new invented connective or intensifier, no question converted to a statement anywhere, no softening reintroduced.

## Untouched-paragraph claim

**CONFIRMED.** Paragraphs 1, 6, 10, 14, 15, 18, 19, 23, 24, 25, 27, 28 are byte-identical to `book04-candidate.json` (exact string equality, all twelve). No silent drift. The complementary check also holds: no paragraph outside the claimed 19 was modified.

## Whole-chapter flow

Read end to end, ignoring source.

**Seams.** The corrections are surgical and do not show. Every edited span sits at the same register as the prose around it, because each replacement was a phrase-level swap into an otherwise intact sentence rather than a re-drafted sentence. The two structural edits — para 9's restored question and para 16's split into question + imperative — are the only places where sentence architecture changed, and both read *better* than what they replaced: para 16 in particular now opens on a crisp two-beat "Why then be perverted and follow your flesh? Let it be converted instead, and follow you," which is closer to Augustine's own cadence than the candidate's single hedged sentence.

**Grief meditation (paras 8–12).** This is now the strongest stretch in the book and reads as sustained coherent prose. The two defects the original review said were degrading it are both gone: para 8 hands "the phantom" to para 11's "a mere phantom" so the image is recognisably the same one, and para 9 now opens on a question, so the meditation begins as an inquiry and the five following questions unfold from it instead of trailing an assertion. Para 11's "neither rest nor counsel" removes the redundancy with "fell apart" and tightens the sentence. Para 12's "causes of other griefs" restores the causal claim the paragraph then spends its length demonstrating. Read as a unit, 8→9→10→11→12 now runs darkening → interrogation → Pylades/Orestes and the halved soul → collapse and flight → slow scarring-over with real momentum and no flat patch.

**Philosophical stretch (14–18, 23–28).** Unchanged except para 16 and 17, and both improve it. Para 16's quantifier fix removes the one place where the argument was locally incoherent — the corrected "many parts that do not all exist at the same time" now agrees with the syllable example immediately before it and with para 14's "portions of things which do not all exist at once", so the whole rise-and-pass-away argument holds together across three paragraphs for the first time. Para 17's "you transgressors" restores the charge that the following "Where are you going?" answers. The quoted Word across 15–18 still reads as one continuous speech.

**Cross-paragraph consistency.** All three defects the review named are resolved: *phantasma* (8/11) consistent as "phantom"; *pietas* (3/30) consistent as "piety"; "feed the wind" consistent within para 2. "On the Fair and the Fitting" (19, 22, 23, 26), Categories (27, 28), "demons", "love" for *charitas*, and all proper nouns remain consistent. One new cosmetic split: theater/theatre (0 vs 21).

**Voice.** Unchanged and intact — plain, direct modern English, second-person address to God still natural rather than translationese. Zero archaisms. The restored words that could have pulled the register backwards ("fornication", "contrite", "transgressors", "perverted", "counsel") all sit inside modern sentences and read as deliberate biblical/theological vocabulary rather than as archaism.

## Final verdict

**Ready to mark "corrected and verified."** No unresolved major or moderate finding. All 27 findings from the review are accounted for: 26 applied and independently confirmed against source, 1 (para 30 question mark) explicitly declined with the review's own endorsement. The single new issue is a trivial theater/theatre spelling split that can be swept at final copy-edit and does not warrant another correction round.

**Editorially accepted: yes — Book 4 of 13.** On the evidence of both passes, Book 4 is a materially better result than Book 3: 31/31 alignment, zero archaisms, zero dropped clauses, zero invented content of substance, all cross-paragraph terminology consistent, and a voice that holds through both the grief meditation and the Aristotelian paragraphs. Acceptance covers this book only; the remaining 12 books of Confessions carry no inherited verdict from it. Carry forward to the next book: the drafter's self-certification about preserved rhetorical questions was demonstrably false in Book 4 (paras 9 and 20), so per-paragraph question-mark parity against source must stay a blocking mechanical gate on every candidate, and must be re-run on every corrected file rather than trusted from a log.
