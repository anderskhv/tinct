# Bounded editorial trial — Tinct Modern E accessibility principle

**Status: investigation and sample work only.** Not authorization for whole-book retranslation, policy change, or publication. No live editions, app code, registry, character cards, shared trackers, or policy files were edited. No Danish work, audio, spend, deploy, or repair-queue expansion.

**Principle under test:** *Tinct Modern E removes avoidable barriers; it does not make every book easy.* Contemporary language and clearer syntax where faithful; preserve difficult ideas, ambiguity, distinctive voices, rhythm, wordplay, and meaningful stylistic experiments.

**Owned staging folder:** `books/wip/modern-e-editorial-trial-20260928/`
**Branch:** `claude/gifted-bardeen-vom79a` (existing session branch, not a new checkout)

---

## 1. Pinned evidence

| Book | Edition | File | SHA-256 | Chapters | Last commit touching file |
|---|---|---|---|---|---|
| To the Lighthouse | original-en | `app/public/data/editions/to-the-lighthouse-original-en.json` | `1662e69cd278...b8d4f8` | 42 | — |
| To the Lighthouse | modern-en (**served**) | `app/public/data/editions/to-the-lighthouse-modern-en.json` | `3b20ae3172ec...ba84e22` | 42 | `b17e6014c871` (2026-09-25 18:13 UTC) |
| Ulysses | original-en | `app/public/data/editions/ulysses-original-en.json` | `ddc341889062...b01121428` | 18 | — |
| Ulysses | modern-en (**served**) | `app/public/data/editions/ulysses-modern-en.json` | `ac853e0de7c6...bee241233a6` | 18 | `5dbf20cd2348` (2026-09-24 13:42 UTC) |

*(Hashes truncated for table width; full 64-char digests in `editions/hashes.txt` in this folder.)*

Verified: the per-chapter reader files served under `app/public/data/editions-chapters/{book}-modern-en/ch00NN.json` are byte-for-byte identical (paragraph arrays) to the combined edition JSON above, for every chapter sampled below (chs. 1, 23, 33 of Lighthouse; chs. 3, 4, 18 of Ulysses). What readers see matches what was analyzed.

**No newer staged candidate exists for either book.** `books/wip/to-the-lighthouse-followup/` is a separate, already-completed release package (structural/character-anchor work, accepted 2026-09-25) — distinct from this trial, not touched here. No Ulysses WIP folder exists. This trial's proposed revisions (§4) are new work product, not a competing candidate for either book.

**Context check on the given leads:** the 0.612 weighted similarity / 0/42 light-mechanical / 2% identical-long-paragraph figures for Lighthouse modern-en reproduce exactly against the current file (`python3 books/classify-modern-en.py to-the-lighthouse --gate` → `GATE PASS`). Per-chapter breakdown shows this average conceals real unevenness: "The Window" and "The Lighthouse" sections mostly sit at 0.54–0.75 (genuine sentence-level rewriting); "Time Passes" chapters 21, 23, 24 sit at 0.74–0.81 — above where the book-level gate would itself fail if applied per-chapter. Sample 2 below targets this weak section directly. Ch.1 LIX (46.2 → 39.4) was not independently recomputed here — treated as a lead per the task's own framing, since the task explicitly notes score deltas don't prove improvement.

---

## 2. Six bounded samples

