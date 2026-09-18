# War and Peace — Batch A Independent Review (Chapters 1–25, excl. 6/11/15/19/23)

Reviewer: independent adversarial pass (not the drafting agent).
Source of truth: `full-batchA-source.json` (Maude).
Candidate: `full-batchA-corrected.json`, compared against `full-batchA-current-modern-en.json`.
Drafter's claims: `full-batchA-notes.md`.

Method: (1) mechanical diff of corrected vs current, every paragraph; (2) mechanical triage of
all 790 source/candidate paragraph pairs on length ratio, numeral sets and proper-noun sets;
(3) full manual paragraph-by-paragraph read of all 20 chapters against source, not sampled;
(4) whole-batch name-consistency sweep across every character name, not just the three the
drafter named.

---

## 1. Confirmed diff set (corrected vs current)

Structure: 20 chapters both sides, chapter numbers identical
`[1,2,3,4,5,7,8,9,10,12,13,14,16,17,18,20,21,22,24,25]`, all titles byte-identical, all
paragraph counts identical.

**Changed chapters: exactly 1, 2, 3, 4, 5, 25.** All other 14 chapters
(7, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22, 24) are **byte-identical** to current —
verified paragraph by paragraph, zero differing paragraphs.

Changed paragraphs (24 total):

| Ch | Paragraphs | Change |
|---|---|---|
| 1  | 35 | `Princess Marya Bolkonskaya` → `Princess Mary Bolkonskaya` |
| 2  | 0, 7 | `Hélène` → `Helene` |
| 3  | 0, 6, 7, 11 | `Hélène` → `Helene` |
| 4  | 0, 7 (×2), 10, 13 | `Andrei` → `Andrew` |
| 4  | 12, 23 | `Hélène` → `Helene` |
| 5  | 1, 13, 16, 18, 39, 46, 48, 49 | `Andrei` → `Andrew` |
| 25 | 0 | `Nikolai`→`Nicholas` (×2), `Andrei`→`Andrew` (×1) |
| 25 | 28 | `Nikolai` → `Nicholas` (×2) |

**Mechanically verified**: applying only the substitutions
`Hélène→Helene`, `Andrei→Andrew`, `Nikolai→Nicholas`,
`Princess Marya Bolkonskaya→Princess Mary Bolkonskaya`
to the current file reproduces the corrected file **exactly, byte for byte**. No prose,
punctuation, ordering or other content was touched anywhere in the batch. The drafter's
claim on this point is **fully confirmed**.

---

## 2. The 6 name fixes — correctness check

All four substitutions are correct in spelling and correct in placement.

- **Ch1 p35 `Marya`→`Mary`.** Correct. Source at this exact spot reads "Princess **Mary**
  Bolkónskaya." Residual `Marya` elsewhere in the batch (23 occurrences) was correctly left
  alone: every one is Márya Fëdorovna (Empress), Márya Ivánovna Dólokhova, Márya Lvóvna
  Karágina or Márya Dmítrievna Akhrosímova — all distinct characters the source itself spells
  `Márya`, never `Mary`. Source `Márya` count 23 / corrected `Marya` count 23: exact 1:1.
- **`Hélène`→`Helene`, 8 occurrences.** All 8 source occurrences are accented `Hélène`; the
  edition de-accents Maude's pronunciation diacritics throughout (Márya→Marya, Bolkónski→
  Bolkonski, Rostóv→Rostov), so this is internally consistent, not a deviation. Zero residual
  `Hélène` in the corrected file. `Abbé` correctly retained (a French title, not a name).
- **`Andrei`→`Andrew`, 13 occurrences (ch4 ×4, ch5 ×8, ch25 ×1).** Correct: the source uses
  `Andrew` 44 times and `Andrei` zero times. Corrected now has `Andrew` 44 / `Andrei` 0 —
  exact parity with source.
- **`Nikolai`→`Nicholas`, 4 occurrences (ch25 p0 ×2, p28 ×2).** Correct: source uses
  `Nicholas` 35 times and `Nikolai` zero times. Corrected now `Nicholas` 35 / `Nikolai` 0 —
  exact parity.

**Verdict on section 2: the 6 claimed fixes are all genuine, all correctly applied, none
over-applied, none missed within their own name classes.**

---

