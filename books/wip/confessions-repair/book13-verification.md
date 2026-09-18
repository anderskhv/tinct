# Book 13 — Independent Verification of the Correction Pass

Verifier: independent (did not draft, did not write the original review).
Ground truth: `book13-source.json` (Pusey 1838, locked, 53 paragraphs).
Files compared: `book13-candidate.json` → `book13-corrected.json`.
All paragraph numbers below are **0-based array indices** (review numbering = index + 1).
Everything below was re-derived by script and by reading source/candidate/corrected side by side; the drafter's corrections log was read **after** the diff was computed and was not used to locate changes.

---

## 1. True changed-paragraph set (re-derived)

Script: exact string inequality, `candidate.paragraphs[i] != corrected.paragraphs[i]`.

```
[0, 4, 5, 6, 7, 9, 13, 15, 18, 19, 21, 25, 28, 29, 31, 32, 34, 35, 36,
 37, 38, 39, 40, 44, 45, 47, 48, 51]   → 28 paragraphs changed, 25 untouched
```

**This matches the orchestrator's independently-derived set exactly** — zero extra, zero missing.

**Untouched paragraphs are byte-identical to the original candidate** (verified by exact comparison over all 25 non-changed indices: `True`). No silent edits anywhere outside the 28.

File shape is unchanged: keys `number` / `title` / `paragraphs`, `number = 13`, `title = "Book 13"`, 53 paragraphs.

---

## 2. MAJOR — paragraph 44 (review P45)

| Item | Result | Evidence |
|---|---|---|
| Occurrence 1 direction | ✅ **Fixed** | Source: "whatsoever things for Thy sake please, **Thou pleasest in them**." Corrected: "and whatever pleases for your sake, **it is you who are pleasing in them**". God is now the *pleasing* party, not the *pleased* party. The candidate's added "them" ("whatever pleases **them** for your sake") is also gone, matching the source's bare "whatsoever things … please". |
| Occurrence 2 direction | ✅ **Fixed** | Source: "as Thy creatures be pleasing unto many, because they be good, **whom yet Thou pleasest not in them**". Corrected: "as your creatures please many people because they are good, **yet you yourself are not what pleases them in those creatures**". |
| Occurrence 2 referent | ✅ **Fixed** | Candidate's mis-attachment "in those **people**" → "in those **creatures**", which is what *in eis* attaches to. |
| Second clause left alone | ✅ Correct | "and whatever, through your Spirit, pleases us, pleases you in us" is unchanged — it was already right, and the review said to leave it. |
| Three-way distinction coherent | ✅ **Yes** | Read straight: (i) "for a man to think that what is good is bad"; (ii) "for a man to see that what is good is good, as your creatures please many people because they are good, **yet you yourself are not what pleases them in those creatures**, when they prefer to enjoy the creatures rather than you"; (iii) "when a man sees that a thing is good, for God to see in him that it is good — that is, that he himself should be loved in what he made". Leg (ii) is now a statement about **misdirected delight** (God is not the thing pleasing them in the creature), which is exactly what distinguishes it from leg (iii), where God *is* loved in what he made. The hinge holds. The previous reading ("you are not pleased by them") — divine disapproval — is gone. |

**Major: CONFIRMED FIXED at both occurrences, with the referent error fixed as well.**

---

## 3. MODERATE ×6

