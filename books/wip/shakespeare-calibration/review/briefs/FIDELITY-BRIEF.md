# Shakespeare calibration — source-fidelity review brief

You are an independent **source-fidelity reviewer**. You did not draft these proposals. Read `../STANDARD-DRAFT.md` first.

## Materials

- `review-packet-<PLAY>.md`, for your play only (LR = King Lear, TN = Twelfth Night, MV = The Merchant of Venice). It has three passages. For every paragraph it gives:
  - the ORIGINAL (Gutenberg lineation);
  - the CURRENT live Tinct Modern English;
  - the PROPOSED Modern English;
  - the drafter's unit map and reasons.
- The full sources: `../../src/pg1532.txt` (King Lear), `../../src/pg1526.txt` (Twelfth Night), `../../src/pg1515.txt` (The Merchant of Venice).
- You may use public-domain annotations: Schmidt's *Shakespeare-Lexicon* on Perseus, Onions (1911) and Furness *Variorum* volumes. **Never consult a copyrighted modernization.**

## For every proposed paragraph, check against the original

- **Omission:** a clause, image, name, oath, qualification or joke dropped.
- **Invention:** content, motive or emotion added that the original does not state or clearly imply. Short glosses that unpack the original's meaning are fine.
- **Mis-gloss:** a wrong reading of a word, idiom, referent or speaker's meaning.
- **Pun and bawdy:** a double meaning flattened or lost; bawdy, insult or prejudice softened or sharpened.
- **Ambiguity:** a deliberate ambiguity resolved, or a crux decided without the choice being noted.
- **Voice:** register or dramatic voice lost, or anachronistic slang used.
- **Units:** the unit map pairs text that does not correspond.
- **Reasons:** a claimed "defect in the current text" that is not real, or a gloss the drafter justifies wrongly.

Also judge, per passage, whether the proposal meets the standard better than the current text, and whether anything in the current text was better and should be kept.

## Output

Write JSON to `/tmp/claude-0/-home-user-tinct/781378ba-275b-5897-8531-920676c586a7/scratchpad/out/calib-fidelity-<PLAY>.json`:

```json
{"reviewer": "CF-<PLAY>", "passages": [
 {"passage": "LR-A", "verdict": "accept" | "accept-with-fixes" | "reject",
  "better_than_current": true,
  "findings": [{"id": "11.1", "category": "mis-gloss", "severity": "must-fix" | "should-fix" | "note",
    "original": "<words>", "proposed_text": "<words>", "issue": "...", "fix": "<replacement words or sentence>"}],
  "current_defects_confirmed": ["..."], "current_defects_disputed": ["..."]}
]}
```

Read every paragraph, including those marked keep: a keep can hide a defect the drafter missed. Validate the file with `python3 -m json.tool`. Your final message should give a verdict per passage and counts by severity. Do not edit any other file, and do not run git.
