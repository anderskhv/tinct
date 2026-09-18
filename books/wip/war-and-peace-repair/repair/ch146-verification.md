Model: opus

# ch146 — independent verification (2026-09-18)

Verifier did not draft, review or correct this chapter. Inputs: `repair/ch146-source.json` (Maude),
`repair/ch146-candidate.json` (pre-correction), `repair/ch146-corrected.json`,
`repair/ch146-corrections-log.md`, `repair/ch146-fidelity.md`, `repair/ch146-candidate-accessibility.md`,
`repair/ch146-baseline.json` (context only).

## 1. Diff vs log

Computed paragraph-by-paragraph diff (Python, exact string compare), candidate vs corrected.

**Changed paragraphs: §1, §2, §3, §4, §9, §10, §11, §12, §13, §14, §16** (11 of 16).
**Logged paragraphs: §1, §2, §3, §4, §9, §10, §11, §12, §13, §14, §16.**

Sets are identical. Every logged `Before` string is byte-identical to the corresponding candidate
paragraph and every logged `After` string is byte-identical to the corresponding corrected paragraph
(verified by script, all 11 sections true/true). Nothing unlogged, nothing claimed but unmade.
§5, §6, §7, §8, §15 are untouched, as the log's "Unchanged" section states.

## 2. Structure and mechanics

| Check | Result |
|---|---|
| JSON valid | Pass (`json.tool`) |
| Keys / chapter number / title | `number` 146, title identical to source, unchanged |
| Paragraph count | 16 = 16 = 16 (source / candidate / corrected) |
| Order | unchanged |
| Empty or whitespace-only paragraphs | none |
| Leading/trailing whitespace, doubled spaces | none |
| Curly quotes (`“ ” ‘ ’`) | **0** — the 4 introduced in §11 are gone; file is straight-double throughout |
| Non-ASCII inventory | `—` only (26 spaced em dashes, baseline convention; chapter-wide dash normalisation correctly routed out of scope) |
| Question-mark parity vs source | exact in every paragraph (§8 3/3, §12 3/3, §13 2/2) |
| Exclamation-mark parity vs source | exact except §14 (see New findings) |
| Word-count ratio vs source | 0.93–1.12, no paragraph below the 75% floor |

## 3. Per-change verdicts (re-derived from the source, not the log)

All eight MODERATE fidelity findings were checked against the Maude text directly.