| # | Finding | Result | Evidence |
|---|---|---|---|
| 2 | P22 / idx 21 — emendation kept **and now disclosed** | ✅ **Confirmed** | Text: corrected still reads "the word of wisdom, as it were the **greater** light" and still carries a single "to another faith" (the locked source's duplicate is still deduplicated). Disclosure: `book13-corrections-log.md` now carries a section headed **"Paragraph 21 (review P22) — DEDICATED DISCLOSURE NOTE (Finding 2)"** which (a) quotes the locked source verbatim showing it says "lesser light" for wisdom and prints "to another faith" twice, (b) states in bold "**This is a deliberate, disclosed divergence from the literal locked source text, not a verified-against-source rendering**", (c) gives the reasoning (internal self-contradiction; the same paragraph's "gladdens the forementioned day" / "rule of the night" fixes the direction), and (d) instructs that row 14 of any mapping table be annotated as resting on a disclosed emendation rather than marked a plain source match. **This is an adequate, explicit, clearly-flagged disclosure.** It is not buried and it does not claim source verification. |
| 3 | P38 / idx 37 — Phil 4:10 wording | ✅ **Confirmed** | Corrected: "…your concern for me has flourished again, in which you were also concerned, **but it had become wearisome to you**." Source: "wherein ye were also careful, **but it had become wearisome unto you**." This is **Pusey's own wording** (only "unto"→"to", per the archaism rule), not a substituted modern translation. The hinge works: the very next sentence, "These Philippians had, **over a long weariness**, dried up and withered", now picks up a weariness the citation actually supplied. The non sequitur is gone. |
| 4 | P33 / idx 32 — "called into being" | ✅ **Confirmed** | Corrected: "nor over the day and the night, **which you called before the foundation of the heaven**". The creation gloss is removed. Echo restored: adjacent paragraph (idx 31) reads "divided and **called** them in secret, before ever the firmament was made" — the two now share the verb, so the day/night division reads as the secret election man may not judge, exactly as in Pusey. |
| 5a | *affectus* consistency | ✅ **Confirmed — one rendering** | Full-file regex over affection/passion/feeling/emotion: idx 7 "affections", idx 30 "affections", idx 32 "affections" (was "passions"), idx 35 "affections" (was "feelings"), idx 47 "affections" (was "feelings"). **All five sites now read "affections".** (idx 20's "out of a feeling for our own weakness" is *not* the *affectus* chain — Pusey's own word there is "feeling", "from feeling of our infirmity". Correctly left alone.) |
| 5b | *continentia* consistency | ✅ **Confirmed for the cited sites**, with one residual nit (below) | Source *continentia* sites located independently by grepping `contin` in the source: idx 28 (verb, "Contain yourselves" ×2), idx 29 ("made continent"), idx 36 ("in all continency"), idx 38 ("of so much continency"), idx 47 ("the vigour of continency"). Corrected renders these: idx 28 "**Restrain yourselves**" ×2 (was "Hold yourselves back"), idx 29 "self-controlled", idx 36 "**self-control**" (was "self-restraint"), idx 38 "**self-control**" (was "self-restraint"), idx 47 "self-control". **Noun/adjective is uniformly "self-control" at all four sites; the verb is "restrain yourselves", which is precisely the review's prescription.** |
| 6 | P8 / idx 7 — "supereminent" chain | ✅ **Confirmed** | All three slots now use one word: "know the **surpassing** knowledge of the love of Christ" / "he was borne, **surpassing all**, above the waters" / "reach that **surpassing** rest". Source has "supereminent" in exactly those three positions. The chain reads as a genuine parallel again (what we know → how the Spirit moves → where we end). |
| 7 | P7 / idx 6 — hedge | ✅ **Confirmed, parity intact** | Corrected: "**Perhaps it was because** it was fitting that knowledge of him should be conveyed as being "borne above"". Augustine proposes rather than asserts, matching Pusey's "Was it because it was meet that…". **Question-mark parity unaffected**: idx 6 has 2 "?" in source and 2 in corrected; global total is still 54/54 with zero per-paragraph mismatches (re-counted by script, not taken from the log). |
| — | P6 / idx 5 — "Lo" | ✅ **Confirmed, parity intact** | Corrected: "**Look —** now the Trinity appears to me, though in a glass darkly". The tentative-hedge item in the task brief maps to idx 6 (handled above); idx 5 is the "Lo" restoration, also applied. idx 5 has 0 "?" in both source and corrected — no parity effect. |

**All 6 moderates: CONFIRMED.**

---

## 4. Closing Sabbath meditation — targeted check (idx 51 / review P52)

Corrected final sentence:

