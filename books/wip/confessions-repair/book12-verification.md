# Confessions Book 12 — Independent Verification of Corrections

**Verifier:** independent (did not draft, did not review)
**Ground truth:** `book12-source.json` (Pusey 1838), 42 paragraphs, flat `{number, title, paragraphs}` shape
**Inputs:** `book12-candidate.json`, `book12-corrected.json`, `book12-review.md`, `book12-corrections-log.md`
**Method:** every claim below re-derived from the files with fresh scripts. The corrections log was read *after* the diff and gate work was already done.

---

## 1. True diff set

Re-derived independently (script: paragraph-wise compare, then compare after normalizing candidate `--` → `—`).

| Measure | Result |
|---|---|
| Paragraph counts (source / candidate / corrected) | 42 / 42 / 42 |
| Paragraphs differing raw (candidate vs corrected) | **42/42** |
| Paragraphs differing after `--`→`—` normalization (substantive) | **13** |
| Substantive indices (0-indexed) | **0, 1, 2, 14, 20, 28, 33, 35, 36, 38, 39, 40, 41** |
| Dash-only indices | 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32, 34, 37 (29 paragraphs) |

**Orchestrator's claim confirmed exactly.** The 13-paragraph substantive set and the all-42-touched dash pass both reproduce.

**Dash-count claim confirmed:**

| | `--` | `—` |
|---|---|---|
| candidate | 142 | 0 |
| corrected | **0** | **142** |

The 1:1 mapping also holds *within* the dash-only subset: 101 `--` in the candidate's 29 untouched paragraphs → exactly 101 `—` in the corrected versions of those same paragraphs. No dash was created or lost in the substantive edits either (totals match at 142). Every em dash in the file is spaced ` — `; zero unspaced em dashes, zero `——`, zero `—-`/`-—`, zero double spaces.

**No silent drift (gate 4).** For all 29 non-substantive paragraphs, `candidate.replace("--","—") == corrected` byte-for-byte. Nothing else changed anywhere in the file.

The 13 substantive edits, extracted by word-level diff, are *exactly* the review's four moderate proposals plus nine of its ten minors — no extra, unlogged edits:

| idx | change |
|---|---|
| 0 | `void` → `annul` (minor) |
| 1 | `In all my lowliness I confess` → `The lowliness of my tongue confesses` (minor) |
| 2 | `chaos ... describe` → `abyss ... name` (minor) |
| 14 | deleted `toward it` (minor) |
| 20 | **M1** — sentence inserted |
| 28 | **M4** — lemma restored ×3 |
| 33 | `brothers and sisters` → `brothers` (minor) |
| 35 | `of the flesh` → `carnal` (minor) |
| 36 | inserted `deep`; inserted `make or` (minor, 2 sub-items) |
| 38 | **M2** — `worth` → `choice` |
| 39 | deleted `carnal` (minor) |
| 40 | `since it was ... him that` → `he ... whom` (minor) |
| 41 | `could see less than the whole truth` → `saw less` (minor) |

Minor #10 (¶31 / idx 30, "in fellowship with") was **declined**, which the log states openly and the review itself rated "harmless" with no proposed correction. Accepted as a defensible decline.

---

## 2. Moderates — confirm / not-confirmed

