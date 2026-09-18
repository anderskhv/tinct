# Batch K — INDEPENDENT ADVERSARIAL REVIEW (Chapters 234–259, 20 chapters)

Reviewer: independent second pass. The drafting pass's "20/20 SOUND, zero defects"
verdict was **not** accepted as a prior; every paragraph was re-read from scratch
against the Maude source.

## 1. corrected == current — CONFIRMED

```
diff full-batchK-corrected.json full-batchK-current-modern-en.json  ->  no output
```

Byte-identical. The corrected file introduces no changes to the live modern-en text.
Structure re-verified independently: both files are 20-chapter arrays keyed
234,235,236,237,238,239,240,241,243,246,247,248,249,251,252,253,255,256,258,259;
per-chapter paragraph counts match the source exactly (7/23/38/29/14/30/18/10/31/57/
30/25/11/32/45/20/24/28/73/24). No `<<MISSING>>`, no placeholder text, no truncation.

## 2. Method

1. Programmatic pairing of every source paragraph with its modern-en counterpart
   (~570 pairs), dumped side by side.
2. Automated divergence sweeps, used only to *target* attention, not to substitute
   for reading: (a) word-count ratio outliers (<70% / >145% of source, min 12 words);
   (b) numeral + number-word multiset diff per paragraph, catching digit/spelled-out
   drift; (c) capitalised-token set diff per paragraph, catching dropped or invented
   proper nouns, place names and character names; (d) a footnote-integrity scan for
   paragraphs beginning `*`.
3. Full manual read of all 20 chapters, paragraph by paragraph, in source order.

Ratio sweep flagged only 2 paragraphs (236 P9, 252 P29); both are legitimate
tightening of short sentences, not omissions. Number sweep produced no genuine
divergence — every hit was digit-vs-word formatting ("twenty-eight" → "28",
"the second of September" → "September 2") with the value preserved. Dates,
counts and regiment numbers are all correct, including the 136 carts (234),
sixty-three hands (239), forty-eight guns (239), ten thousand wounded (238),
twenty-five-ruble note (251), one hundred thirty fire engines (255), and the
13th Light Regiment / seventh of September wound details (258).

## 3. Findings the drafter missed

### D1 — MEDIUM — Orphaned and verbatim-duplicated footnote paragraphs (systemic, 5 chapters)

The edition translates Tolstoy's French passages into English **in the body text**
but retains Maude's separate footnote paragraph, and deletes the `*` reference
marker from the body. Result: the footnote is orphaned (an asterisk pointing at
nothing), and in six cases it is a word-for-word duplicate of the paragraph
immediately above it, so the reader sees the same sentence twice in a row.

Exact duplicates:

- **ch236 P29 / P30** — body: `"No, tell him I don't wish to see him. I am furious with him for not keeping his word to me."` footnote: `* "No, tell him I don't wish to see him. I am furious with him for not keeping his word to me."` (source P29 is the French `"Non, dites-lui que je ne veux pas le voir…"` with a `*`.)
- **ch236 P31 / P32** — body ends `"Countess, there is mercy for every sin," said a fair-haired young man…`; footnote: `* "Countess, there is mercy for every sin."` (source P31 = `"Comtesse, à tout péché miséricorde," *`.)
- **ch236 P13 / P14** — body `"A masterly woman! …"`; footnote `* A masterly woman.` (source P13 = `"Une maîtresse-femme! *"`.)
- **ch236 P24 / P25** — body `"Oh, Mama, don't talk nonsense. You don't understand anything. In my position I have obligations,"`; footnote repeats the identical sentence. (source P24 = the French `"Ah, Maman, ne dites pas de bêtises…"`.)
- **ch248 P8 / P9** — body `"That Asian city of countless churches — holy Moscow! Here it is at last, that famous city. It was high time,"`; footnote repeats it verbatim. (source P8 = `"Cette ville asiatique aux innombrables églises…"`.)
- **ch248 P12 / P13** — body `"Bring the boyars to me," he said to his entourage.`; footnote `* "Bring the boyars to me."` (source P12 = `"Qu'on m'amène les boyars," *`.)

Orphaned-but-not-duplicate (still a broken reference; marker deleted from body):

- **ch248 P17 / P18** — body already renders "his dear, tender, poor mother" and `"House of My Mother"` in English; both footnotes survive, and P18 has additionally lost Maude's `(2)` disambiguator, so the chapter now carries two consecutive paragraphs each opening with a bare `*`.
- **ch255 P21 / P22** — body renders "the ferocious patriotism of Rostopchin" in English twice; footnote `* To Rostopchin's ferocious patriotism.` is left dangling with no referent.
- **ch235 P13 / P14** — body renders `à robe courte` as "a Jesuit in lay clothing"; footnote `* A lay member of the Society of Jesus.` is now redundant, though not a verbatim duplicate.