| # | Book | Location | Editorial problem it tests |
|---|---|---|---|
| 1 | Lighthouse | Ch.1 ("The Window·1"), para 2 — James's joy | Long periodic sentence, nested subordinate clauses, abstract psychological generalization. Tests: can syntax be clarified without cutting content? |
| 2 | Lighthouse | Ch.23 ("Time Passes·4"), para 1 — empty house | Already-flagged weak spot (near-mechanical word-swap per similarity gate). Tests: does "modernization" here actually reduce a real barrier, or just reword one? |
| 3 | Lighthouse | Ch.33 ("The Lighthouse·4"), paras 10, 12 — boat scene | Free indirect discourse sliding between Cam's, James's, and Mr Ramsay's perspectives inside one paragraph, no typographic markers. Tests: does clarifying prose accidentally add markers/attribution the original withholds? |
| 4 | Ulysses | Ch.4 ("Calypso"), para 2 — kidneys/breakfast tray | Relatively plain narrative prose. Tests: does "easy" text still get over-clarified (added detail, resolved withheld information) even when no real difficulty exists to remove? |
| 5 | Ulysses | Ch.3 ("Proteus"), para 1 — beach opening | Dense interior monologue: elliptical syntax, unnamed philosophical allusion (Aristotle via Stephen's memory), embedded foreign-language quotation (Dante, Italian). Tests: is deliberately withheld/foreign content being explained away? |
| 6 | Ulysses | Ch.18 ("Penelope"), para 1 opening — Molly on Mrs Riordan | Strongly experimental: unpunctuated run-on, period Dublin vernacular. Tests: does "clarifying" period slang flatten Molly's voice into generic modern register? |

Six samples only; no claim about the other 41 Lighthouse or 17 Ulysses chapters follows from this.

---

## 3–4. Assessment and proposed revisions

### Sample 1 — Lighthouse ch.1, James's joy (KEEP CURRENT — no revision proposed)

Original is one ~105-word sentence with three stacked subordinate clauses ending in a comma splice. Current Modern E breaks it into four sentences at natural clause boundaries, modernizes one idiom ("up with the lark" → "up at the crack of dawn"), keeps every image and the "crystallize and transfix" mechanism intact. This is **avoidable difficulty correctly removed**: the syntax was a barrier (run-on parsing), the content (the psychological claim about people who let future hopes cloud the present) is fully preserved. Comprehension clearly improves; nothing lost. No revision proposed — already meets the standard.

### Sample 2 — Lighthouse ch.23, empty house (KEEP CURRENT, but flag: needs a different kind of pass — INVESTIGATE FURTHER)

Original is a single ~200-word cumulative sentence (the "stray airs... blustered in... met nothing... but only hangings...") that mimics, in its own unbroken accretion of clauses, the slow entropy it describes. Current Modern E preserves this exact sentence structure and length, changing only individual words ("stray airs" → "stray breaths of air," "mantle" → "cloak," "corrupt" → "spoil"). Nothing about the nested syntax is actually addressed.

**Proposed revision tested:** broke the long sentence into 3–4 shorter sentences at clause boundaries, keeping every word and image.

**Independent review verdict (see §5): neither — lean toward CURRENT.** The reviewer's reasoning: the current version is indeed only lightly modernized and not fully faithful to the "real rewriting" standard — but the proposed fix (sentence-splitting) trades one problem for a different, arguably worse one. Woolf's unbroken accumulation in this specific passage is the deliberate stylistic device — the long sentence's syntax *performs* the slow, continuous decay of the house. Chopping it into declaratives eases parsing but damages the rhythm that carries meaning, which the stated principle explicitly protects.

**Conclusion for this sample:** the current rendering under-modernizes on the fidelity axis (already known from the similarity gate), but generic sentence-splitting is not the right fix for the accessibility axis either. This chapter needs a rewrite that addresses genuine avoidable friction — archaic/obscure diction, unclear referents — while *deliberately preserving* the cumulative sentence structure as the point, not the problem. That's a real editorial judgment call beyond this bounded trial's scope. **Investigate further; do not treat either the current text or the tested proposal as sufficient.**

### Sample 3 — Lighthouse ch.33, boat scene perspective shifts (KEEP CURRENT — no revision proposed)

Sampled two long paragraphs where narration slides between Cam's perception, Mr Ramsay's interiority, and James's judgment without warning or typographic markers — classic free indirect discourse. Current Modern E clarifies at the sentence level throughout ("give way" → "give in," consistently; "she'll give way" kept in both instances as a deliberate refrain rather than varied) without adding attribution, without resolving whose thought is whose, without smoothing the abrupt perspective jumps. This is the harder case to get right — and it's handled correctly: the difficulty here (tracking who is thinking/feeling what) is deliberate and literary, and Modern E leaves it exactly as opaque as the original. No revision proposed.

### Sample 4 — Ulysses ch.4, Calypso ("her breakfast things") — REVISION PROPOSED, ACCEPTED

At this point in the text, Bloom's wife has been referred to only as "her" — Molly is not yet named in his interior narration. Current Modern E renders "righting her breakfast things" as "setting up **his wife's** breakfast things" — adding identifying information Joyce specifically withholds (free indirect discourse tracks only what's actually in Bloom's head, which at this moment is just "her"). This is avoidable-difficulty theater: there was no real barrier here (the pronoun is not confusing to a reader), so "clarifying" it only removes an intentional narrative technique for no comprehension gain.

**Proposed:** restore "her breakfast things"; "righting" → "straightening" (closer to the "correcting disorder" sense of "righting" than "setting up," which implies starting from scratch).

### Sample 5 — Ulysses ch.3, Proteus opening — REVISION PROPOSED, ACCEPTED

Two defects in the current rendering:
1. **"But he adds: in bodies"** (original) → **"But Aristotle adds: in bodies"** (current). This is one of the most-cited textual cruxes of "Proteus" — Stephen never names the philosopher he's half-quoting from memory (Aristotle's *De Anima*); working out who "he" is is part of the passage's designed difficulty. Naming him resolves an ambiguity the source deliberately withholds.
2. **"maestro di color che sanno"** (Dante, *Inferno* IV.131, Dante's own Italian for Aristotle) → **"the master of those who know"** (current, translated into English). This is a verbatim embedded quotation in a different language, not English prose awaiting modernization. Translating it erases the allusion — a reader can no longer recognize it as Dante at all.

**Proposed:** restore "he" (not "Aristotle"); restore the untranslated Italian phrase.

*(Flagged but not revised: "Ineluctable modality" → "The inescapable reality." "Ineluctable" is rare-but-real English, and its Latinate, philosophical register is itself characterizing — it signals Stephen's scholastic mind. Whether this is avoidable difficulty (obscure word) or deliberate voice (erudite diction as characterization) is a judgment call this trial did not resolve; noted for further investigation, not revised.)*

### Sample 6 — Ulysses ch.18, Penelope ("a great leg of") — REVISION PROPOSED, ACCEPTED

"A great leg of" is blunt, bodily, period Dublin slang (roughly "fancied her / had a thing for her"). Current Modern E renders it as "a great connection with" — abstract, euphemistic, office-register English that changes Molly's voice entirely. Molly's monologue is prized specifically for its unfiltered physical directness; "connection with" is the opposite register.

**Proposed:** "a great thing for her" — keeps the blunt, colloquial tone much closer to source, though the independent reviewer correctly notes even this loses some of "leg of"'s specifically ogling/physical connotation. Currency modernizations in the same passage ("farthing" → "penny," "4d" → "fourpence") are sound and were not revised.

---

## 5. Independent comparative review

An independent reviewer (separate Claude session, no access to this document's verdicts, given only original/current/proposed text plus the stated Tinct principle) evaluated all four proposed-revision cases blind. Full verdicts:

- **Case 1 (Time Passes ch.23):** *"If forced, CURRENT, because the sentence-fragmentation in proposed is exactly the kind of smoothing the stated principle warns against."* → informed the "investigate further, don't ship the tested fix" conclusion above.
- **Case 2 (Calypso, "her breakfast things"):** *"PROPOSED, decisively — current has a real accuracy/fidelity bug, proposed fixes it."*
- **Case 3 (Proteus, Aristotle/Italian):** *"PROPOSED, strongly... current actively falsifies the text on both counts."*
- **Case 4 (Penelope, "great connection with"):** *"PROPOSED... between the two offered, proposed is clearly closer to Joyce's voice."* Noted residual concern: neither phrase perfectly captures "leg of"'s specific connotation.

No defects were found in the proposed text itself requiring a fix-and-recheck cycle; the one case where the reviewer preferred current (Case 1) was not a defect in the proposal but a judgment that the proposal solved the wrong problem — reflected in §4 as "investigate further," not as an accepted revision.

---

## 6. Recommendations

| Sample | Disposition |
|---|---|
| 1. Lighthouse ch.1 opening | **Retain current.** Meets the standard already. |
| 2. Lighthouse ch.23 Time Passes | **Investigate further.** Current under-modernizes (confirmed by both the similarity gate and this trial); the sentence-splitting fix tested here is not the right answer either, per independent review. A real fix needs to preserve the cumulative-sentence device while addressing actual diction/clarity barriers — out of scope for this bounded trial. |
| 3. Lighthouse ch.33 perspective shifts | **Retain current.** Handles the hardest case (unmarked perspective shifts) correctly. |
| 4. Ulysses ch.4 Calypso | **Accept bounded revision** (restore withheld pronoun, closer verb). |
| 5. Ulysses ch.3 Proteus | **Accept bounded revision** (restore ambiguous "he," restore untranslated Dante quotation). Also flag "ineluctable"→"inescapable" for future investigation — not revised here. |
| 6. Ulysses ch.18 Penelope | **Accept bounded revision** (restore Molly's blunt register over office-speak), with the noted residual imperfection. |

**Does the evidence support a targeted accessibility pass?**

- **Lighthouse:** No catalogue-wide case from this sample. One specific finding — the "Time Passes" section (chs. 21–29, esp. 21/23/24) reads as under-modernized on both the fidelity gate and this accessibility review — is real and localized, not a whole-book problem. Worth a targeted pass on that section specifically, separately scoped and assigned.
- **Ulysses:** This sample surfaces a recurring failure *pattern*, not just isolated errors: Modern E is over-resolving Joyce's deliberate ambiguities (withheld pronouns, embedded foreign-language quotations) rather than leaving them be — 2 of 3 Ulysses samples hit this same defect independently. That's evidence worth escalating as a pattern to check across the rest of the book (particularly other interior-monologue-heavy episodes: Proteus, Lestrygonians, Penelope, Circe), not evidence that the whole book needs retranslating.

**No claim is made that the broader catalogue (the other ~98 books) needs any rewriting.** This trial covers two books, six paragraphs.

---

## Proposed accessibility-review rubric (proposal only — not adopted, does not alter repository policy or `classify-modern-en.py`'s existing gate)

For a reviewer assessing whether a Modern E passage over-simplifies or under-simplifies, ask of each divergence from source:

1. **Is the difficulty structural (syntax/parsing) or substantive (content/reference)?** Structural difficulty is more often fair game to ease; substantive difficulty (an intentionally withheld referent, an embedded quotation, a genuine ambiguity) should not be resolved.
2. **Is this difficulty load-bearing?** Does the sentence's difficulty *do* something (mimic decay, perform confusion, characterize a mind) or is it incidental (just an old-fashioned turn of phrase)? Load-bearing difficulty stays.
3. **Does the change add, remove, or merely relocate information?** Flag any Modern E sentence that names something the original left unnamed, explains something the original left implicit, or translates something the original left untranslated.
4. **Does the register match?** A word-for-word "accurate" synonym can still be wrong if it shifts formality/class/period register (e.g., "connection with" for "leg of").
5. **Would reverting this one sentence to the original harm comprehension for a first-time reader?** If no, the "simplification" wasn't solving a real problem.

This rubric is a proposal for future use; it is not a new mandatory gate and does not replace `books/classify-modern-en.py --gate`.

## Character-anchor impact (flag for Codex, no action taken)

None of the six sampled paragraphs overlap with content referenced in `app/public/data/characters/to-the-lighthouse.v1.json` or `app/public/data/characters/ulysses.v1.json` (spot-checked: no character-card quote or scene anchor matches these paragraph coordinates). If any of the three accepted bounded revisions (Samples 4–6) is later selected for integration, Codex should re-verify character-card compatibility as a matter of course per standard process — no anchor collision is currently known, but this trial did not exhaustively diff every character-card reference against these chapters.

## What this trial is not

Not a whole-book retranslation. Not a policy change. Not authorization to touch `app/public/data/editions/*-modern-en.json` for either book. Not a claim about any book besides these two. Nothing outside `books/wip/modern-e-editorial-trial-20260928/` was written.
