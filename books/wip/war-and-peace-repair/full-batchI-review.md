# War and Peace — Batch I INDEPENDENT REVIEW (Chapters 188–209, excl. 195, 200)

Reviewer: independent adversarial pass. Drafter claimed **all 20 chapters sound, zero defects,
zero changes**. That claim does not survive review.

**Verdict: NOT CLEAN.** 3 substantive fidelity defects (one a direct meaning inversion, one a
subject inversion, one a content omission), plus 1 systemic reader-facing defect in ch207, plus
4 consistency/normalization defects. Details below.

---

## 1. Confirmation: corrected == current

```
diff full-batchI-corrected.json full-batchI-current-modern-en.json   → no output
ls -l: both 208848 bytes
```

**Confirmed byte-for-byte identical.** The drafter made no changes, as stated. Structural
integrity also confirmed independently:

- Chapter set identical in both files: 188–194, 196–199, 201–209 (20 chapters).
- Paragraph counts match source exactly in all 20 chapters (I re-derived these myself rather
  than trusting the drafter's table; the table is correct).
- No empty paragraphs, no placeholder/TODO/bracket debris, no duplicated sentences, no
  unbalanced quotes, no truncation artifacts.
- Every Arabic numeral in the source is present in the candidate (automated digit-set diff
  across all 1,644 paragraph pairs) — the only two exceptions are the footnote markers
  `*(2)` at 206:17 and 206:19, which are intentional.

## 2. Method

1. Byte diff of corrected vs current.
2. Automated paragraph-pair alignment; word-count ratio outliers flagged (only 3, all benign).
3. Automated numeric audit: digit-tokens and number-words extracted per paragraph pair and
   set-compared. Automated capitalized-token audit to catch dropped proper nouns.
4. Automated diacritic scan of the candidate (this is what surfaced defect D6).
5. **Full manual side-by-side read of every paragraph of all 20 chapters against the Maude
   source.** Not sampled. ch194 (103 paras), ch198 (68), ch208 (40) and ch209 (19) were read
   twice, the second pass checking plot beats, causal direction and subject/agent of each clause.

---

## 3. Defects found (drafter missed all of these)

### D1 — ch204:46 — MEANING INVERSION ("not for the first time" → "for the first time"). Severity: MODERATE

> **SRC:** "When she had taken leave of him and remained alone she suddenly felt her eyes
> filling with tears, and then **not for the first time** the strange question presented itself
> to her: did she love him?"
>
> **CAND:** "When she had said goodbye and was alone, she suddenly felt her eyes filling with
> tears, and then, **for the first time**, a strange question presented itself: did she love him?"

A straight negation drop. Tolstoy is establishing that Princess Mary has *already been*
circling this question — which is why the following paragraphs ("Well, suppose I do love him?",
the repeated smiling out of the carriage window) read as continuation rather than onset. The
candidate makes it a first occurrence, reversing the psychological set-up of the whole
Mary/Rostov thread. This is the single most serious defect in the batch.

### D2 — ch208:36 — SUBJECT INVERSION (Pierre's departure reassigned to Evstafey). Severity: MODERATE

> **SRC:** "On reaching home Pierre gave orders to Evstáfey—his head coachman ...—**that he
> would leave that night for the army at Mozháysk**, and that his saddle horses should be sent
> there."
>
> **CAND:** "On reaching home, Pierre ordered Evstafey—his head coachman ...—**to set out that
> night for the army at Mozhaysk**, and to send his saddle horses ahead."

In the source, Pierre announces *his own* departure. The candidate makes Evstafey the one
setting out. This contradicts the rest of the same paragraph ("**Pierre** had to postpone **his**
departure until the next day") and contradicts 208:37 ("after dinner Pierre left Moscow"). A
reader hits an internal inconsistency at the exact moment Pierre commits to leaving for
Borodino — a load-bearing plot beat.

### D3 — ch198:1 — CONTENT OMISSION (old prince's letter to the commander in chief). Severity: MODERATE

> **SRC:** "...leaving to the commander in chief's discretion to take measures or not for the
> defense of Bald Hills, **where one of Russia's oldest generals would be captured or killed**,
> and he announced to his household that he would remain at Bald Hills."
>
> **CAND:** "...leaving it to the commander in chief's discretion whether to take measures for
> Bald Hills' defense. He announced to his household that he would stay."

The clause **"where one of Russia's oldest generals would be captured or killed"** is dropped
entirely. This is not filler: it is the old prince's proud, self-dramatizing third-person
flourish, and it is the hinge that makes his subsequent collapse tragic rather than merely
senile. Dropping it is a straight violation of the project's Translation Rules ("Do not
condense arguments, examples, dialogue, or descriptive detail"). Note this is in the death
chapter the drafter singled out as "checked in full."

### D4 — ch207 (throughout) — The French-forfeit running gag is rendered unintelligible. Severity: MODERATE (likely a book-wide policy issue, not a batch-local slip)

Ch207's scene at Julie's soiree turns on a rule the guests have adopted: speak only Russian,
and pay a fine to the Committee of Voluntary Contributions for any lapse into French (207:9).
Every "Forfeit!" in the chapter is triggered by a visible French phrase. The candidate
translates all inline French into English, so the trigger disappears and the gag collapses:

| Para | SRC | CAND | Result |
|---|---|---|---|
| 207:33 | "C'est la fable de tout Moscou. Je vous admire, ma parole d'honneur!" | "It's the talk of all Moscow. I admire you, I truly do!" | 207:35 "Forfeit, forfeit!" now has no visible cause |
| 207:42 | "Qui s'excuse s'accuse" | "He who excuses himself, accuses himself" | offense invisible |
| 207:49 | "un petit peu amoureuse du jeune homme" | "a tiny bit in love with the young man" | 207:51 "Forfeit, forfeit, forfeit!" unmotivated |
| 207:52 | "But how could one say that in Russian?" | "But how would you say that in Russian?" | **incoherent** — she just said it in English |

Compounding this, the footnote paragraphs are retained (207:34, 207:43, 207:50) but their `*`
markers were stripped from the body, so the reader gets an unanchored footnote that is a
near-verbatim duplicate of the sentence immediately above it. Same pattern at 189:12/13,
197:2/3, 206:17/18/19, 207:3/4.

This is almost certainly a consistent editorial policy applied across the whole book rather
than a batch-I error, so the fix is a policy decision (retain French + footnote, or drop the
now-redundant footnote paragraphs — but the latter breaks paragraph alignment). Flagging it
because ch207 is where the policy produces actual nonsense on the page, and because the
drafter did not mention it at all.

### D5 — ch205:5, 205:7 — Unnormalized accented character names left in the text. Severity: LOW (but objectively verifiable, and directly contradicts the drafter's stated check)

Automated diacritic scan of the entire candidate returns exactly five hits, all inside
Denisov's dialogue in ch205:

| Loc | Candidate token | Form used everywhere else |
|---|---|---|
| 205:5 | `Yermólov` | `Ermolov` (31× book-wide) |
| 205:7 | `Bolkónski` ×2 | `Bolkonsky` (127× book-wide) |
| 205:7 | `Denísov` | `Denisov` (430× book-wide) |
| 205:7 | `Váska` | `Vaska` (14× book-wide) |

`Yermólov` additionally introduces a Y-spelling that appears nowhere else in the book. The
drafter's notes explicitly claim to have checked "character-name normalization (Andrew,
Kutuzov, Helene, Nicholas, Mary)"; this check evidently did not run over ch205.

### D6 — ch207:3, 207:8 — `Nizhny` vs the book's `Nizhni`. Severity: LOW

Source has `Nízhni` both times. Candidate has `Nizhny` both times. Book-wide, `Nizhni` appears
6× and `Nizhny` 2× — and those 2 are precisely these two. Batch I introduced the variant.

### D7 — ch194:52, ch197:1 — `Dorogobutz` is a misspelling. Severity: LOW

Source has `Dorogobúzh` both times. Candidate has `Dorogobutz` both times (internally
consistent, so the drafter's eye slid past it, but wrong against the source and against the
book's own `Dorogobuzhsk` elsewhere). Standard transliteration is Dorogobuzh.

### D8 — ch194:1 — Comma splice / run-on introduced. Severity: LOW (grammar, not fidelity)

> **SRC:** "The same evening that the prince gave his instructions to Alpátych, Dessalles,
> having asked to see Princess Mary, told her that..."
>
> **CAND:** "That same evening the prince gave his instructions to Alpatych, Dessalles asked to
> see Princess Mary and told her that..."

The subordinate temporal clause was promoted to a main clause without repunctuating, producing
an ungrammatical run-on. Facts intact; sentence broken. Opening paragraph of the batch's
longest chapter.

---

## 4. Per-chapter findings (independent)

| Ch | Content | Finding |
|---|---|---|
| 188 | Petya at the Kremlin | Clean. Trinity Gateway crush, balcony scene, biscuit scramble, Obolenski, Tsar Cannon all intact. |
| 189 | Assembly of the Nobility | Clean. The naval officer's r-dropping is de-phoneticized (stylistic, content intact: 1807 militia, "priests' sons and thieves"). Pierre's speech, Adraksin, Glinka, the senator all complete. `les états généraux` softened to "an assembly that reminded him of the States-General" — acceptable. |
| 190 | Rostopchin, ten-men levy | Clean. "ten men per thousand serfs," Emperor's quoted speech, the weeping tax farmer and mayor all match. |
| 191 | Essay: causes of 1812 | Clean, and this one matters. Read twice for argumentative direction. 800,000 vs half-strength, Dresden/Kurakin/Balashev, Drissa/Pfuel/Paulucci, Barclay–Bagration friction, the Arakcheev letter, Bronnitskis/Wintzingerode, Neverovski, Smolensk burned by its own inhabitants — every claim present, no inversions. |
| 192 | Old prince, Julie's letter | Clean. The Niemen/Dnieper confusion is preserved as the source has it (correctly — it is characterization, not error). Raevski anecdote, "widows of live men," the "will," all intact. |
| 193 | The old prince's night | Clean. Potemkin/Empress Mother/Zubov reverie and the letter-reading match closely. |
| 194 | **Alpatych in Smolensk (103 paras)** | **D8** (194:1 run-on). Otherwise sound: 130 guns after four o'clock, Ferapontov beating his wife, the Barclay letter to Baron Asch verbatim, the cook's broken thigh, the barn fire, the Prince Andrew/Berg exchange, "Loot everything, lads!" Minor: `Dorogobutz` (**D7**); "Matthew Iványch Plátov" reduced to "Platov", losing the peasant's familiar full-naming. |
| 196 | Petersburg salons, Kutuzov's appointment | Clean. July 24 / July 29 / Aug 8 / Aug 9 sequence correct; Saltykov–Arakcheev–Vyazmitinov–Lopukhin–Kochubey committee intact; blindness argument and its reversal intact. `Joconde` generalized to "a romantic novel" — acceptable. |
| 197 | Napoleon and Lavrushka | Clean. Thiers framing preserved as the source's irony, not adopted as narration. Lavrushka's invented boasts intact. Minor: 197:14 "will not soon be over" → "will drag on for a long time" slightly over-clarifies deliberately murky peasant-speak, blunting the interpreter joke. |
| 198 | **Old prince's death (68 paras)** | **D3** (content omission at 198:1). Rest sound: deathbed dialogue complete — "Always thoughts... about you," "Thank you... daughter dear... forgive," "Call Andrew!", "Russia is ruined. They've destroyed her," "Put on your white dress. I like it," second and final stroke, the horror at the corpse, the washing/laying-out. Minor: 198:4 "timidity and submission" → "timidity and helplessness" (loses *submission*, the point for a lifelong tyrant); 198:25 "comic efforts" → "clumsy efforts" (loses Tolstoy's deliberately jarring word); 198:59 "She rose and saw Dunyásha" → "She looked up. It was Dunyasha" (she stands in the source). |
| 199 | Dron and the Bogucharovo peasants | Clean. "Warm rivers" migration, Peter Fedorovich, the counterfeit hundred rubles, "I see through you and three yards under you," the wizard reputation — all intact. Minor unit slips: "quarters of flour"→"sacks", "shock of the whole corn crop"→"sheaf". |
| 201 | Mary's speech to the peasants | Clean. Her offer, the refusals, and the "artful tale"/"clever tale" line all accurate. |
| 202 | Mary's night | Clean. "Dear-est!" preserved with the hyphen. |
| 203 | Rostov rescues Mary | Clean. Full drunk-peasant comedy, Alpatych's report, the meeting scene. |
| 204 | Mutiny put down | **D1 — meaning inversion at 204:46.** Rest sound: Karp/Dron confrontation, the binding, the packing, the Sonya complication at the end correctly preserved. |
| 205 | Kutuzov takes command | **D5 — unnormalized accented names.** Note: contrary to the drafter's claim that Denisov's speech "is normalized," it is **not** — "weceives," "bweak," "gue-willa," "Sewene Highness" are all retained. His guerrilla plan's content is intact. |
| 206 | Kutuzov and Prince Andrew | Clean. "eat horseflesh," Les Chevaliers du Cygne, "dans le doute, abstiens-toi," Kamensky/Rustchuk all present. Footnote markers stripped while footnote paragraphs retained (see **D4**). `Rustchuk`→`Rushchuk` variant. |
| 207 | Moscow society, Julie's soiree | **D4 (forfeit gag broken), D6 (`Nizhny`).** Karpushka Chigirin broadsheet, Rostopchin's Charon quip, Mamonov's 800,000 rubles, the Rostov gossip, Mary's rescue all present. Minor: `bouts rimés` flattened to "witty verses," losing a specific literary allusion. |
| 208 | Pierre leaves Moscow | **D2 — subject inversion at 208:36.** Rest sound: both broadsheets, the Leppich balloon letter, the flogging at Lobnoe Place, the clerk's "Russian sauce" joke, Perkhushkovo and the Shevardino guns, the Sloboda Palace echo. `Bolótnoe Place`→`Bolotnaya Square` is acceptable. |
| 209 | **Essay: Shevardino/Borodino** | **Clean — verified numerically and argumentatively.** 24th/25th/26th August sequence; 1,300 miles; quarter-of-army loss; the draughts analogy (16 vs 14 pieces, "one eighth weaker," trade 13 more, "three times as strong"); 100,000 vs 120,000 before and ~50,000 vs 100,000 after; 6,000 men at the redoubt; the three-part proof that the position was unplanned (no entrenchments by the 25th; the redoubt's senselessness; Barclay/Bagration/Kutuzov all calling it the left flank); Kolocha at an acute angle; Novoe/Utitsa/Semenovsk/Borodino/Valuevo/Gridneva; Poniatowski and Uvarov's actions bracketed as separate; "ten hours" and the indecisive result. No claim reversed, no number altered, no causal direction flipped. Only trivial loss: 209:11 "sticking a pin into the map at hazard" compressed to "any other random spot," dropping the image. |

---

## 5. Note on the drafter's notes

Two claims in `full-batchI-notes.md` are demonstrably not based on the candidate text:

- It quotes the deathbed line as **"Russia has perished"** — that is the *source* wording. The
  candidate reads **"Russia is ruined."** (Both acceptable; the point is the note was written
  from the source, not from the candidate.)
- It states Denisov's affected speech "**is normalized** in modern-en as a stylistic choice."
  It is **not** normalized — the lisp is retained throughout ch205.

Combined with D5 (five accented names sitting in plain sight in ch205, findable by a one-line
regex) this indicates the pass was not the paragraph-by-paragraph read it claims to be, and
that a blanket "zero defects" result from it should not be accepted for the remaining batches
without independent verification.

---

## 6. Verdict

**NOT CLEAN.** Batch I requires edits before acceptance.

**Must fix (fidelity):**
- **D1** ch204:46 — restore "not for the first time."
- **D2** ch208:36 — restore Pierre as the subject of the departure.
- **D3** ch198:1 — restore "where one of Russia's oldest generals would be captured or killed."

**Should fix (consistency, cheap):**
- **D5** ch205:5, 205:7 — `Yermólov`→`Ermolov`, `Bolkónski`→`Bolkonsky` (×2), `Denísov`→`Denisov`, `Váska`→`Vaska`.
- **D6** ch207:3, 207:8 — `Nizhny`→`Nizhni`.
- **D7** ch194:52, ch197:1 — `Dorogobutz`→`Dorogobuzh`.
- **D8** ch194:1 — repair the run-on.

**Escalate (policy, book-wide, not a batch-I fix):**
- **D4** — inline-translated French plus retained unanchored footnote paragraphs. Breaks the
  ch207 forfeit scene outright and produces duplicate-looking footnotes in six places across
  this batch alone. Needs a decision, since removing the footnote paragraphs would break
  paragraph alignment with the source.