| ID | ¶ (review / idx) | Verdict | Evidence |
|---|---|---|---|
| **M1** | ¶21 / idx 20 | **CONFIRMED** | Corrected reads: `...because you will not find any? For that which always finds it good to cling fast to God surpasses all extension and all the revolving periods of time." "It is," they say.` Source: `...because you will not find them? For that, to which it is ever good to cleave fast to God, surpasses all extension, and all revolving periods of time." "It is," say they.` Meaning matches (clinging to God → surpasses extension and revolving time); placement is exact — inside the same quoted speech, after the "changes of times in vain" question and immediately before the objectors' "It is." Closing `"` correctly moved past the new sentence; quote balance still even. Word ratio for idx 20 rises 0.932 → 1.047, i.e. the paragraph is no longer short. |
| **M2** | ¶39 / idx 38 | **CONFIRMED, no collateral damage** | Corrected: `nor first in choice, since a sound is not better than a tune`. Term counts: source `choice` ×3 / `value` ×1 / `worth` ×0; candidate `choice` ×2 / `worth` ×2 (the defect); **corrected `choice` ×3 / `worth` ×1** — exactly restoring the source's distribution. The four-term list (`by eternity ... by time ... by choice ... by origin`) and the crossed flower/fruit pairing are untouched. The other, correct phrase **`in worth, it comes last — since formed things are superior to formless ones`** is present and **unchanged** (it renders source "in value"). This was the specific accidental-collateral risk; it did not occur. |
| **M3** | global | **CONFIRMED** | Zero `--` anywhere in the file (whole-file string scan, not just paragraphs). 142 `—`, all spaced. Spot-checked idx 5, 16, 18, 27, 30, 37: punctuation intact, no broken or doubled dashes, no dash swallowed into a word. Zero curly quotes, zero unbalanced `"`. |
| **M4** | ¶29 / idx 28 | **CONFIRMED** | Corrected now carries the lemma 5× (regex over both comma variants: source 5, corrected 5), with all five readings framed identically: reading 1 `one person chooses this reading of "But the earth was invisible, and without form, and darkness was upon the deep"`, readings 2–5 `Another takes this reading of "The earth was invisible and without form, and darkness was upon the deep"`. The corrected file even preserves Pusey's own variation — reading 1 keeps the "But the earth was invisible, and without form" comma form as in the source, readings 2–5 the un-commaed form. No propositional content added or lost; each reading's body is unchanged from the candidate. Word ratio 0.859 → 0.985 (was the book's lowest; now unremarkable). |

**4 / 4 moderates confirmed fixed, correctly, with nothing else disturbed.**

---

## 3. Minor spot-checks against source

All nine applied minors checked against the actual source text, not the review's paraphrase.

| idx | Source | Corrected | Verdict |
|---|---|---|---|
| 0 | "We hold the promise, who shall make it null?" | "We hold your promise — who can annul it?" | OK. "void" gone; `void` now appears nowhere in the Genesis sense in the file. |
| 1 | "The lowliness of my tongue confesseth unto Thy Highness" | "The lowliness of my tongue confesses to your greatness" | OK — tongue/Highness image restored. |
| 2 | "there was I know not what depth of abyss" | "there was some depth of abyss I cannot name" | OK — "chaos" removed, "abyss" restored, no Greek-cosmogonic import. |
| 14 | "(that such capacities may hereby be drawn on by degrees...)" | "...may be drawn along by degrees — out of which another Heaven might be created..." | OK — supplied goal removed. The resulting `by degrees — out of which` is slightly loose, but the source is equally loose at that seam (parenthesis then "out of which"); the em dash carries the attachment back to "the formlessness." Not a defect. |
| 33 | "my brethren" | "my brothers" | OK — consistent with "sons of men" kept literal elsewhere. |
| 35 | "being yet little ones and carnal" | "still little ones and still carnal" | OK — link to idx 39's "apart from the carnal ones" restored. |
| 36a | "deep shady fruit-bowers" | "deep shady fruit-groves" | OK. |
| 36b | "made or undergo the beautiful variations of the Universe" | "make or undergo the beautiful shifting changes of the universe" | OK — verb pair restored. |
| 39 | "those hopeful little ones who so think" | "who think in that way" | OK — supplied "carnal" removed, ambiguity left open as in source. |
| 40 | "...to have seen all these, through whom the One God hath tempered..." | "...to have seen all of these truths — he through whom the one God tempered..." | OK — relative construction restored, causal "since" gone. |
| 41 | "if man did see less" | "if a mere man saw less" | OK — "than the whole truth" dropped. "mere" retained as harmless. |

No minor was mis-applied, over-applied, or applied to the wrong paragraph.

---

## 4. Mechanical gates (re-run on `book12-corrected.json`)

| Gate | Result |
|---|---|
| Valid JSON | **PASS** (`json.tool` clean) |
| Shape / metadata | **PASS** — `number: 12`, `title: "Book 12"`, matches source |
| Paragraph count | **PASS** — 42, one-to-one with source |
| Empty paragraphs | **PASS** — 0 |
| Question-mark parity | **PASS** — source 59 / corrected 59; **per-paragraph mismatches: 0/42** |
| Exclamation-mark parity | **PASS** — source 7 / corrected 7; per-paragraph mismatches: 0/42 |
| Zero `--` | **PASS** — 0 occurrences file-wide |
| Em dashes | 142, all correctly spaced; 0 anomalies |
| Curly quotes | **PASS** — 0 (`‘ ’ “ ”` all absent) |
| Unbalanced `"` | **PASS** — every paragraph has an even count |
| Single-quote-as-quotation-mark | **PASS** — every `'` is a contraction or possessive: `God's` ×4, `servant's` ×3, `one's`, `Lord's`, `Creator's`, `men's`, `Moses'`, `mother's`. Nothing else. |
| Archaism sweep (40 forms) | **PASS** — 3 hits, all legitimate modern usage: idx 5 "form whatsoever" (intensifier), idx 19 / idx 38 "behold" (ordinary verb), idx 38 "arrange by art" (noun). Identical to the review's finding; the corrections introduced no new archaism. Note the M1 insertion uses "cling fast," not Pusey's "cleave fast" — correctly modernized. |
| Word-ratio outliers | **PASS** — lowest ratio in the file is now 0.981 (idx 22). Both former outliers are fixed: idx 20 0.932→1.047, idx 28 0.859→0.985. No paragraph is now below the 0.75 floor, or even below 0.98. |

---

## 5. Pluralism argument — re-check after corrections

Checked which pluralism-bearing paragraphs were touched at all: of idx 21, 22, 25, 26, 28–35, 37, 38, 40, 41, only **28, 33, 38, 40, 41** were substantively edited, and in each case the edit is one of the verified items above — none of which touches a qualifier, a polarity, or an attribution:

- idx 28 (M4): only the citation frame restored; the five readings' bodies are byte-identical to the candidate.
- idx 33: `brothers and sisters` → `brothers` — address term only.
- idx 38 (M2): `worth` → `choice` — strengthens the four-senses argument, unrelated to pluralism.
- idx 40: relative clause softened — if anything *reduces* an over-assertion.
- idx 41: dropped a supplied comparison.

All four load-bearing qualifiers verified present verbatim in the corrected file:

| Qualifier | Location | Present |
|---|---|---|
| "and yet all of them true" | idx 25 (¶26) | **yes** |
| "just not this truth" | idx 25 (¶26) | **yes** |
| "apart from the carnal ones" | idx 39 (¶40) | **yes** |
| "not being false" | idx 40 (¶41) | **yes** |

Polemical edge intact and untouched: "I hate fiercely ... two-edged sword" still at idx 16; "from truth into a lie" still at idx 32 — both in the dash-only set, so provably unaltered. idx 39 still holds both halves in tension ("I do not know" + "and yet I know that those readings are true, apart from the carnal ones") and still frames Augustine's preference as a preference *among valid readings*.

**The corrections did not perturb the pluralism argument in any direction.** Fidelity verdict is unchanged from the review: faithful, qualified, zero inversions.

---

## 6. Flow assessment of the two restored passages

**idx 20 (M1).** Read in full context. The restored sentence lands as the *premise* of the concession it precedes: the question ("when you search for changes of time in it in vain, because you will not find any?") is now followed by its reason ("For that which always finds it good to cling fast to God surpasses all extension and all the revolving periods of time."), and only then does the objector answer "It is." Without it, the "It is" was answering a bare question; with it, the objector is conceding to an argument. Register matches the surrounding prose — "cling fast to God" is the same idiom the candidate already uses elsewhere in the book, and "all the revolving periods of time" sits naturally beside the paragraph's own "succession of times" two sentences later. **Reads as native, not bolted on.**

**idx 28 (M4).** Read in full. The five readings now hammer in a genuine parallel series: `one person chooses this reading of "..."` / `Another takes this reading of "..."` ×4. Because the frame is *identical* every time, the repetition reads as deliberate rhetoric rather than as clumsiness — which is exactly Augustine's point (these same words, five readings). The fourth and fifth readings no longer trail off as afterthoughts, which was the review's specific complaint. The one thing a reader might notice is the paragraph's length; that is the source's own shape and the paragraph is now at 0.985 of source word count, so it is not padded. **Reads as native.**

No other paragraph shows an edit seam: the nine minors are all single-word or single-phrase substitutions that sit in grammatical sentences (verified by reading each in ±110 characters of context).

---

## 7. Final verdict

**READY — Book 12 can be marked "editorially accepted."**

- True diff set independently re-derived and matches the orchestrator's statement exactly: 13 substantive paragraphs, 42 touched by the dash pass, 142 dashes 1:1, zero `--` remaining.
- 4/4 moderates confirmed fixed, correctly placed, with the M2 collateral risk explicitly checked and clear.
- 9/9 applied minors verified against source; the 1 declined minor is defensibly declined and logged.
- All non-substantive paragraphs proven to differ from the candidate by dash normalization alone — **zero silent drift**.
- All mechanical gates pass. Word-ratio floor across the whole book is now 0.981.
- The pluralism argument, its qualifiers, and the polemical edge are provably unchanged.
- The corrections log is accurate: every claim in it was independently reproduced. (One trivial imprecision: the log's closing note cites polemic paragraphs "21, 33, 34, 37 in this file's indexing" when the "hate fiercely" line is at idx 16 and "from truth into a lie" at idx 32. This is a numbering slip *in the log's prose only*; the file itself is correct and those paragraphs are untouched.)

**Unresolved issues: none blocking.** Two observations for the record, neither requiring another round:

1. idx 14's `may be drawn along by degrees — out of which another Heaven might be created` is a slightly loose seam left by removing "toward it." It mirrors the source's own loose construction and is not a fidelity defect.
2. Minor ¶31/idx 30 ("in fellowship with") remains unapplied by choice. The review rated it harmless and proposed no correction; concur.

No second correction round needed.