## 3. Independent findings — what the drafter missed

The drafter's headline claim is: *"No omissions, invented content, meaning inversions, or
factual/plot distortions were found anywhere in the batch"* and *"18 of 20 chapters had zero
defects of any kind."* **Both statements are too strong.** My own read found defects in both
the name-consistency class the drafter was searching (which it stopped looking for after
three name patterns) and in the content class it declared clean.

### 3a. Name-consistency defects MISSED — same class the drafter claimed to have swept

The drafter checked exactly three name patterns (Andrei/Hélène/Nikolai) plus one Marya. It did
not sweep the batch for name consistency generally. Four further splits survive in the
corrected file:

**M1 — `Cyril` vs `Kirill` Bezukhov (SEVERITY: MODERATE).**
The same character, Pierre's father, is named two different ways inside this batch.

- Source: `Cyril Vladímirovich` in **all 8** occurrences (ch10 p18, p23, p25, p27;
  ch14 p32, p34, p39; ch17 p0).
- Corrected: `Cyril` in ch10 (×4) and ch17 (×1), but **`Kirill`** in ch14 (×3).
  - ch14 p32 C: "My only hope now is Count **Kirill** Vladimirovich Bezukhov."
    (S: "…in Count **Cyril** Vladímirovich Bezúkhov.")
  - ch14 p34 C: "here is Count **Kirill** Vladimirovich Bezukhov, so rich, all alone"
    (S: "here lives Count **Cyril** Vladímirovich Bezúkhov so rich, all alone")
  - ch14 p39 C: "Are you going to Count **Kirill** Vladimirovich, my dear?"
    (S: "Are you going to Count **Cyril** Vladímirovich, my dear?")
  - Contrast ch17 p0 C, two chapters later: "to visit Count **Cyril** Vladimirovich Bezukhov".

  This is a straight intra-book character-name inconsistency, identical in kind to the
  Andrei/Andrew split the drafter did fix, and it is more visible to a reader because the two
  spellings sit five paragraphs and one chapter apart. **Fix: `Kirill` → `Cyril` at ch14
  paragraphs 32, 34, 39 (3 occurrences).**

**M2 — `Bolkonski` vs `Bolkonsky` (SEVERITY: LOW–MODERATE).**
- Source: `Bolkonski` 6/6 (masculine), `Bolkonskaya` 4/4 (feminine).
- Corrected: `Bolkonski` 5 (ch1 ×2, ch4 ×2, ch8 ×1), `Bolkonskaya` 4, but **`Bolkonsky`** 1
  — at ch25 p0: "the estate of Prince Nicholas Andreevich **Bolkonsky**" (S: "Prince Nicholas
  Andréevich **Bolkónski**'s estate").
  Notable because ch25 p0 is a paragraph the drafter actively edited *for names* and still
  left the family-name split in place. **Fix: `Bolkonsky` → `Bolkonski` at ch25 p0.**

**M3 — `Peter` → `Pyotr` (SEVERITY: LOW).**
Source reads `Peter Nikoláevich` (Shinshin) at ch18 p5, p7, p8. Corrected renders all three as
`Pyotr Nikolaevich`. This runs *against* the project's own anglicizing convention (Nicholas not
Nikolai, Mary not Marya) and against the same file, which keeps `Petya` at ch9 p10. Either
direction is defensible, but the file should not hold both. **Fix (recommended): `Pyotr` →
`Peter` at ch18 p5, p7, p8.**

**M4 — `Razumovski` vs `Razumovskys` (SEVERITY: LOW).**
ch10 p7 C "the **Razumovski** ball" vs ch18 p23 C "The **Razumovskys**…". Source: `Razumóvski`
and `Razumóvskis`. Plural form drifted to `-ys` in one place only. Cosmetic; flagging for
completeness.

(For the record, `Moyka`→`Moika` and `Ilynichna`→`Ilyinichna` are single-occurrence
transliteration normalizations with no counterpart elsewhere in the batch — no inconsistency,
no action.)

### 3b. Content-fidelity defects MISSED — the class the drafter declared clean

**C1 — Invented clause, ch9 p30 (SEVERITY: LOW, but it is invented content).**
- S: "Fifty imperials … that I will drink a whole bottle of rum without taking it from my
  mouth, sitting outside the window on this spot (he stooped and pointed to the sloping ledge
  outside the window) **and without holding on to anything.** Is that right?"
