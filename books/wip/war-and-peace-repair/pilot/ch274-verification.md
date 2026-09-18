Model: opus

# Verification — ch274 (Book Twelve, Chapter 11)

Independent verification. I did not draft, review or correct this chapter.
Files compared with Python (`json.load`, per-paragraph string equality), not by reading the log.

- Source: `ch274-source.json` (19 paragraphs)
- Pre-correction: `ch274-candidate.json` (19 paragraphs)
- Corrected: `ch274-corrected.json` (19 paragraphs)

## 1. Diff vs. log

Paragraphs that differ between `ch274-candidate.json` and `ch274-corrected.json` (0-based):

**0, 2, 3, 7, 9, 10, 12, 18** — 8 paragraphs.

Corrections log claims entries for indices 0, 2, 3, 7, 9, 10, 12, 18 — 8 entries.

**Match: exact.** Every logged change appears in the file; every changed paragraph is logged. No unlogged edits, no claimed-but-absent edits. No blocking finding.

## 2. Per-change verdicts (re-derived from source, not from the log)

| # | Change | Source reading | Verdict |
|---|--------|----------------|---------|
| 0 | dropped "—the tall, stiff military caps of the day" after "shakos" | "...high boots and shakos." | **Correct.** The only added text in the chapter is gone; nothing else in the paragraph moved. No new drift. |
| 2 | "boy of about eighteen" → "boy of eighteen" | "a thin, sallow-faced lad of eighteen in a loose coat" | **Correct.** Hedge removed, age now stated flatly as in source. "loose coat" rightly kept here (source has *coat* at this paragraph). |
| 3 | "people rush to finish" → "people hurry to finish" | "but as people hurry to finish" | **Correct.** Triple *hurry* restored; rest of sentence untouched. |
| 7 | "all the faces that met his" → "all the looks that met his" | "The same question was expressed in all the looks that met his." | **Correct.** Restores *looks*, and keeps it distinct from *faces* in the next paragraph, as the source does. |
| 9a | "he was saved" → "he himself was saved" | "Pierre did not understand that he was saved" | **Correct and minimal.** Answers the pronoun-ambiguity finding (nearest antecedent was "the fifth prisoner", who is about to be shot). *himself* adds no meaning the source lacks — it only fixes the referent. |
| 9b | "watched what was happening" → "gazed at what was happening" | "he gazed at what was taking place" | **Correct.** Restores *gazed*, pairing with paragraph 16 ("Pierre gazed now with dazed eyes"). |
| 9c | "factory boy in the loose coat" → "...loose cloak" | "The fifth man was the factory lad in the loose cloak." | **Correct.** Source's coat(¶2)/cloak(¶9,¶10) alternation restored. |
| 9d | "thought it hard to believe that men could kill him" → "thought it unbelievable that men would kill him" | "whether he thought it incredible that men should kill him" | **Correct.** *unbelievable* restores the force of *incredible*; *would* restores the normative sense of *should* (that men would do such a thing), not capability. Disbelief motif now matches ¶6. |
| 10 | "loose coat" → "loose cloak" | "he wrapped his loose cloak closer" | **Correct.** |
| 12 | "sank down on the ropes that held him" → "...on the cords that held him" | "sank down on the cords that held him ... the ropes slackened" | **Correct and complete.** Only the first occurrence changed; "the ropes slackened" left as in source. |
| 18 | "some comfort" → "some relief" | "trying to find some relief after what had been done" | **Correct.** Echo with ¶9 ("no sense of joy or relief") restored. |

All eight corrections are right, complete for what they claim, and introduce no new drift. No correction damaged readability; no correction sharpened, dropped or added meaning.

## 3. New-reader re-read of changed paragraphs

All eight read clearly. Index 9 is the meaningful gain: "Pierre did not understand that he himself was saved" now lands on Pierre on first reading, where before it pointed at the fifth prisoner, who is about to be shot. Index 0 loses a gloss but "shakos" is carried by its context ("blue uniforms with red epaulets, high boots, and shakos") and no reader is stranded. "cloak"/"cords" reintroduce source variation without ambiguity — the garment and the bindings are unmistakable from context in both places.

## 4. Structure

- Paragraph count: source 19 · pre-correction 19 · corrected 19. **Match.**
- Order: every paragraph N of the corrected file still corresponds to source paragraph N. No merges, splits or reorderings.
- `number` (274) and `title` ("Book Twelve (1812) — Chapter 11") unchanged from source.
- No empty or whitespace-only paragraphs; no leading/trailing whitespace; no doubled spaces.
- Question-mark and exclamation-mark parity against source: **zero mismatches across all 19 paragraphs.**
- Quote marks balanced in every paragraph; straight quotes throughout, no curly-quote contamination; em dashes unspaced per convention.
- Word-count ratio vs. source is 0.90–1.04 across all paragraphs — no paragraph is condensed.

## 5. New findings

None blocking. Three non-blocking observations:

1. **Three MINOR fidelity findings remain unapplied** and are logged as such: index 4 "scarf"→"sash", index 8 ("inner" and "feelings" added, "were in"→"filled"), index 13 "certainly"→"unmistakably". Each is a local one-word-class fix, and the correction prompt would allow them; the corrector declined them as outside the editor's authorized six-word list. That is a defensible scope call, not an error, but index 13 is the chapter's hinge sentence and "certainly" (the killers' own certainty) vs "unmistakably" (how evident it was to an observer) is the one of the three worth revisiting in a later pass. None of them changes a claim, sequence or fact, so none justifies another round.
2. **Editor rulings respected.** The musket counts (twelve / eight / twenty-four, indices 6, 12, 15) and "That will teach them to start fires" (index 17) are unchanged in the corrected file, as ruled. Verified against source: all four are Tolstoy's own.
3. **No collateral edits.** The eleven unchanged paragraphs are byte-identical between candidate and corrected file.

## 6. Answer for a new reader

Every paragraph is now clear on a first reading; the only remaining friction is Tolstoy's own — the firing-squad counts (twelve, eight, twenty-four) and the unexplained arson charge — which is source-faithful and must stay.

sha256: 6f2a6734bebe070af08870a93a7bb4161dcfb8618edf72e035a8e2873ad19681

Verification: ACCEPT