> "Let it be asked of you, sought in you, **knocked for at you**; **so, so shall it be received**, so shall it be found, so shall it be opened. Amen."

- "at your door" → "**at you**" ✅ — the triple preposition chain *of you / in you / at you* is restored, matching Pusey's "asked of Thee, sought in Thee, knocked for at Thee".
- "and only so" **removed** ✅ — the bare four-beat repetition is back, matching "so, so shall it be received, so shall it be found, so shall it be opened."
- `GRATIAS TIBI DOMINE` (idx 52) untouched and untranslated ✅.

---

## 5. Minor spot-checks (18 of the applied minors re-derived and checked against source)

| idx | Change | Verdict |
|---|---|---|
| 0 | "even as I, forgetting you, **was lost**" → "even when I was forgetting you"; "by your goodness **alone**" → "by your goodness" | ✅ invented clause and intensifier both gone |
| 4 | dropped added "instead" | ✅ |
| 9 | "We climb **the** ascents" → "**your** ascents"; "set aflame by your gift, and kindled" → "set aflame; by your gift we are kindled; and we are carried upward" | ✅ God-reference restored; Pusey's two predicates un-merged |
| 13 | "stored up within him" → "**laid up with him**" | ✅ Pusey's ambiguity restored, not resolved inward |
| 15 | "in the discourses they set forth" → "in **your** discourses, set forth by them" | ✅ discourses reassigned to God, which is the paragraph's point |
| 18 | both "of itself" restored; "and" → "**like as**" | ✅ substantively right (see nit 2 below on register) |
| 19 | "For it is not…" → "**Nor** is it…" | ✅ causal-conversion undone |
| 25 | "fixed and unchanging" → "substantive and determinate"; "weariness" → "**squeamishness**" of mortal senses | ✅ *fastidium* correctly re-rendered |
| 28 | "Hold yourselves back" ×2 → "**Restrain yourselves**" ×2 | ✅ |
| 29 | "not dangerous **enough** to do harm, but wise **enough**" → "not dangerous **so as to** do harm, but wise **so as to** be watchful" | ✅ thwarted-intent implication removed |
| 31 | relative-pronoun drift restructured to the em-dash appositive the review proposed | ✅ referent no longer shifts mid-sentence |
| 34 | quotation marks restored around the rejected objection; "holiness" → "**piety**"; "true meaning" → "**true senses**" | ✅ all three; plural "senses" is the argument |
| 35 | two added causal "since" → "which" ×2; "feelings" → "affections" | ✅ apposition restored |
| 36 | "self-restraint" → "self-control" | ✅ |
| 38 | "self-restraint" → "self-control" | ✅ |
| 39 | "might **otherwise** have perished for want of that food" → "might **also**, for want of that food, have perished" | ✅ matches source "might also for want of that food have perished" |
| 40 | two added "truly" dropped | ✅ |
| 45 | "**must** draw" → "**seeks to** draw" (*fain*) | ✅; the "equal nature" / bodily-sex-only clauses are untouched in this paragraph |
| 47 | "feelings" → "affections" | ✅; the six-day recapitulation sequence is otherwise byte-identical |
| 48 | "once it has run its course" → "**having finished their courses**" | ✅ plural restored |
| 17 | **no change** — logged as a deliberate declined finding | ✅ verified byte-identical; the review itself called this one "acceptable" |

Every change in the corrected file corresponds to a logged, review-sanctioned correction. **No unlogged edits, no scope creep, no drive-by rewrites.**

---

## 6. Mechanical gates (all re-run against `book13-corrected.json`)