- C: "…sitting out there on that ledge — he leaned down and pointed to the sloping surface
  outside the window — **with my legs hanging over the edge** and without holding on to
  anything. Agreed?"

  "with my legs hanging over the edge" is not in this source paragraph. It is carried over
  from p15's narration. Harmless in substance, but it is an insertion into quoted dialogue —
  precisely the "invented content" the drafter reported finding nowhere.

**C2 — Meaning change, ch9 p25 (SEVERITY: LOW–MODERATE).**
- S: "**Is the Englishman bragging?**... Eh? Is it all right?" said Anatole.
- C: "**Is the Englishman backing out?** Hm? Are we ready?" said Anatole.

  "Bragging" and "backing out" are not the same act and not the same imputation. This is a
  small meaning inversion in dialogue, not a modernization.

**C3 — Dropped clause, ch8 p21 (SEVERITY: LOW).**
- S: "You give me your word of honor **not to go**?"
- C: "You give me your word of honor?"

  The object of the promise is dropped. Recoverable from context, but it is an omission, and
  it matters slightly because ch9 p2 turns on exactly what Pierre promised.

**C4 — Dropped fact, ch10 p10 (SEVERITY: LOW).**
- S: "now in Petersburg I hear he has been doing such terrible things that **he has been
  expelled by the police**."
