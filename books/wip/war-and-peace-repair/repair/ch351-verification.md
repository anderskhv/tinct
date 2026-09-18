Model: opus

# Verification — chapter 351 (First Epilogue, Chapter 14)

Independent verifier. I did not draft, review or correct this chapter.
Files: `ch351-source.json` (Maude), `ch351-candidate.json` (pre-correction), `ch351-corrected.json`, `ch351-corrections-log.md`, `ch351-fidelity.md` (context only).
Paragraph numbers below are **1-based** (JSON index = N−1).

## 1. Diff — candidate vs corrected

Computed by paragraph-wise string comparison of the two JSON files (not from the log).

Changed paragraphs: **¶6, ¶10, ¶11, ¶21, ¶24, ¶29, ¶30, ¶32, ¶38, ¶41** — 10 of 52.

Log entries: ¶6, ¶10, ¶11, ¶21, ¶24, ¶29, ¶30, ¶32, ¶38, ¶41 — 10 entries.

**Match: exact.** No unlogged edits, no claimed-but-absent edits. No mismatch findings.

## 2. Per-change verdicts (re-derived from the source, not from the log)

| ¶ | Source reading | Corrected reading | Verdict |
|---|---|---|---|
| 6 | "You and I haven't seen anything of one another yet.... How like he is growing, Mary!" | identical wording inside the modernised frame | **PASS.** The idiom is right again — not having spent time together, not not having examined each other — and "How like he is growing" is back to the source's open, still-in-progress resemblance, which is what makes the boy's answering "Like my father?" a reply rather than an echo. |
| 10 | "now one must dance with Tatáwinova and Madame Kwüdener"; "they should let that fine fellow Bonaparte loose"; "the Semënov wegiment"; **no narrator aside** | "now one has to dance with…"; "they should let that fine fellow Bonaparte loose"; "the Semenov wegiment"; aside deleted | **PASS on all four.** The invented sentence ("Tatáwinova and Krüdener were fashionable mystics of the day, and Eckartshausen a mystical writer of the same stripe.") is gone in full — I checked the whole corrected chapter for any relocated version of it and there is none. With it goes the impediment-in-narration defect, which is now moot. "dance attendance on" → "dance with" restores literal dancing. "just"/"again" removed from the Bonaparte line. "Semyonov" → "Semenov" is the conventions-file stress-mark drop rather than a phonetic respelling. |
| 11 | "he thought it necessary to take an interest in these things and to question Pierre" | "he thought it necessary to take an interest in these things, and questioned Pierre" | **PASS.** Motive restored (necessity, not duty); "closely" removed. |
| 21 | "Magnítski, Arakchéev, and tutti quanti...." | "Magnitsky, Arakcheev, and tutti quanti—and all the rest...." | **PASS.** Both men are named again and the invented "Arakcheev's ally" relation is gone. This was the chapter's worst defect and it is properly repaired, not patched: Arakcheev's first appearance is restored, so his two later appearances (¶32 Military Settlements, ¶41 the order to cut Pierre down) now land as recurrences of a name the chapter has introduced. "and all the rest" is an inline English rendering of the retained Italian tag — the same operation the batch allows for *mot d'ordre* and *Memento mori*, adding no claim. Accepted. |
| 24 | "flogging, drilling, and Military Settlements; the people are tortured, enlightenment is suppressed" | "flogging, drilling, and Military Settlements; the people are being tormented, enlightenment is being crushed" | **PASS.** The encyclopedia parenthesis inside Pierre's angry spoken sentence is gone, and "education" is back to "enlightenment" — the wider idea the sentence needs, since it is paired with the crushing of "everything young and honest". |
| 29 | "Why? Let him be"; "to withstand the general calamity" | identical sense | **PASS.** "Let him stay" (permission to remain) → "Let him be" (leave him alone), which is the source's act; and the calamity is general again — falling on everyone, which is the premise of the join-hands argument that follows — with the added "coming" removed. |
| 30 | "Nicholas, who had left his nephew" | identical | **PASS.** He moves away; he was never holding the boy. |
| 32 | "to prevent some Pugachëv or other from killing my children and yours" | "to stop some Pugachev or other from murdering my children and yours" | **PASS.** The self-contradictory gloss is gone in full and the bare name stands as the source leaves it. Nothing was substituted in its place. |
| 38 | "let us have a bunt of our own. That's all wight." | "let's have a wevolt of our own. That's all wight." | **PASS on the logged fix.** "That's all wight" is restored, which returns both the impediment token and the run-up to the punch line "Je suis vot'e homme!" See finding 5.1 on the untouched half. |
| 41 | "everything here is rotten and that an overthrow is coming"; "our oath of allegiance is a conditional matter, and to that I reply" | identical | **PASS.** "overthrow" (agents acting) restored over "collapse" (none) — which is the actual subject of the argument between the two men; "some kind of" and "to you directly" removed. |