| § | Change | Re-derived from source | Verdict |
|---|---|---|---|
| 1 | "Although he had been firmly convinced… and happy…, all the zest of such a life vanished" | "Firmly convinced as he was… and happy as he had been…—all the zest of such a life vanished" | **Correct.** Concessive restored, dash-splice gone, main clause now findable on first pass. "zest", "such a life", "such passion", "the engagement of Andrew and Natasha", "the death of Joseph Alexeevich" all match the source. |
| 1 | "unexpectedly loathsome" | "unexpectedly loathsome" | **Correct.** Restores the echo with "without any apparent cause". |
| 1 | benefactor named once | source withholds the name until "the death of Joseph Alexéevich" | **Correct.** The apposition is dropped and the single naming now falls exactly where the source puts it. |
| 1 | "speak severely to him", "compromising her" | same in source | **Correct.** Both sharpenings undone. |
| 2 | catalogue of sights restored as cause: "…the Moscow balls, and the English Club — and felt himself at home in a quiet haven." | "as soon as he entered… as soon as… he saw… when he saw those old Moscow ladies… he felt himself at home in a quiet haven" | **Correct and complete.** The invented "as soon as he arrived" trigger is gone; the accumulation of sights is again what produces the feeling, while the stacked subordination stays broken up for readability. No meaning added. |
| 2 | "snow untouched by traffic" | "snow undisturbed by vehicles" | **Correct.** Restores the dropped agent. |
| 3 | "old women", "most intellectual", "most magnanimous" | same in source | **Correct.** "grandmothers" (unstated kinship) and both narrowings undone. "jolliest" for "merriest" and "eccentrics" for "cranks" remain — defensible modernisations, no drift. |
| 4 | "Benefit performances", "sprees" | same in source | **Correct.** |
| 9 | "grumbling about the government a bit as he unbuttoned his waistcoat" | "as he unbuttoned his waistcoat, of abusing the government a bit" | **Correct.** The hedge "a bit" is back and the parenthetical no longer splits "fond of X and of Y". The waistcoat clause keeps its simultaneity. |
| 9 | "he was one of those same" | "he was one of those same" | **Correct.** |
| 10 | "he was shocked by the thought of how many others… entered this life and this club temporarily, with all their teeth and hair still in place" | "he was shocked by the thought of how many, like himself, had entered that life and that club temporarily, with all their teeth and hair" | **Correct.** The ungrammatical "realization that how many" is repaired to the source's own construction; the scare quotes (explicit irony the source leaves implicit) are removed; the "full head of teeth" malapropism is gone. "still in place" is a small readability addition that asserts nothing the source does not. |
| 11 | straight quotes; "he thought" / "In moments of humility he told himself:"; "But" back inside the quotation; "something different" removed | "…satisfied with their position, “while I am still discontented…" / "…to the condition I am in,” said he to himself in moments of humility" | **Correct.** The split into two attributed quotations is a legitimate restructure: both limbs are present, the humility attribution stays on the "But perhaps…" thought where Maude puts it, the contrastive "But" is Pierre's again, and the added narratorial gloss is gone. This also answers the Gate A "unframed person shift" finding. |
| 11 | "of birth" | "society, and race" | **Correct** (the review's own first proposal). Keeps heredity rather than the candidate's environment-shift to "upbringing", and avoids the modern reading of "race". |
| 11 | "despised", "contented fellows", "to the state I'm in" | same in source | **Correct.** Internal "despised…despised" echo restored, added judgment and added emphasis removed. |
| 12 | "moments of despair, hypochondria, and disgust with life"; "such acute attacks" | identical to source | **Correct on fidelity.** "self-loathing" was simply the wrong sense; the corrector took the source's own word rather than the review's paraphrase, and correctly moved "acute" off the invented "bouts" and back onto "attacks", undoing "violent". See New findings for the reader-facing cost. |
| 12 | "the meaning of the phenomena of life"; "the town's gossip" | same in source | **Correct.** |
| 13 | "and to which he was himself accustomed" | "accustomed as he was to it" | **Correct.** The habituation is Pierre's again, and the concession (habituated yet astonished afresh) is back. This was the near-MAJOR agent shift; it is fully resolved. |
| 13 | "a charter that nobody needs and whose meaning not even the man who wrote it understands" | "a charter that nobody needs, and the meaning of which the very man who wrote it does not understand" | **Correct.** The stranded verb now has its object; nothing added. |
| 13 | "swear by the blood"; "the collections for the poor"; "knouted to death"; "I understand the deception" | same in source | **Correct**, all four. "Understand" vs the following "all that I see" distinction is restored. |
| 13 | "He frequented every kind of society" | "He frequented every kind of society" | **Correct.** |
| 14 | "a readiness to respond superficially to any idea without probing it deeply" | "a readiness to respond superficially to every idea without probing it deeply" | **Correct.** "superficially" restored and the softening "too" removed; the claim is no longer doubly weakened. |
| 14 | "gossip in the drawing rooms of the club"; "carousals… carousals" | "gossip in drawing rooms of the club"; "carousals" twice | **Correct.** One location again, and the "drinking…wine" tautology is gone. |
| 14 | "always conscious of some thread of that skein as, with a buzzing in his head after dinner or supper, he chatted, listened to conversation, or read" | "always conscious of some aspect of that skein, as with a buzzing in his head after dinner or supper he chatted or listened to conversation or read" | **Correct.** Hedge "vaguely" gone and the dangling participle re-attached to his head, not the thread. |
| 16 | "entrenched under the enemy's fire"; "save oneself from it" | same in source | **Correct.** |

**No change introduced new drift.** Every edit moves toward the source; none adds an event, a motive or a
judgment the source lacks.

## 4. Paragraphs the correction opened for the first time — fresh read

§9, §12, §13 and §14 were opened by this pass after a full-chapter fidelity read surfaced defects in them.
Read straight through as a new reader:

- §9 is now a clean list ("fond of eating and drinking and of grumbling about the government a bit as he
  unbuttoned his waistcoat"); the earlier held-open construction is gone.
- §12 reads cleanly; the malady named in sentence one is the one referred back to in sentence two, which is
  what the candidate had broken.
- §13, the long interior monologue, holds together end to end. The Masons sentence now lands its point, and
  "So thought Pierre, and this whole universal deception — which everyone accepted, and to which he was
  himself accustomed — astonished him afresh each time" is the paragraph's hinge and now says the right thing.
- §14's skein sentence is the hardest in the chapter and is now parseable on one pass.

Accessibility findings from the candidate review: §1, §9, §10, §11 `hard` — all four answered by the
corresponding edits above. §13 `unclear` (the Napoleon / Emperor Francis sentence) was ruled
author-intrinsic irony and left identical to the source; I concur — the source says exactly this, and any
repair would be a claim Tolstoy does not make. §1 "the Brothers" left unglossed per the editor's ruling;
"Masonic dinners" three paragraphs later still carries it, so this stays a MINOR at worst.

**No MAJOR or MODERATE finding remains open.** MAJOR was 0 before the pass; all 8 MODERATE are fixed;
of the 20 MINOR, the log answers 17 and consciously routes 3 (chapter-wide em-dash convention, "the
Brothers" gloss, Napoleon sentence). The 4 COSMETIC items ("seven years ago" in §9, flipped pairs and
"ever" in §4, dropped "it" in §10 and scare-quoted "later" in §14, split sentence in §15) are untouched
and remain cosmetic.

## 5. New findings (none blocking)

1. **MINOR — §14, lost exclamation.** Source: "I'll think it all out later on!" Corrected: "I'll think it all
   through later." This is the chapter's only per-paragraph punctuation-parity break (all `?` and the other
   `!` match exactly). The sentence was genuinely restructured and the loss predates this pass — the
   candidate and baseline are the same — but §14 was open, so it could have been taken. Bravado flattened,
   meaning intact.
2. **MINOR — §12, "hypochondria" as a false friend.** Fidelity-exact (Maude's word), and strictly better
   than the candidate's wrong-sense "self-loathing". But in present-day English the word means health
   anxiety, not morbid low spirits, so a modern-EN reader is likely to take the wrong sense. The fidelity
   review's own proposals ("black moods", "melancholy") carry the intended meaning. Recommend picking this
   up in the chapter-wide glossary/false-friend pass rather than reopening the chapter.
3. **MINOR — §11, "quite different from and distinct from".** Source is "quite different and distinct from".
   Clunky duplication of the preposition; carried over from the candidate, not introduced here.
4. **Observation — §13, "rival Masonic lodges".** An added gloss, not source text; explicitly cleared by the
   fidelity review as minimal and category-only. Unchanged by this pass. Noted so it is not rediscovered later.
5. **Observation — §5/§6 French handling** (English inline plus "(in French)" cue, French in the footnote
   slot) inverts the source's arrangement. Unchanged by this pass and cleared as the decided convention.

## 6. Conclusion

Log and diff agree exactly. All eight MODERATE findings and all four accessibility `hard` findings are
answered from the source, correctly and completely, including in the paragraphs this pass opened for the
first time. Structure, ordering, punctuation parity and quote convention are clean. The three remaining
items are MINOR and belong to a chapter-wide pass, not another round on this chapter.

Verification: ACCEPT
sha256: 3f9ea658f11285ba1014481d167ecadd492ee77a6acd6742324c8e56731e68e3
