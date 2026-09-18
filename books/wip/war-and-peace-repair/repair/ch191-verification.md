Model: opus

# Chapter 191 (Book Ten — Chapter 1) — independent verification

Verifier did not draft, review or correct this chapter. Diff computed directly from
`ch191-candidate.json` vs `ch191-corrected.json`; every change re-derived from
`ch191-source.json` (Maude), not from the log.

## 1. Diff list vs log

Paragraphs changed (0-based): **3, 4, 5, 6, 7, 10, 11, 12, 15, 18, 19** — 11 paragraphs.
Log entries: **3, 4, 5, 6, 7, 10, 11, 12, 15, 18, 19** — 11 entries.

**Exact match. No unlogged change, no logged change missing.** Before/after excerpts in
the log correspond to the actual file states on all eleven.

## 2. Per-change verdicts (re-derived from source)

| ¶ | Change | Source check | Verdict |
|---|---|---|---|
| 3 | "none of them expected" → "none of them at all expected" | "a stupendous result no one of them at all expected" | OK — emphasis restored |
| 4 | "advance deep into the heart of Russia" → "advance into the heart of Russia" | "its advance into the heart of Russia" | OK — added intensifier removed; rest of the paragraph untouched |
| 5 | guesses → conjectures; predictions → conjectures; "I told you so" → "I said then that it would be so" | "so many conjectures as to the issue"; "amid their innumerable conjectures"; "I said then that it would be so" | OK — the repeated word Tolstoy then judges is restored, and the imagined quotation replaces the idiom. "innumerable conjectures" also restored |
| 6 | "The theories about" → "Conjectures as to"; foresight → conceptions; "these theories" → "these conjectures"; halfheartedly → lazily | "Conjectures as to Napoleon's awareness…"; "such conceptions"; "in flat contradiction to such conjectures"; "but very lazily" | OK — third and fourth links of the conjecture thread restored; "conceptions" no longer upgrades the claim to foresight; "lazily" (indolence) restored |
| 7 | "letting the enemy reach Smolensk" → "letting the enemy even reach Smolensk" | "letting the enemy even reach Smolénsk" | OK |
| 10 | "incredibly complex" → "a most complex"; "sharp angle" ×2 → "acute angle" ×2; despised → detested; "own military rank" → "own rank" | "a most complex interplay"; "at an acute angle… we withdrew at an acute angle"; "the detested foreigner Barclay, whose rank was inferior to his own" | OK — intensifier removed, the repeated image is now rendered one way and lines up with the later "still more acute", and the added qualifier "military" is gone. Rank relation (Barclay junior to Bagration) still correct and still consistent with ¶18 |
| 11 | "his inability to decide what to do" → "ignorance of what steps to take"; "sapped… kept retreating" → "destroyed… retired" | "his presence and ignorance of what steps to take… destroyed the first army's energy and it retired" | OK — Alexander's fault is not-knowing again, and the added iterative sense is gone |
| 12 | "which could not have been avoided" → "which we could not have refrained from" | "which we could not have refrained from had the armies been united" | OK — agent "we", which the paragraph argues about, restored |
| 15 | appositive "— Polish adjutant generals attached to the army —" removed; "dispatched them" → "dispatched these Polish adjutant generals" | "Lubomírski, Bronnítski, Wlocki, and the others of that group… dispatched these Polish adjutants general to Petersburg" | OK — MODERATE answered. The tag is back where the source puts it, so it covers everyone dispatched rather than only the three named; "attached to the army" (added) gone; "the others of that group" restored. "adjutant generals" matches the baseline's majority form |
| 18 | "contest to see who would be more magnanimous" → "contest of magnanimity"; "a Russian can't breathe" → "a Russian cannot exist" | "in this contest of magnanimity"; "Headquarters are so full of Germans that a Russian cannot exist" | OK — MODERATE answered. The suffocation image inside a directly quoted letter is gone and Bagration's own wording stands; the compressed ironic phrase is restored |
| 19 | "relations between the two commanders" → "the relations between the commanders in chief"; "condemned as utterly unsuitable a battlefield he hadn't even seen" → "condemned, as unsuitable from every point of view, the battleground he hadn't seen" | "the relations between the commanders in chief"; "condemned, as unsuitable from every point of view, the battleground he had not seen" | OK — the point that Russia had two men each acting as commander in chief is back; added intensifier "utterly" and added "even" removed; definite "the battleground" restored |

No correction introduced new drift. All eleven edits are local restorations; no paragraph
was split, merged, reordered or materially re-scoped.

## 3. Readability of changed paragraphs

Re-read as a new reader. All eleven remain clear. The restorations that raise register —
"conjectures", "conceptions", "we could not have refrained from", "as unsuitable from
every point of view" — stay inside ordinary modern English and each sits in a sentence
whose structure the candidate had already simplified, so none of them reintroduces a hard
reading. ¶6's opening now reads "Conjectures as to Napoleon's awareness… and on the Russian
side about luring the enemy…", a slightly mixed "as to / about" pairing; still unambiguous,
not worth another round.

## 4. Structure and punctuation

- Paragraph count 23 = 23 = 23 (source / candidate / corrected). Order unchanged.
- `number` 191 and `title` "Book Ten (1812) — Chapter 1" identical to source.
- No empty paragraphs.
- Per-paragraph `?` and `!` parity with source: **clean across all 23 paragraphs**.
- JSON valid.

## 5. New findings

None blocking.

- Every MINOR finding in the fidelity review was applied as well as both MODERATEs; nothing
  was left silently unaddressed, and the log's closing note matches the file.
- **Non-blocking (pre-existing, unchanged by this round):** ¶4 still splits the source's
  parenthetical hedge "(what now seems so evident)" into a standalone sentence, and ¶18
  still moves "(meaning Barclay)" outside the quotation marks. Both were checked and cleared
  by the fidelity review as acceptable/cosmetic; both remain so.
- No MAJOR finding existed. Both MODERATE findings (¶18 quoted letter, ¶15 Polish adjutant
  generals) are fully answered. **No MAJOR or MODERATE finding remains.**

Verification: ACCEPT
sha256: 6edf19d8b1e804f7e53f8b28c54585e35e47e487dfcdd002aa3a0f78c2b1c948