| Gate | Result |
|---|---|
| Paragraph count | **53** (source 53 / candidate 53 / corrected 53) ✅ |
| Question marks, total | source **54** / corrected **54** ✅ |
| Question marks, per-paragraph parity | **zero mismatches across all 53** ✅ |
| Exclamation marks | source **1** / corrected **1**, zero per-paragraph mismatches ✅ |
| Archaisms (`thee/thou/thy/thine/hath/doth/saith/unto/whilst/betwixt/whereof/spake/hast/art/dost/ye/shalt/didst/wast`) | **zero matches** ✅ |
| Valid JSON | `python3 -m json.tool` clean ✅ |
| `--` (double hyphen) | **zero** ✅ |
| Single quotes | only `d's` / `n's` possessive apostrophes; **zero single-quote-as-quotation** ✅ |
| Curly/typographic quotes | **zero** ✅ |
| Double quotes | 6, in 3 matched pairs: `"borne above"` (idx 6), `"That it was said idly, and without meaning?"` (idx 34, newly restored), `"multitude"` (idx 35). No orphans ✅ |

---

## 7. Allegorical mappings — spot-check that the correction pass disturbed none

The strongest structural evidence: **all 25 unchanged paragraphs are byte-identical**, and of the 28 changed paragraphs, every delta was inspected word-by-word (section 5 above) — **not one delta touches a mapping term, a referent, or a direction**. Targeted re-checks of the ones named in the brief:

| Mapping | Status in corrected | Evidence |
|---|---|---|
| Light / darkness (conversion vs prior state) | ✅ undisturbed | idx 2, 3, 12, 14 all byte-identical to candidate; "we were once darkness, but now we are light" intact |
| Heaven = spiritual people / earth = carnal people | ✅ undisturbed | idx 12 byte-identical |
| Waters **above** = angels / **below** = mortals needing Scripture | ✅ undisturbed | idx 17 byte-identical (it is the declined finding — verified unchanged) |
| Sea-creatures + birds = sacraments + preaching (**not** land animals) | ✅ undisturbed | idx 24 byte-identical; idx 27 byte-identical ("not the moving creature that has life, but the living soul"); idx 32's only edit was "called into being"→"called" and "passions"→"affections", leaving the fish/birds/almsgiving judgement list untouched |
| Land animals = the soul's rule over lower passions | ✅ undisturbed, and slightly strengthened | idx 28's only edits are the verb "Restrain yourselves" ×2; the vice order (pride → beasts, luxury → cattle, curiosity → serpents) is untouched. idx 29's edit is the "so as to" fix only |
| Sun/day = word of wisdom (greater light) vs moon/stars/night = knowledge + sacraments | ✅ kept, now **disclosed** | idx 21; see Moderate 2 |
| Gift vs fruit (widow = fruit, raven = gift) | ✅ undisturbed | idx 39's only edit is "otherwise"→"also"; the gift/fruit assignment is untouched |
| Male/female left implicit; "parity of nature" preserved | ✅ undisturbed | idx 31's edit is the appositive restructure only; idx 45's edit is "must"→"seeks to" only — "should have an equal nature" is intact |
| Seventh day = eternal rest, alone without evening | ✅ undisturbed | idx 48–51, only the two logged cadence/plural restorations |

**None of the 31 verified mappings was disturbed. No new inversion introduced.**

---

## 8. Contextual read of the changed paragraphs, and the closing meditation

Read straight through, changed paragraphs in their surroundings:

- **idx 5–7 (the Trinity hinge and the "borne above" argument)** now read as one movement: "Look — now the Trinity appears to me…" opens it, "Perhaps it was because…" keeps Augustine proposing rather than pronouncing, and the *surpassing* chain in idx 7 ties the knowledge of Christ's love, the Spirit's motion, and the final rest into a single word. This is materially better than the candidate — three separate seams closed in a row, and no new one opened.
- **idx 32 / idx 31** now share "called", so the secret election reads as one idea across the paragraph break rather than two unrelated statements.
- **idx 37** is the clearest gain: the Philippians inference follows from its own citation for the first time.
- **idx 44** is the decisive one. With both verbs corrected, the paragraph's final long sentence carries its three legs cleanly and the middle leg no longer misfires into a statement about divine disapproval.
- **The closing Sabbath meditation (idx 48–52)** is intact and not flattened. The morning/evening motif still runs unbroken and identically phrased across idx 46 ("their own succession of morning and evening"), idx 47 ("without morning or evening"), idx 48 ("for in them there was morning and evening") and idx 49 ("the seventh day has no evening"), so the pattern-break at the seventh day still lands. idx 50's triple negation / triple affirmation ("you do not see in time, nor are you moved in time, nor do you rest in a time; and yet you make…") is untouched. idx 51's chiasmus ("we see these things that you made, because they exist; but they exist, because you see them") is untouched. And the final sentence now closes on Pusey's bare drumbeat — *asked of you, sought in you, knocked for at you; so, so shall it be received, so shall it be found, so shall it be opened. Amen.* — with `GRATIAS TIBI DOMINE` left standing alone after it. **Full devotional weight; no new seams; the two cadence repairs are the only things that changed here and both are net gains.**

