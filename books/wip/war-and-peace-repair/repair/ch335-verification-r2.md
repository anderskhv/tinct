Model: opus

# Chapter 335 — round-two verification (independent)

Files compared: `ch335-corrected.json` (pre-round-two) vs `ch335-corrected-r2.json` (round two),
against `ch335-source.json`, with `ch335-corrections-log-r2.md`.

## 1. Diff list

Diffed field-by-field and paragraph-by-paragraph myself (not from the log).

- `number`, `title`: identical across source, pre-r2, r2.
- Paragraph count: 59 / 59 / 59 — unchanged.
- Changed paragraphs: **[18]** — exactly one.

Log check: the log contains exactly one entry, `## 18`. Its `Before:` string is byte-for-byte
identical to pre-r2 paragraph 18, and its `After:` string is byte-for-byte identical to r2
paragraph 18 (verified by string equality, not eyeball). No unlogged change, no logged
change absent from the file. **No mismatch.**

## 2. Per-change verdict — paragraph 18

Source p18: “I have seen the princess,” she replied. “I heard that they were arranging a match
for her with young Rostóv. It would be a very good thing for the Rostóvs, they are said to be
utterly ruined.”

Before: "I've seen the princess," she replied. "I heard they were arranging a match for the
princess with young Rostov. ..."

After: "I've seen Princess Mary," she replied. "I heard they were arranging a match for her
with young Rostov. ..."

**Referent, re-derived from the source, not the log.** The speaker is Pierre's cousin: p15
establishes "Pierre told the princess, his cousin, that he had been to see Princess Mary the
day before"; p16 and p22 use "The princess" in narration for that cousin. So the "the princess"
*inside* her own speech in p18 cannot be herself — a speaker does not report having "seen" herself
— and the only other princess in scene is Princess Mary, whom Pierre has just named. The joke of
the passage confirms it: Pierre's "Do you know her?" (p17) means Natásha, the cousin answers about
someone else, and Pierre has to correct her in p19 — "No; I mean do you know Natásha Rostóva?"
That correction only works if her answer was about Princess Mary. The Mary / young Rostóv match is
also the match the source's own plot is arranging. **Verdict: "Princess Mary" is the referent the
source determines. Correct.**

**"for her".** Source reads "arranging a match for her with young Rostóv" — a pronoun, not a
repeated noun. Round one had substituted a second "the princess", which both departed from the
source wording and compounded the ambiguity. Round two restores the pronoun, and with "Princess
Mary" now named earlier in the same sentence the pronoun resolves cleanly to her.
**Verdict: "for her" matches the source. Correct.**

**New drift?** None. Naming Mary makes explicit what the source leaves to the reader's antecedent
tracking; it adds no fact not already in p15, drops nothing, and sharpens no meaning. The
misunderstanding beat between p17 and p19 — the whole point of the exchange — is preserved intact,
because the comedy lives in *which* woman she answers about, not in the vagueness of the noun.
The remaining sentence is untouched.

## 3. New-reader read

Clear. In round one a reader met "the princess" twice in one line while the narrator was using the
same phrase for the woman speaking; the sentence could be read as the cousin seeing and being
matched to herself. After the fix the sentence has one named subject and one pronoun pointing at
her, and Pierre's correction in p19 lands as intended.

## 4. Structure

- Paragraph count 59, matching source and pre-r2. Order unchanged.
- No empty or whitespace-only paragraphs.
- Question-mark and exclamation-mark parity against source: checked for all 59 paragraphs —
  zero mismatches. Paragraph 18: 0 `?` and 0 `!` in both source and r2.
- Quotation marks in p18 balanced (4 straight double quotes, two pairs), matching the source's
  two-sentence quoted structure.

## 5. New findings

None. Scope was held to the two words logged.

Verification: ACCEPT
sha256: 54a9d505395e9229e7109a85c35ba25207306742c6946866717688c4727b2064