- C: "Now in Petersburg, I hear he's been up to such terrible things that **the police had to
  step in**."

  The expulsion — the actual consequence, confirmed at ch16 p0 ("had been expelled from there
  … and sent to Moscow") — is replaced by a vaguer statement. Small loss of a plot fact.

**C5 — Softened statement, ch9 p40 (SEVERITY: LOW).**
- S: "Don't touch him! You'll startle him and then **he'll be killed**."
- C: "Don't touch him! You'll startle him, and then **he really will fall**."

**C6 — Dropped clause, ch13 p5 (SEVERITY: LOW).**
- S: "Well, if you do, **so much the better**, and you can go back to her!"
- C: "Well, if you know, then go back to her!"

**C7 — Dropped clause / shifted referent, ch25 p34 (SEVERITY: LOW).**
- S: "You complain of our separation. What then should I say, **if I dared complain**, I who am
  deprived of all who are dear to me?"
- C: "You speak of **your loneliness** — but what should I say, I who am cut off from everyone
  dear to me?"

  "if I dared complain" — a characterising note of Mary's self-abnegation — is dropped, and
  "our separation" becomes "your loneliness".

**C8 — Dropped adjective, ch25 p41 (SEVERITY: LOW).**
- S: "Princess Mary's **strenuous, mournful, and gloomy** world" → C: "Princess Mary's
  **earnest, sorrowful** world". One of three adjectives dropped.

**C9 — Editorial insertion in a footnote, ch12 p15 (SEVERITY: LOW).**
- S: "* Cousinhood is a dangerous neighborhood."
- C: "**The original French footnote:** Cousinhood is a dangerous neighborhood."

  Framing text added that is not in the source, and inconsistent with how the same file
  handles the identical construct at ch2 p1, ch5 p3, ch18 p4, ch18 p10, ch21 p31, ch21 p53,
  ch21 p55 (all kept as bare `* …`).

**C10 — Deviation from source adjective, ch4 p0 (SEVERITY: LOW — flagged, no fix urged).**
- S: "offered a most striking contrast to his **quiet**, little wife."
- C: "stood in the sharpest contrast to his **lively** little wife."

  Against the stated ground truth this is an inversion. In fairness it is almost certainly the
  *better* reading (Tolstoy's Russian is «живой» = lively, and the contrast Tolstoy is drawing
  requires it), so this is likely a defensible silent correction of the Maude text rather than
  a drafting error. Recorded so the decision is deliberate rather than accidental.

### 3c. Lower-order drift observed, not counted as defects

Noted for the record; all are within normal modern-English rendering latitude and I do **not**
recommend changes: "hydra of revolution" → "monster of revolution" (ch1 p14, lost classical
allusion); "Jacobin" → "radical" (ch5 p45, lost historical term); "equality of citizenship" →
"equality before the law" (ch5 p30, p37); the German doctor's phonetic dialect normalized to
standard English (ch21 p18, p20, lost characterization); "well-preserved" → "healthy"
(ch21 p19); "guttural r's" / "grasseyement" → "rolling r's" / "affectation" (ch25 p42 —
a rolled r is in fact the opposite of a uvular French r); "from his daughter to his serfs" →
"down to the servants" (ch25 p0); the ch20 p26–28 song reworked to preserve rhyme, which
forces "her heart beats sharp" where the source has "thus swells her heart".

---

## 4. Per-chapter verdict (my own read, all 20)

| Ch | Verdict |
|---|---|
| 1 | Sound. Name fix correct. (drift only: "hydra"→"monster") |
| 2 | Sound. Name fixes correct. |
| 3 | Sound. Name fixes correct. |
| 4 | Sound apart from **C10** (ch4 p0 "quiet"→"lively"). Name fixes correct. |
| 5 | Sound. Name fixes correct. (drift only: "Jacobin"→"radical") |
| 7 | Sound. |
| 8 | **C3** (p21 dropped "not to go"). Otherwise sound. |
| 9 | **C1** (p30 invented clause), **C2** (p25 meaning change), **C5** (p40). Otherwise sound. |
| 10 | **C4** (p10 dropped expulsion). Also holds the `Cyril` side of **M1**. |
| 12 | **C9** (p15 footnote framing). Otherwise sound. |
| 13 | **C6** (p5 dropped clause). Otherwise sound. |
| 14 | **M1 — `Kirill` ×3 (p32, p34, p39).** Content otherwise sound. |
| 16 | Sound. (p19 drops "or bees"; trivial) |
| 17 | Sound. Holds the `Cyril` side of **M1**. |
| 18 | **M3** (`Pyotr` ×3), **M4** (`Razumovskys`). Content sound. |
| 20 | Sound. (verse rhyme-driven drift in p26–28) |
| 21 | Sound. (dialect normalization p18/p20) |
| 22 | Sound. |
| 24 | Sound. |
| 25 | **M2** (p0 `Bolkonsky`), **C7** (p34), **C8** (p41). Name fixes correct. |

Paragraph counts: source == corrected for all 20 chapters (independently re-verified).

---

## 5. Final verdict

**The mechanical claim is fully confirmed. The completeness claim is not.**

Confirmed:
- The corrected file differs from current in exactly 6 chapters and 24 paragraphs.
- Every one of those differences is one of the four claimed name substitutions, and nothing
  else — verified by exact reconstruction.
- The 14 chapters claimed untouched are byte-identical.
- All 4 substitutions are the right spellings in the right places, with correct non-application
  to the homonymous `Marya` characters.

Not confirmed:
- "No omissions, inventions, meaning inversions, or factual/plot distortions … anywhere in the
  batch" is **false**. Ten content items (C1–C10) are listed above, including one invented
  clause in quoted dialogue (ch9 p30), one dialogue meaning change (ch9 p25), and four dropped
  clauses/facts.
- "18 of 20 chapters had zero defects of any kind" is **false**. By my count 11 of 20 chapters
  carry at least one item, and 4 chapters carry name defects of the very class the drafter was
  hunting.
- The name sweep was pattern-limited, not exhaustive. A batch-wide name-consistency check
  surfaces `Cyril`/`Kirill`, `Bolkonski`/`Bolkonsky`, `Peter`/`Pyotr` and
  `Razumovski`/`Razumovskys` — all still present in the "corrected" file.

**Recommendation: do NOT accept this batch as-is.** Required before acceptance:

1. **M1 (MODERATE)** — `Kirill` → `Cyril`, ch14 paragraphs 32, 34, 39.
2. **M2 (LOW–MODERATE)** — `Bolkonsky` → `Bolkonski`, ch25 paragraph 0.
3. **C1 (LOW)** — remove the invented "with my legs hanging over the edge" from ch9 p30.
4. **C2 (LOW–MODERATE)** — ch9 p25, restore "bragging" sense.
5. **C3 (LOW)** — ch8 p21, restore "not to go".
6. **C4 (LOW)** — ch10 p10, restore the expulsion.

Optional / discretionary: M3, M4, C5–C9 (all LOW), and an explicit decision on C10.

With items 1–6 applied, I would consider Batch A clean.
