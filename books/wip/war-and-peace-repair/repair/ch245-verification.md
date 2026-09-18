Model: opus

# Chapter 245 — Book Eleven (1812), Chapter 16 — independent verification

Files verified: `ch245-candidate.json` (pre-correction), `ch245-corrected.json`, `ch245-corrections-log.md`, `ch245-source.json`. `ch245-fidelity.md` was read for context only; every verdict below was re-derived from the source, not from the log. I did not draft, review or correct this chapter.

## 1. Diff vs log

Python paragraph-by-paragraph diff of candidate against corrected (0-based indices, matching the log's numbering):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 2 | yes | yes |
| 4 | yes | yes |
| 6 | yes | yes |
| 7 | yes | yes |
| 9 | yes | yes |
| 10 | yes | yes |
| 11 | yes | yes |
| 16 | yes | yes |
| 22 | yes | yes |
| 28 | yes | yes |
| 30 | yes | yes |
| 33 | yes | yes |
| 35 | yes | yes |
| 36 | yes | yes |
| 39 | yes | yes |
| 42 | yes | yes |
| 43 | yes | yes |
| 45 | yes | yes |
| 46 | yes | yes |
| 49 | yes | yes |
| 54 | yes | yes |

Twenty-one paragraphs changed; twenty-one logged. Set equality exact. Every log **Before** block matches the candidate paragraph verbatim and every **After** block matches the corrected paragraph verbatim (42/42). **No mismatch.**

Non-paragraph structure (`number` 245, `title` "Book Eleven (1812) — Chapter 16", key set) is identical across source, candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶28 — MAJOR. Correct, and this is the decisive one.**
Source: "…so abominable, so… I don't know what. **Are we despicable Germans?**"
Corrected: "…so horrid, so vile, so… I don't know what! **Are we despicable Germans?**"
The candidate's "Are we as coldhearted as they say Germans are?" is gone entirely. Checked against the source clause by clause: the identity question is restored as an identity question, not a question of degree; "despicable" is back in place of "coldhearted"; and the hearsay attribution "as they say", which the source never makes, is removed. Nothing was added in its place. This is the plain question the reviewer asked for, and it is the moral hinge of the chapter. No new drift.

**¶6 — MODERATE (four losses in Berg's speech). Correct on all four, and complete.**
Source: "which they—which it" (he corrected himself) "has shown or displayed in the battle of the twenty-sixth"; "far from having to urge the men on or anything of that kind"; "those… those… yes, those exploits of antique valor"; "we, the commanders".
Corrected restores every one: "has shown or displayed"; "or anything of that kind"; "those… those… yes, those exploits of antique valor"; "we, the commanders". The added evaluative "heroic" before "feats" is also gone ("exploits"), and "ancient" is back to "antique". Berg's padding is again unstoppable, which is the joke. Checked that no *new* padding was invented: none.

**¶42 — MODERATE (failed gloss). Correct.** The inserted explanation "— the old saying for children who outgrow their elders —" is deleted outright, as the reviewer proposed. The proverb now stands as the source leaves it, and the wrong paraphrase goes with it. Also restored from source: "muttered through tears of joy" attached to the count, and "hide her look of shame on his breast" in place of the candidate's "embarrassed face against his chest".

**¶45 — MODERATE. Correct.** Source's two-step structure is rebuilt in full: "…it had **not seemed strange to anyone** that the wounded should be left behind and the goods carted away, **but that had seemed the only thing to do.**" "To anyone" is back, and the echo of "the only thing that could be done" earlier in the same sentence — Tolstoy's point about how fast the obvious changes — is audible again. Verified word for word against the source clause.

**¶46 — MODERATE ×2. Correct on both.** (a) "The news that carts were to be had spread to the neighboring houses, from which wounded men began to come into the Rostovs' yard" — the content of the news, the origin in those houses, and the destination (the family name, its last use in the chapter) are all restored; the candidate's "arriving from down the street" is gone. (b) "still they went on searching for and finding possibilities of unloading this or that and letting the wounded have another and yet another cart" — the doublet is back and the repeated unit is again the *cart*, not the man. No new drift.

**¶7 — MODERATE. Correct.** "an intent gaze that confused him" — the narrated fact is restored; the candidate's hedge "seemed to confuse" is gone.

**¶2, ¶4, ¶9, ¶10, ¶11, ¶16, ¶22, ¶30, ¶33, ¶35, ¶36, ¶39, ¶43, ¶49, ¶54 — MINOR. All correct, all source-anchored.** Spot-checked each against the source: "nothing to do in Moscow" restored (¶2 — the candidate's "no real business" over-read the sentence); "ran… though impatient" restored (¶4); the "Mamma" spelling normalised to the source's form across ¶4, ¶10, ¶22, ¶33, ¶35, ¶39, ¶43; "hurriedly… remained standing" restored (¶9); the gloss "our old steward" cut back to the bare tag "the steward" (¶11); "pulls out and has a secret English drawer" restored (¶16 — the candidate had rebuilt it as "a pull-out drawer with a secret English compartment", a different object); "was pacing up and down the room" restored (¶30); "put his face closer to the window" restored (¶36); "rapturous excitement" restored (¶49); and "Count Peter" restored at ¶54 against the candidate's "Petya". On ¶54 I checked the surrounding paragraphs specifically: ¶55 is "You'll sit on the box, won't you, Petya?", so the formal "Count Peter" is disambiguated by the very next line and reproduces the source exactly. Correct call.

No correction introduced a claim, attribution, number, or evaluation absent from the source.

## 3. Readability of the changed paragraphs

Re-read cold, all twenty-one are clear. ¶6 is deliberately hard to follow in places — that is Berg's speech falling over itself, and it is the source's effect, not an obscurity introduced here; the em-dash framing of the narrator's asides keeps his interruptions legible. ¶45's restored two-step sentence is long but tracks cleanly on one reading because the "just as… but that had seemed" pivot is explicit. ¶16's restored chiffonier keeps its inline tag "— a chest of drawers —", so the object is still clear to a reader who does not know the word.

## 4. Structure and punctuation

- Paragraph count: source 57, candidate 57, corrected 57. Order unchanged; the 36 unchanged paragraphs are byte-identical to the candidate.
- No empty or whitespace-only paragraphs.
- Question/exclamation parity with source: 53 of 57 paragraphs exact. Four differ, and **none was introduced by this round** — all four are pre-existing candidate readings in paragraphs the corrector either did not touch or touched elsewhere:
  - ¶16 (+1 "?"): "Please let me have one" → "Could you let me have one?" — a polite request rendered as a polite question. Same speech act. MINOR.
  - ¶20 (+1 "!"): the source's trailing "the devil, the devil, the devil…" becomes "…the devil!" — an ellipsis read as an exclamation. MINOR.
  - ¶26 (+1 "?"): indirect question rendered direct, "he meant: what were their parents quarreling about?" Meaning preserved. MINOR.
  - ¶28 (+1 "!"): "so… I don't know what!" for the source's full stop. Defensible under "almost shouted", but it does add emphasis the source withholds. MINOR.
  None is meaning drift; all four are register. Recorded, not blocking.
- Valid JSON; keys `number`, `title`, `paragraphs`.
- Word-count ratio against source 96% (candidate 95%); no paragraph below the 75% floor.

## 5. Terminology ruling — "trap"/"carriage"

Ruled against the source across both chapters, as asked.

**Verdict: MINOR. Not MODERATE. The corrector was right to leave it.**

In this chapter the source's "trap" appears twice (¶3 Berg's "spruce little trap", ¶47 the steward's) and the corrected text keeps "trap" both times — so chapter 245 is faithful and internally consistent on its own terms. The inconsistency is only visible against chapter 252, which renders the police superintendent's "trap" as "carriage". I checked the two chapters: they are different scenes, different owners, different vehicles, with no cross-reference between them, so no reader tracking a vehicle through the narrative is misled. Nothing is added or dropped; at worst 252 flattens a light two-wheeler to the superordinate "carriage". See `ch252-verification.md` §5 for the ruling on that side. A later consistency pass could align them, but it is not a fidelity defect.

## 6. New findings

- **MINOR, non-blocking (pre-existing, not touched).** ¶11 keeps an inline gloss, "One misses Mitenka, the steward, at times like these", where the source has only "Mitenka". The corrector correctly cut the candidate's evaluative "our old steward" back to a bare category tag, which is the established policy, so the residue is admissible; noting it only because the source carries no apposition at all.
- No new drift was introduced by any of the twenty-one corrections. No MAJOR or MODERATE finding from `ch245-fidelity.md` remains outstanding: the MAJOR (¶28) and all six MODERATE (¶6, ¶7, ¶42, ¶45, ¶46 ×2) are addressed and verified against the source.

Verification: ACCEPT
sha256: ed83c680149dbdb35c98bbc96570802b8f0cffd7de889d8d978c776fdeab810f