---

## 9. Residual nits (non-blocking, recorded for honesty — none warrants another round)

1. **idx 27 vs idx 28, *continere* verb.** Pusey uses "contain themselves" at idx 27 ("it profits only those already among the Faithful, **to contain themselves** from the love of this world") and "Contain yourselves" at idx 28. The pass standardised idx 28 to "Restrain yourselves" but left idx 27 as "hold themselves back" — so two adjacent occurrences of the *same* verb now read differently, where before the pass they matched. The review never cited idx 27, so this is outside the finding set, but it is a small inconsistency the pass introduced rather than removed. Fix if there is ever another touch of this file: idx 27 → "to restrain themselves from the love of this world".
2. **idx 18, "like as".** Restoring Pusey's comparative was right in substance, but "For with you is the fountain of life, **like as** in your light we shall see light" reimports an archaic idiom into a modern-English edition. "just as" would carry the same likeness at modern register. Does not trip the archaism gate; purely a register nit.
3. **idx 48, "having finished their courses".** Verbatim Pusey, and the plural restoration is correct, but the number agreement is now loose ("this whole, most beautiful **array**… having finished **their** courses, **is** to pass away"). Pusey has the same looseness, so this is faithful rather than wrong.

None of these three changes a claim, a direction, a mapping, or a count.

---

## 10. Verdict

**Book 13: READY — editorially accepted.**

- True changed set re-derived independently and matches the orchestrator's: 28 paragraphs, `[0,4,5,6,7,9,13,15,18,19,21,25,28,29,31,32,34,35,36,37,38,39,40,44,45,47,48,51]`.
- The **major** (idx 44) is fixed at **both** occurrences, with the referent mis-attachment fixed too, and the three-way distinction now reads coherently.
- **All 6 moderates confirmed**, including the one that was not a text change: the paragraph-21 "greater light" emendation is kept *and* is now disclosed in a dedicated, clearly-flagged, bolded section of the corrections log that quotes the locked source, states plainly that this is a divergence and not a source-verified reading, gives the reasoning, and directs that any mapping table annotate it as such. **The disclosure is adequate.**
- Minors: every applied minor spot-checked against source; all correct. Zero unlogged edits; all 25 unchanged paragraphs byte-identical.
- All mechanical gates pass: 53 paragraphs, 54/54 question marks with zero per-paragraph mismatches, 1/1 exclamation, zero archaisms, valid JSON, zero `--`, zero single-quote-as-quotation, zero curly quotes.
- Zero of the 31 verified allegorical mappings was disturbed.
- The closing Sabbath meditation is intact and improved by the two cadence restorations.

**No further round required.** Three cosmetic nits are recorded above for any future touch; none is a defect in the corrected file as it stands.

---

## 11. Pass completion

With Book 13 accepted, this **completes the assessment of all 13 books of the *Confessions***:

- **Repaired and accepted (9):** Books 3, 4, 5, 6, 8, 9, 10, 12, 13.
- **Already sound, preserved unchanged (4):** Books 1, 2, 7, 11.

Book 13 was the final book in the pass, and it ends it on the strongest allegorical record of the sequence — 31 of 31 mappings correct in direction, with the single major finding a theological verb rather than a mapping inversion, now fixed.
