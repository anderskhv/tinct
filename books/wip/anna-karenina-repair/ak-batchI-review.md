# Anna Karenina — Batch I Independent Adversarial Review

Reviewer: independent second pass, not trusting drafter's notes at face value.
Scope: source chapters 177–197 (21 chapters), all four batch I files.

## Verdict: **ACCEPT WITH FIXES REQUIRED**

The translation content itself is faithful and clean — I found no additional
content-fidelity defects beyond the one the drafter already identified, and I
independently confirmed that fix is correct. **However, task item 1 fails:**
`ak-batchI-corrected.json` does **not** equal `ak-batchI-current-modern-en.json`,
and per the task's own file description, `current-modern-en.json` is supposed to
already be the text "AFTER this pass's one fix." It is not — it still contains
the pre-fix defective sentence. This is a real, verifiable inconsistency that
must be resolved before this batch is considered done, even though the
underlying editorial fix (once you look at the right file) is sound.

## 1. File-consistency check — FAILED

```
ak-batchI-current-modern-en.json, ch196 (idx 19), paragraph 26:
  "No, my father did; but I remember the world and know a bit about it."

ak-batchI-corrected.json, ch196 (idx 19), paragraph 26:
  "No, my father did; but I remember it, and know a bit about it."
```

Every other paragraph across all 21 chapters is byte-identical between the two
files (verified programmatically, full paragraph-by-paragraph diff, zero other
differences). So the *only* discrepancy is exactly the one paragraph the fix
was supposed to touch — but the fix only landed in `corrected.json`, not in
`current-modern-en.json`. Per the task framing, `current-modern-en.json` is
described as already being post-fix and `corrected.json` is supposed to
"equal" it — right now that's false. Someone needs to either (a) propagate the
fixed paragraph into `current-modern-en.json` so the two files match, or (b)
clarify which file is actually authoritative going forward. As it stands, if
`current-modern-en.json` is what gets published, **the defect ships unfixed**.

## 2. Verification of the claimed fix (ch196 P26) — CONFIRMED CORRECT

Source (Garnett, locked): `"No, my father had; but I remember and know something about it."`
(Levin answering Vronsky's question about whether he keeps race horses too.)

Pre-fix modern-en: `"No, my father did; but I remember the world and know a bit about it."`
— "the world" is indeed an invented, non-sequitur insertion with no basis in
the source; it breaks the sense of the line (Levin isn't talking about "the
world," he's talking about racing/horses, per the preceding exchange).

Corrected: `"No, my father did; but I remember it, and know a bit about it."`
— "it" correctly picks up the antecedent (racing/horses) from Vronsky's
question two lines earlier ("you've race horses too, haven't you?"). This
restores the sense of the source. The fix is well-chosen and defensible.

(Note: "had" → "did" and "something" → "a bit" are acceptable modern-idiom
paraphrase, not fidelity defects — they don't change meaning.)

## 3. Cited passages — verified present and unsoftened

**Anna/Dolly contraception conversation (source ch180, paragraphs ~15–46):**
Read in full against source. Nothing softened or dropped. Key beats all
intact and undiluted:
- P26: "He needn't worry about that. I shall have no more children." (source:
  "He need not trouble on that score; I shall have no more children.")
- P28: "'I will not, because I don't wish to.'" — the blunt refusal is kept.
- P34: Anna's "choice between two alternatives: either to be with child, that
  is, an invalid, or to be the friend and companion of my husband" — fully
  present, including the "practically my husband" aside.
- P39–P42: the "how can I desire children... ill-fated children... what is
  reason given me for, if not to use it to avoid bringing unhappy beings into
  the world" passage is complete, unsoftened, in full modern-English form.
- P33 `_"N'est-ce pas immoral?"_` French retained as in source.

**Vote-rigging / drunk nobleman scene (source ch185, paragraphs 17–22):**
Read in full against source. Fully intact — "Two noble gentlemen with a
weakness for strong drink had been gotten drunk by Snetkov's partisans, and a
third had had his uniform stolen" and the "doused him with water... he'll do"
exchange are present and not euphemized.

**Vronsky's resentment (source ch188, paragraphs 15–19, the Annie's-illness
letter):** Read in full against source. "This hostile tone," "the innocent
festivities... and this gloomy, burdensome love" contrast — all preserved,
tone intact, nothing blunted.

## 4. Broader independent read — no additional defects found

- Read every paragraph of all 21 chapters against source (not sampling only
  the drafter's cited passages).
- Ran an automated length-ratio scan (modern-en paragraph length vs. source
  paragraph length, flagging outliers <55% or >175% for source paragraphs
  over 40 chars) across the full batch: **zero outliers**, confirming the
  drafter's own scan result.
- Ran a numeral-presence check (all `\d+` tokens) per paragraph pair across
  the batch: **zero mismatches** — no altered counts, dates, sums, or ages.
- Ran a negation-density scan per paragraph pair (not/no/never/n't/nothing/
  nobody/none/without) to catch possible polarity inversions; flagged 21
  paragraphs with a count delta ≥2 (partly a regex artifact from curly vs.
  straight apostrophes undercounting the source side) and manually read every
  one of them in full against source. All 21 are faithful paraphrases with no
  inversions, no dropped negations, no reversed meaning — e.g. ch181 P14
  ("since I can't have that, I don't care about the rest. I don't care about
  anything, anything" → "nothing else matters to me. Nothing at all") is a
  register shift, not a fidelity problem.
- Did targeted random spot-reads (non-cited chapters: 177, 182, 191, 192,
  193, 194, 195) at ~4 paragraphs per chapter, full-text compare: all
  faithful, no drops, no distortions of plot/fact (character names, the
  Kashinsky elections setup, Metrov/Katavasov scholarly discussion, the
  concert program "King Lear" fantasia and Bach quartet, Lvov's backstory,
  etc. all correct).

No dropped/invented clauses, no negation/conditional inversions, no
compressed passages, and no factual or plot distortions were found anywhere
in the batch beyond the single already-identified and already-(partially)-
fixed ch196 P26 defect.

## 5. Paragraph counts — CONFIRMED MATCH

Verified programmatically for all 21 chapters, source vs. current-modern-en
vs. corrected: chapter numbers and paragraph counts match exactly in every
case (177:42, 178:33, 179:61, 180:47, 181:33, 182:9, 183:12, 184:12, 185:23,
186:41, 187:58, 188:20, 189:41, 190:15, 191:52, 192:27, 193:33, 194:12,
195:23, 196:33, 197:34). No additions, drops, merges, or splits.

## Action required before accept

1. Reconcile `ak-batchI-current-modern-en.json` and `ak-batchI-corrected.json`
   — currently only `corrected.json` carries the ch196 P26 fix. Propagate it
   to `current-modern-en.json` (or otherwise make explicit which file is the
   one going downstream) so the two files are actually identical, as the task
   spec requires.

Once that single-paragraph sync is done, this batch is ready to accept — the
editorial content itself, including the specifically-scrutinized sensitive
passages, is faithful, complete, and unsoftened throughout.