This is a genuine reader-facing text defect (duplicated sentences + dangling
asterisks), not a style preference, and the drafter's notes do not mention it at all.
It is also mechanical to fix: either restore the `*` marker and leave the French in
the body, or delete the now-redundant footnote paragraph — but the latter changes
paragraph counts, so restoring the marker (or folding the gloss into the body) is
the alignment-safe repair.

### D2 — MEDIUM-LOW — Character-name inconsistency in the Natasha / Sukharev-tower callback

Tolstoy repeats Natasha's greeting verbatim so that Pierre's later recollection
echoes it exactly. The modern-en breaks the echo, and does so in two different
directions:

- **ch246 P43** — SRC: `"Peter Kirílovich, come here! We have recognized you!…"`
  MOD: `"Peter Kirilych! Come here! We've recognized you!…"`
  Natasha's polite patronymic is flattened to the peasant-familiar contraction —
  the same form the rank-and-file soldiers use to Pierre in ch237 P17/P18/P24–26.
  Tolstoy's social register distinction is erased.
- **ch258 P59** — SRC: `"Peter Kirílovich, come here! We have recognized you,"` (Pierre
  recalling the exact words) MOD: `"Pyotr Kirilovich, come here! We recognized you,"`

So the same line appears as "Peter Kirilych" in ch246 and "Pyotr Kirilovich" in
ch258, and the forename form "Pyotr" appears nowhere else in the batch (ch237 uses
"Peter Kirilych", matching the source there). The drafter's notes specifically claim
name normalization was verified; this one slipped.

### D3 — LOW — Omission of a concrete satirical detail (ch234 P6)

SRC: `…had already in June moved with her Negroes and her women jesters from Moscow
to her Sarátov estate…`
MOD: `…had already moved to her Saratov estate in June with her household…`

"her Negroes and her women jesters" is a specific, pointed detail about the
grotesque retinue of a great Moscow household; "her household" is a generic
substitute. Whether the substitution was deliberate sanitization or not, it is an
omission of source content. Flagging for a decision rather than asserting a fix.

### D4 — LOW — Minor lossy compressions (no meaning inverted)

- **ch234 P5** — SRC: `…the charming Frenchmen whom the Russians, and especially the
  Russian ladies, then liked so much.` MOD: `…charming Frenchmen, whom Russian women
  in particular found so appealing.` Narrows "the Russians (and especially the ladies)"
  to women only.
- **ch241 P5** — SRC: `…they ought to get away as quickly as possible and save their
  belongings.` MOD drops `and save their belongings`.
- **ch249 P3** — SRC: `a couple of bees, by force of habit and custom cleaning out the
  brood cells, with efforts beyond their strength laboriously drag away a dead bee…`
  MOD drops both `cleaning out the brood cells` and `with efforts beyond their
  strength`. Same paragraph, SRC `a crowd of bees, crushing one another, attack some
  victim and fight and smother it` → MOD `a crowd of bees crushes and smothers some
  victim` (drops the self-crushing and the attack/fight beats).