No correction overshot, and none introduced a new departure from the source.

## 3. Denisov's impediment — checked line by line

Every paragraph in the corrected file containing Denisov speech was read against its source paragraph.

- **¶10** — "Tatáwinova", "Kwüdener", "wead Ecka'tshausen", "the bwethwen", "Semenov wegiment", "Schwa'tz". All present. The stress accent on "Tatáwinova" matches the source's own spelling and sits inside his speech, where it belongs.
- **¶19** — "Well, what would you do?" asked Denisov. The source line carries no impediment token either; correctly left alone.
- **¶38** — "my fwiend", "vewy well", "pwonounce", "I agwee", "evewything", "wotten and howwible", "wevolt", "That's all wight", "vot'e homme". All present, and the impediment is correctly carried onto "wevolt" as the replacement word.

**Confirmed: the impediment is intact in every line Denisov speaks, and it no longer appears anywhere outside his speech** — the one place it had escaped into narration (the ¶10 aside) no longer exists.

## 4. Structure and punctuation

- Paragraph count: source 52, candidate 52, corrected 52. Order unchanged.
- Chapter number and title identical across all three files ("First Epilogue (1813 - 20) — Chapter 14").
- Both footnote slots preserved: ¶22 "* Without faith or law." for *sans foi ni loi* (¶21), ¶39 "* 'I'm your man.'" for *Je suis vot'e homme!* (¶38). Both markers still sit on their phrases after correction — ¶21 and ¶38 were both edited, so I re-checked these specifically.
- No empty or whitespace-only paragraphs.
- Per-paragraph `?` and `!` parity against the source: **all 52 paragraphs match.** Note this held through the deletion of the invented ¶10 aside, which was declarative.
- Em dashes: 20 unspaced, 0 spaced — consistent with the conventions file and with chapter 349.
- No paragraph falls below 75% of its source word count. The three deletions (mystics aside, Military Settlements parenthesis, Pugachev gloss) remove only added material.
- JSON parses.

## 5. Findings

No blocking findings.

- MAJOR remaining: **none.** All three are fixed — the invented mystics aside (¶10) is deleted, the "Arakcheev's ally" gloss (¶21) is gone with both men restored to the list, and the Pugachev explanation (¶32) is deleted.
- MODERATE remaining: **none.** "dance attendance on" (¶10) corrected, the impediment-in-narration (¶10) moot with the aside deleted, the Military Settlements definition (¶24) removed.
- MINOR remaining: one partial, below.

**5.1 — MINOR, carried forward, non-blocking.** The ¶38 finding had two halves: the lost impediment token in "That's all wight", and the removal of the Russian word *bunt* in favour of "wevolt". The log claims and the file delivers only the first; *bunt* is not restored. The log is honest about this — it records the editor ruling as restoring "That's all wight" — so this is a disclosed partial application of a MINOR finding, not an undisclosed gap, and the review itself judged that the voice survives because the impediment is carried onto the replacement word. Leaving *bunt* out is defensible for a modern-English edition and restoring it would need a footnote slot the chapter does not have. Not blocking; noted for the batch's Russian-term pass if one is run.

- Glosses in the shipped file: "mot d'ordre" → "watchword" (¶29) and "tutti quanti—and all the rest" (¶21), both inline translations of short foreign phrases, permitted; the two French footnote phrases are untouched, which is correct since the French pass is a separate scripted operation. The Tugendbund parenthesis at ¶34 is the source's own. After correction the chapter contains **no** narratorial explanation of a political or religious name — Tatarinova, Krüdener, Eckartshausen, Magnitsky, Arakcheev, Pugachev and the Military Settlements all stand unexplained, as the source leaves them, which restores the eavesdropping register the review identified as the thing being lost.

Verification: ACCEPT
sha256: d0fe85489756ad8bc41f59485d75e9383ab070c16aa559a998ac4d353694c9c8
