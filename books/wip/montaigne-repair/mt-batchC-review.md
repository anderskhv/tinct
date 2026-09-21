# Montaigne Batch C — Independent Adversarial Review

**Scope:** Chapters 23–33 of `mt-batchC-current-modern-en.json` vs.
`mt-batchC-source.json`. This review does not trust the drafter's
`mt-batchC-notes.md` claims and re-derives every finding independently.

## Verdict: **Accept with one fix required**

The batch is fundamentally sound — high-fidelity, faithful modern-English
rendering. All structural checks pass and the overwhelming majority of the
drafter's fidelity claims verify. But one specific word-level fidelity defect
was found (a characterization inversion, not caught by the drafter's "0
defects" claim), and one minor stylistic flattening is worth noting. Neither
rises to "do not accept," but the one defect below should be fixed before
this batch is treated as final.

---

## 1. File consistency

`mt-batchC-corrected.json` is byte-for-byte identical to
`mt-batchC-current-modern-en.json` (`diff` returns no output). Confirmed
independently.

## 2. Paragraph counts

Confirmed programmatically against `mt-batchC-source.json`: all 11 chapters
present, all chapter numbers match, and every chapter's paragraph count
matches source exactly (410 paragraphs total across the batch — note: the
drafter's notes say "406," which is off by 4; the correct total, summing the
per-chapter table in the same notes file, is 410. This is a documentation
slip in the notes, not a content defect — the actual JSON counts are
correct).

| Ch. | Title | Source paragraphs | Current paragraphs |
|-----|-------|-------------------:|--------------------:|
| 23 | Various events from the same counsel | 21 | 21 |
| 24 | Of pedantry | 64 | 64 |
| 25 | Of the education of children | 155 | 155 |
| 26 | That it is folly to measure truth and error by our own capacity | 22 | 22 |
| 27 | Of friendship | 54 | 54 |
| 28 | Nine and twenty sonnets of Estienne de la Boitie | 3 | 3 |
| 29 | Of moderation | 19 | 19 |
| 30 | Of cannibals | 45 | 45 |
| 31 | That a man is soberly to judge of the divine ordinances | 7 | 7 |
| 32 | That we are to avoid pleasures, even at the expense of life | 4 | 4 |
| 33 | That fortune is oftentimes observed to act by the rule of reason | 12 | 12 |

Chapter titles also match source exactly in all 11 cases.

## 3. Name/spelling modernizations — independently evaluated

I located every occurrence in source and current and read the surrounding
context (not just the isolated word) to confirm same-referent vs.
different-referent.

- **"Jubera" → "Aljubarrota"** (ch26, ¶18): Confirmed same battle (1385,
  John I of Castile defeated). Harmless spelling expansion.
- **"Aristo" → "Ariosto"** (ch27, ¶13 only): This is the *only* place in the
  batch where "Aristo" is actually short for Ariosto — it's a citation tag
  on a quotation from *Orlando Furioso*, canto x. **Important independent
  finding the drafter's notes glossed over**: "Aristo" also appears at ch24
  ¶54 ("Old Aristo of Chios") and ch25 ¶151–152 ("Aristoni tragico actori" /
  "Aristo the tragedian," a Tacitus reference) — these are two entirely
  different historical figures (a Stoic philosopher and a Roman tragic
  actor), and I confirmed **both were correctly left as "Aristo" in
  current**, not incorrectly folded into "Ariosto." So the modernization was
  applied surgically and correctly, but the drafter's notes description
  ("Aristo → Ariosto") is loosely worded — it could be misread as a blanket
  rule, when in fact only one of three "Aristo" occurrences in the batch was
  actually Ariosto. Net: correct as shipped, but worth flagging that this
  needed (and got) case-by-case judgment, not a global find/replace.
- **"Meniceus" → "Menoeceus"** (ch25 ¶84): Same person (Epicurus's
  correspondent). Harmless.
- **"Demophoon" → "Demophoön"** (ch25 ¶91): Same steward of Alexander.
  Harmless diaeresis restoration.
- **"Beeotia" → "Boeotia"** (ch30 ¶6): Same region. Harmless.
- **"Poictiers" → "Poitiers"** (ch32 ¶3, also ch23 context): Same city (St.
  Hilary's see). Harmless.
- **"Amiot" → "Amyot"** (ch23 ¶0): Same person, Jacques Amyot, the actual
  16th-century French translator/grand almoner. Harmless — "Amyot" is his
  correct historical spelling.
- **"Paulus, that Fabius" → "the Paulli, the Fabii"** (ch23 ¶1): This is
  **not** a pure spelling fix — it's a grammatical-number change. Source
  names two *individuals* by singular proper name (Paulus, Fabius, each
  standing for their family/gens by metonymy) followed by two *plural*
  collective family names (the Cossii, the Servilii). Current flattens all
  four into the same plural-family-name form ("the Paulli, the Fabii, the
  Cossii, the Servilii"). This does not change which families are being
  invoked, so it is not a fidelity defect in the "wrong referent" sense, but
  it is a real (minor) stylistic smoothing of Montaigne's varied rhetorical
  form. Acceptable as shipped; flagging for completeness since the task
  explicitly asked whether this category should be held to the "match
  source's own citation exactly" standard. My judgment: this one is
  borderline but tolerable — it's a legitimate plural/singular-collective
  translation choice for family names that read identically either way to a
  modern reader, not a change of fact or reference.

**Standard-to-apply verdict:** The project's precedent (preserve the
source's own citation/number/spelling even when "wrong," e.g. Bible verse
numbers) is about *preserving what the source actually asserts*, including
its errors. Pure orthographic modernization of a name that indisputably
refers to the *same* entity (Poitiers/Poictiers, Boeotia/Beeotia,
Amyot/Amiot, Menoeceus/Meniceus, Demophoön/Demophoon, Aljubarrota/Jubera) is
a different category from that precedent — it doesn't touch what Montaigne
asserted, only how a proper noun is spelled in Roman characters, and no
reader-facing "fact" changes. I would not force the drafter's spelling
fixes back to source's archaic spellings. However, "Aristo→Ariosto" and
"Paulus/Fabius→Paulli/Fabii" are structurally different from the pure
spelling fixes (one resolves a genuine period-abbreviation ambiguity
correctly; the other is a light grammatical smoothing) — both were
evaluated case-by-case above and both check out as non-defects, but they are
not simply "the same operation" as the other five, and lumping them
together in the notes as all one category understates the judgment calls
actually involved.

## 4. Independent close-read: defect found

**ch26, ¶18 — characterization inversion (word-choice, not omission).**

Source: *"...shall we not say, that these **simple people** have suffered
themselves to be deceived with the vulgar, for not having been so
clear-sighted as we?"*

Current: *"Shall we say that these **careful men** let themselves be taken
in by the common run, because they were less clear-sighted than we are?"*

This sentence is the rhetorical pivot of the paragraph (and one of the
essay's central ironies): Montaigne is sarcastically describing Froissart,
Plutarch, and Caesar — the ancient sources he's just defended — as "simple
people" from the point of view of modern skeptics, the whole point being
that this dismissive label ("simple," i.e., naive/credulous) is unearned and
that it's actually the moderns who are arrogant. "Careful men" reverses the
connotation from *naive* to *diligent/conscientious* — nearly the opposite
charge. This is not a paraphrase-preserving-meaning change; it changes what
quality is being (ironically) attributed to the ancient authorities, which
matters in an essay literally titled "That it is folly to measure truth and
error by our own capacity." This should be corrected to something that
preserves "simple" in the naive/credulous sense (e.g., "these simple souls,"
"these naive people," "these unsophisticated men") rather than "careful."

This is the one item I'd require a fix for before calling the batch clean.

## 5. Broader systematic checks (all clean)

- **Length-ratio screen** (current word count / source word count per
  paragraph, all 410 paragraphs): no paragraph fell outside a 0.6–1.7 ratio.
  No compression, no invented bulk.
- **Negation-count screen** (not/never/no/none/nor/nothing/neither/n't per
  paragraph): ~20 paragraphs flagged for a raw count delta ≥3. Manually
  checked the largest deltas (ch23 ¶1, ch24 ¶23, ch25 ¶146, ch30 ¶18, plus
  several others) — in every case the delta was from archaic
  double-negative/subjunctive constructions being resolved into cleaner
  modern negatives (e.g., "if it do not digest, if it be not incorporated...
  if it does not nourish" → "if it isn't digested, isn't incorporated...
  doesn't nourish") — same polarity, same meaning, just fewer repeated
  negative particles. No negation was inverted or dropped in a way that
  changed a claim's truth value.
- **Numeral screen**: only 3 mismatches, all in ch27 (¶32, ¶41, ¶49) — all
  are citation locants where source had OCR'd a digit "1" as capital roman
  "I" (e.g. "Heaut., i. I., 28" → "Heaut., i. 1, 28"); this is a citation
  formatting fix, not a content change, and doesn't affect any numbered
  fact within the essay text itself.
- **Manual full read** of the short chapters (28, 29, 31, 32, 33 — 45
  paragraphs) confirmed line-for-line fidelity, including every bracketed
  Latin/Greek citation and its translation.
- **Manual spot-read** of ch25 (education of children, longest chapter) and
  ch27 (friendship) at multiple points, including the famous "because it
  was he, because it was I" passage (¶25) — verified word-for-word faithful,
  and the Eudamidas will anecdote (¶28–29) — verified every numeric detail
  (two friends, five talents, two and a half each, five days) intact.
- **Anecdote spot-checks**: Augustus/Cinna (ch23 ¶1, full text compared —
  intact, including Livia's dialogue and the Lepidus/Salvidienus/
  Murena/Caepio/Egnatius chain of names), St. Hilary/Abra (ch32 ¶3),
  Duke of Valentinois poisoning (ch33 ¶2), Timoleon/Icetes assassination
  attempt (ch33 ¶10), Ignatius father/son mutual suicide (ch33 ¶11) — all
  confirmed present with full supporting detail.
- **Chapter titles**: all 11 match source exactly, byte-for-byte.

## Summary

- Structural integrity: **pass** (counts, titles, file identity).
- Name-modernization claims: **verified correct in every case**, with one
  caveat noted above about how the "Aristo" case needed (and received)
  more granular judgment than the notes' phrasing suggests.
- Content fidelity: **one real defect** — ch26 ¶18, "simple people" →
  "careful men," an unintended characterization inversion that undercuts
  the essay's irony. Everything else checked (structural screens across all
  410 paragraphs, plus deep manual reads of ~90 paragraphs spanning every
  chapter, including the two longest and most citation-dense) came back
  clean.

**Recommendation:** Fix ch26 ¶18 (restore "simple"/naive connotation instead
of "careful"), then accept. Do not accept the batch as final until that one
paragraph is corrected — everything else clears.