- **ch256 P0** — SRC: `The absorption of the French by Moscow…` MOD: `The spread of the
  French through Moscow…`. Reverses the agency of Tolstoy's controlling metaphor —
  Moscow swallowing the army, which ch255 P20 sets up ("Moscow engulfed the army ever
  deeper") and ch255 P20's water-into-dry-ground image completes. Physically accurate,
  thematically inverted.
- **ch253 P0** — `breaking in on his beauty sleep` → `breaking into his sleep`; the
  sarcastic "beauty sleep" is Tolstoy's needle at Rostopchin and is lost.

None of D4 is severe enough on its own to block; collectively they are the normal
attrition of a competent modernization, and each is well inside paraphrase latitude
except arguably ch256 P0.

## 4. Explicit re-check of the drafter's two ch252 / ch253 judgment calls

### ch252 P30 — "Rostopchin's broadsheet of August 31" — drafter's call CORRECT

SRC: `The man in the frieze coat was reading the broadsheet of August 31.`
MOD: `The man in the rough coat was reading Rostopchin's broadsheet of August 31.`

Verified independently. The attribution is factually right and is confirmed *inside
the same chapter*: the text read aloud in P31 ("Early tomorrow I shall go to his
Serene Highness… I shall come back for dinner") is Rostopchin's own broadsheet, and
P38 has the shopkeeper citing "the proclamation of his highest excellency the count."
Chapter 234 P3/P6 and 239 P11–P13 establish the broadsheets as his throughout. The
addition invents no content, changes no fact, and creates no confusion. It is a
clarifying gloss of the kind a modern reading edition legitimately supplies.
**Not a defect. Leaving it unchanged was correct.**

### ch253 P8 — "the more he felt himself to blame" → "because he knew he was partly to blame" — drafter's call PARTLY WRONG

SRC: `…he felt the more irritated the more he felt himself to blame.`
MOD: `…he felt all the more enraged because he knew he was partly to blame.`

The drafter classified this as "a mild interpretive softening, not a meaning
inversion or omission." The "not an inversion" half is right — the causal direction
(guilt → rage) survives, and no fact is distorted. But calling it merely stylistic
understates two real semantic shifts:

1. **"felt himself to blame" → "knew he was… to blame."** Tolstoy's whole portrait of
   Rostopchin in this chapter turns on the gap between intellect and heart: P5 states
   it outright — "he knew it only with his intellect, he did not believe it in his
   heart." The guilt in P8 is a *felt*, half-suppressed sensation, which is exactly
   why it discharges as displaced fury. Converting it to knowledge asserts a
   conscious, articulated admission — and P9, the very next paragraph, has him
   declaring "Who is to blame? Not me, of course. Villains! Traitors!" Under the
   modern-en wording, P8 and P9 read as a contradiction rather than as Tolstoy's irony.
2. **The added "partly"** has no warrant in the source and further rations the guilt
   in Rostopchin's favour.

The correlative construction ("the more… the more") is also lost, which is a fair
trade for readability. Severity: **low**, not a plot/fact error — but this is a
genuine, if small, interpretive distortion rather than a pure style touch, and the
ideal repair is a one-word change (`knew he was partly to blame` → `felt himself to
blame`) that costs nothing.

## 5. Per-chapter verdicts (independent)

| Ch | Verdict | Note |
|----|---------|------|
| 234 | Minor defects | D3 (Negroes/jesters omission), D4 (P5 narrowing) |
| 235 | Clean | P13/P14 footnote now redundant (D1, mildest case) |
| 236 | **Defective** | D1 ×4 (P13/14, P24/25, P29/30, P31/32) |
| 237 | Clean | "Peter Kirilych" here matches source correctly |
| 238 | Clean | |
| 239 | Clean | Vereshchagin/Klyucharev attributions correct; broadsheet verbatim |
| 240 | Clean | Speransky/Magnitsky, Solomon's Temple, Jesuits all correct |
| 241 | Minor | D4 (P5 dropped clause); Petya/Obolensky/Belaya Tserkov all correct |
| 243 | Clean | |
| 246 | **Defective** | D2 (P43 "Peter Kirilych" for source "Kirílovich") |
| 247 | Clean | P9 "Is the mistress home?" is a supported expansion, not invention |
| 248 | **Defective** | D1 ×4 (P8/9, P12/13, P17, P18 incl. lost `(2)`) |
| 249 | Minor | D4 (P3 bee-hive detail attrition) |
| 251 | Clean | |
| 252 | Clean | P30 judgment call confirmed correct |
| 253 | Minor | P8 interpretive shift, see §4 |
| 255 | **Defective** | D1 (P21/P22 orphaned footnote) |
| 256 | Minor | D4 (P0 "absorption" → "spread") |
| 258 | **Defective** | D2 (P59 "Pyotr Kirilovich", breaking the ch246 echo) |
| 259 | Clean | |

## 6. Final verdict

**NOT clean. The drafter's "20 of 20 SOUND, zero defects" verdict does not hold.**

No omissions of whole paragraphs, no inventions of plot, no meaning inversions, no
placeholder text, and no factual, date, place-name or plot distortions were found —
on those axes the batch really is strong, and the drafter's positive observations
about the broadsheets, the bee-hive metaphor, Napoleon's monologue and the Ramballe
dialogue are all accurate. But two genuine defect classes were missed:

- **D1 (medium, 5 chapters, 9 paragraph pairs)** — orphaned footnotes, six of them
  verbatim duplicates of the paragraph directly above. Reader-facing, mechanical,
  and alignment-safe to repair by restoring the `*` markers.
- **D2 (medium-low, 2 chapters)** — the Natasha greeting rendered three different
  ways across the edition, breaking Tolstoy's deliberate verbatim callback and
  flattening a register distinction; directly contradicts the drafter's claim that
  character-name normalization was verified.

Plus D3/D4 as low-severity judgement items.

On the two flagged judgment calls: **ch252 P30 correct**, **ch253 P8 partly wrong** —
it is a small semantic shift, not merely stylistic, and should be reverted.

Recommendation: fix D1 and D2 before this batch is signed off; decide on D3; D4 and
the ch253 P8 wording are optional but cheap.
