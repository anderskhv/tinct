Model: opus

# Chapter 290 (Book Thirteen — Chapter 11) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch290-candidate.json` vs `ch290-corrected.json`; every change re-derived from
`ch290-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **0, 2, 3, 5, 7, 8, 10, 13, 15, 18, 19, 21, 22, 23, 25, 26, 28, 30, 31** — 19 paragraphs.
Log entries: **0, 2, 3, 5, 7, 8, 10, 13, 15, 18, 19, 21, 22, 23, 25, 26, 28, 30, 31** — 19 entries.

**Exact match. No unlogged change, no logged change missing.** Every `**Before:**` string in
the log is byte-identical to the candidate paragraph and every `**After:**` string is
byte-identical to the corrected paragraph (checked mechanically on all 19, not spot-checked).

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 0 | "definite breed or color" → "breed or definite color"; "trot along quickly" → "trot along very easily and quickly"; "a stick" → "a chip of wood" | "or even of a breed or any definite color"; "run very easily and quickly on three legs"; "playing with a chip of wood or a straw" | OK — all three MINORs answered exactly; "definite" now qualifies colour only, as in the source |
| 2 | "obvious pleasure" → "pleasure"; "amused" → "animated self-satisfaction" | "which he placed with pleasure in various positions"; "a smile of animated self-satisfaction" | OK — added intensifier removed, chapter keyword echo with ¶1 restored |
| 3 | gloss trimmed to "a spell of warm weather in autumn" | "what is called an 'old wives' summer.'" — no seasonal placing | OK — unsupported "early autumn" gone; gloss retained per the fidelity review's ruling. "spell" is new wording but carries no claim |
| 5 | "shimmer"→"glitter", "you see only in autumn"→"seen only at that time of autumn", "in the distance" restored, "delicate outline"/"unnatural clarity" re-separated, "light"→"brilliance" | "the magic crystal glitter seen only at that time of autumn"; "the corners of the white house in the distance, all stood out … in most delicate outline and with unnatural clearness"; "in the clear, motionless brilliance" | OK — four MINORs answered; the two fused qualities are distinct again |
| 7 | "Eh?" restored | "Eh? Just like spring!" | OK |
| 8 | habitual clause restored | "though whenever he offered it Pierre always declined it" | OK — the corporal's repeated offering is back |
| 10 | "a hospital" → "a permanent hospital" | "an ambulance and a permanent hospital" | OK |
| 13 | "a real man" → "a man" | "but he is a man" | OK — the added "real" is gone; the corporal's flat assertion stands |
| 15 | "for them" restored | "to make up into boots and shirts for them" | OK — the beneficiary (the French) is restored |
| 18 | **"A promise is a sacred thing!" → "A promise is own brother to performance!"** | "'A promise is own brother to performance! I said Friday and here it is, ready'" | OK — **the MAJOR is answered**. The proverb form and its actual proposition (promising and doing are kin) are both back; this is the chapter's defining characterisation of Karataev |
| 19 | "Under the uniform, next to his … body, he wore" → "He wore a long, greasy, flowered silk waistcoat next to his … body" | "He had a long, greasy, flowered silk waistcoat next to his sallow, thin bare body, but no shirt." | OK — the candidate's added inference that the waistcoat was *under the uniform* is removed |
| 21 | "examining the shirt and checking the seams" → "looked down at the shirt and examined the seams" | "without raising his eyes, looked down at the shirt and examined the seams" | OK — two finite actions restored in place of a participial gloss |
| 22 | "the proper tool" → "a tool"; "warm, round smiles" → "round smiles" | "one needs a tool even to kill a louse"; "with one of his round smiles" | OK — proverb matches the source article; added "warm" gone |
| 23 | "fabric" → "linen" | "but there must be some linen left over" | OK — the substance is named as the source names it |
| 25 | "a ruble note" → "an assignation ruble note" | "He took out an assignation ruble note" | OK — the currency detail is restored |
| 26 | "leftover material" → "leftover linen" | "the pieces that were left over" / chapter's "linen" | OK — the linen thread (¶15 → ¶23 → ¶25 → ¶28 → ¶31) now uses one substance word |
| 28 | "'Oh well!' he muttered" → "'Oh dear!' muttered Karataev"; "the cloth" → "the linen" | "'Oh dear!' muttered Karatáev and went away"; "The Frenchman looked at the linen" | OK — **the MODERATE is answered**. Dismay, not resignation; this is the only reading we get of the "suddenly changed and saddened expression" |
| 30 | "shaking his head" → "swaying his head"; "He's got nothing himself" → "He's naked" | "said Karatáev, swaying his head"; "He's naked, but yet he's given it back" | OK — swaying (Karataev's habitual gesture) restored; the paraphrase of "naked" is gone |
| 31 | "sat quietly for a while" → "was silent for a while" | "was silent awhile looking at the pieces" | OK — silence, not sitting; the candidate had invented a posture |

No correction introduced new drift. Nothing was split, merged, lengthened or shortened; all
19 edits are local word and clause restorations. No content present in both source and
candidate was dropped by the correction (checked mechanically at stem level).

## 3. Readability of changed paragraphs

Re-read as a new reader. All 19 remain clear.

- ¶18 "A promise is own brother to performance!" is the one restoration that trades ease for
  fidelity. It reads as what it is — a folk proverb — and the sentence that follows ("I said
  Friday, and here it is—ready") supplies the sense immediately. Acceptable.
- ¶22 "you need a tool even to crack a louse" is idiomatically odd but self-explaining in
  context, exactly as in the source.
- ¶21 "pushed his head and hands through without looking up, looked down at the shirt and
  examined the seams" is a slightly loose two-clause series; still unambiguous.
- ¶25/26/28 now use "linen" and "scraps" consistently; the reader can follow one substance
  through the scene, which was not true of the candidate.

## 4. Structure and punctuation

- Paragraph count 33 = 33 = 33 (source / candidate / corrected). Order unchanged.
- `number` 290 and `title` "Book Thirteen (1812) — Chapter 11" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: **clean across all 33 paragraphs**.
- No paragraph falls below 0.75 of its source word count.
- JSON valid.

## 5. New findings

None blocking.

- **Non-blocking (MINOR, quote characters):** the corrected file still mixes quote styles —
  ¶3 and ¶18 carry curly ‘ ’ while the other eighteen quoted passages use straight ' '.
  Both curly paragraphs were edited in this round, and ch294/297/298 were normalised to
  straight characters in the same round, so ch290 is now the odd file out. The fidelity
  review logged this as an "all"-paragraph MINOR. One pass of character normalisation fixes it.
- **Non-blocking (MINOR, pre-existing):** ¶22 "kill a louse" → "crack a louse" was not
  flagged by the fidelity review and is unchanged; "crack" is a defensible modernisation.
- **Non-blocking (MINOR, pre-existing):** ¶31 "the pieces" → "the pieces of cloth" adds a
  noun the source leaves implicit. Referent is unambiguous; carried over from the candidate.
- Every paragraph carrying a fidelity finding was edited; no finding sits on an untouched
  paragraph.
- The one MAJOR (¶18 proverb) and the one MODERATE (¶28 "Oh dear!") are fully answered.
  **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: 32df127e4a92dad621cac1ef7796a7742ebb4e71c0bf5ec6e039822db9538ede
