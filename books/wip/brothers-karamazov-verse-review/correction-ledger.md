# Brothers Karamazov — Verse Correction Ledger

Staged corrections only. **None of these have been applied to the live
edition file** (`app/public/data/editions/brothers-karamazov-modern-en.json`)
— Brothers Karamazov is a published book (in `bookRegistry.ts` `BOOKS`),
and this task's scope is staged candidates/review artifacts, not published
edition files. Exact JSON is staged at `staged-corrections.json` in this
directory, keyed by chapter and paragraph index, alongside `source`,
`current_modern_en`, and `corrected` for each.

All three defects were previously accepted by a reviewer despite not
matching the source — confirmed by Codex's report and independently
re-verified against the source here before drafting any fix.

## 1. Chapter 33, paragraph 11 (Smerdyakov's sung verse)

- **Source:** "What do I care for royal wealth If but my dear one be in
  health? Lord have mercy / On her and on me! ..."
- **Current modern-en (defective):** "What do I care for royal treasure
  If my dear one's well, at leisure? Lord have mercy / On her and on
  me! ..."
- **Corrected:** "What do I care for royal wealth, if only my dear one is
  in health? Lord have mercy / On her and on me! ..."
- **Why:** "Treasure"/"leisure" is a rhyme-driven substitution for
  "wealth"/"health" that drops the concept of *health* entirely and
  replaces it with an unrelated idea ("at leisure" — having free time).
  Health is the whole point of the couplet (a folk verse wishing a loved
  one well); losing it is a meaning change, not a paraphrase. The fix
  keeps the source's own rhyme pair (wealth/health), which already works
  in plain modern English — no invented rhyme was needed.

## 2. Chapter 33, paragraph 12 (dialogue quoting the remembered lyric)

- **Source:** "'It was even better last time,' observed the woman's
  voice. 'You sang "If my darling be in health"; it sounded more tender.
  I suppose you've forgotten to-day.'"
- **Current modern-en (defective):** "'It sounded even better last
  time,' the woman's voice observed. 'You sang "If my darling's well and
  gay"—it sounded more tender. I suppose you've forgotten it today.'"
- **Corrected:** "'It sounded even better last time,' the woman's voice
  observed. 'You sang, "If my darling is in health" — it sounded more
  tender. I suppose you've forgotten it today.'"
- **Why:** "And gay" is invented — not in the source at all — and it also
  contradicts the modern-en text's *own* P11, which sings "well, at
  leisure," not "well and gay." The dialogue is supposed to quote a
  *different, more tender* prior phrasing of the same wish (still about
  health, just "darling"/"be in health" instead of "dear one"/"but ...
  be in health") — the two lines are meant to rhyme with each other
  thematically, not to introduce a third, unrelated idea. The corrected
  version restores that relationship: both lines are now about health,
  phrased slightly differently, matching the source's actual contrast.
  This pair (P11/P12) must be corrected together — reviewing one without
  the other misses that the dialogue is commentary on the song.

## 3. Chapter 36, paragraph 1 (Grand Inquisitor epigraph)

- **Source:** "No signs from heaven come to-day To add to what the heart
  doth say."
- **Current modern-en (defective, retained archaism):** "No signs from
  heaven come today / To back up what the heart doth say."
- **Corrected:** "No signs from heaven come today / To back up what the
  heart says."
- **Why:** Not a rhyme-driven addition, but unnecessary retained
  archaism: "doth say" is left untouched in the verse epigraph while the
  *identical* phrase ("what the heart doth say") is correctly modernized
  to "what the heart says" one paragraph later, in prose (ch. 36 P2,
  already correct in the live edition, confirmed unchanged). The
  epigraph's rhyme is "today"/"say" — "doth" is not load-bearing for
  meter or rhyme, so dropping it costs nothing and removes an
  inconsistency within the same chapter.

## 4. Chapter 16, paragraph 41 (Schiller "Ode to Joy," first stanza)

- **Source/current modern-en (identical, unmodernized):** "Would he purge
  his soul from vileness / And attain to light and worth, / He must turn
  and cling for ever / To his ancient Mother Earth."
- **Corrected:** "Would he purge his soul from vileness / And attain to
  light and worth, / He must turn and cling forever / To his ancient
  Mother Earth."
- **Why:** Minimal fix — this quatrain has almost no archaic diction to
  begin with (unlike P43); the one change is "cling for ever" →
  "cling forever," a spelling modernization, not a rhyme or meaning
  change. The rest is already clear, idiomatic English and was left
  alone per the "no required rewrite percentage" rule.

## 5. Chapter 16, paragraph 43 (Schiller "Ode to Joy," main stanza)

- **Source/current modern-en (identical, unmodernized):** "Joy everlasting
  fostereth / The soul of all creation, ... 'Tis at her beck the grass
  hath turned / Each blade towards the light ... Her gifts to man are
  friends in need, / The wreath, the foaming must, / To angels—vision of
  God's throne, / To insects—sensual lust." (full text in
  `staged-corrections.json`)
- **Corrected:** "Joy everlasting fosters / The soul of all creation, ...
  At her bidding the grass has turned / Each blade towards the light ..."
  — rest of the stanza, including "the foaming must" (see below),
  unchanged.
- **Why:** Two archaic constructions modernized without touching rhyme,
  meter, or meaning: "fostereth" → "fosters" (archaic -eth ending);
  "'Tis at her beck ... hath turned" → "At her bidding ... has turned"
  (archaic contraction/idiom + archaic auxiliary verb). Neither word was
  load-bearing for any rhyme in the stanza.
- **"The foaming must" — revised (superseded judgment call):** "must"
  means unfermented/fermenting grape juice (new wine). The first pass
  left it unchanged to preserve its rhyme with "lust" two lines later
  ("The wreath, the foaming must, ... To insects—sensual lust."),
  reasoning that "must" was odd but not actually unclear in context. On
  review, that was the wrong tradeoff: "must" sitting immediately after
  "the foaming" risks being misparsed as the modal verb ("must") rather
  than the noun — a general reader is likely to read it as ungrammatical,
  not merely unfamiliar, which is worse than losing the rhyme. **Revised
  correction: "The wreath, the foaming new wine,"** — keeps the same
  image (Dionysian festivity, active fermentation/foam) and pairs
  naturally with "foaming," at the cost of the must/lust rhyme. Meaning
  and clarity outrank rhyme per the protocol, and this rhyme was never
  worth risking a misreading for. Independently re-reviewed
  (`must-revision-review.md`): ACCEPT AS-IS — "new wine" is confirmed the
  best of the plausible alternatives (checked against "cider" [wrong
  register], "grape juice" [undercuts the Bacchic/alcoholic connotation],
  "fresh wine" [roughly equivalent but less idiomatic]), with only a
  minor, non-critical loss of technical precision (must is an earlier
  fermentation stage than "new wine" strictly implies) that does not rise
  to a fidelity defect.

## 6. Chapter 16, paragraph 45 (echoed closing line)

- **Source/current modern-en:** "To insects—sensual lust." (a one-line
  fragment repeating P43's closing line, as in the source's own
  formatting)
- **Corrected:** No change — already plain modern English, no archaic
  diction to fix.

## Status: all six staged corrections above (ch33 P11/P12, ch36 P1, ch16
P41/P43/P45) independently reviewed for both accessibility and fidelity,
**as of two review rounds**: the first round accepted all six as staged;
a second, narrower round revisited P43's "must" specifically (see above)
after further scrutiny concluded the earlier rhyme-preservation call
didn't meet the accessibility bar, and the revised text was independently
re-reviewed and accepted. **Current verdict: ACCEPT AS-IS on all six from
the documented reviews (`independent-review.md`,
`must-revision-review.md`) — this means none of the checks performed so
far found an unresolved defect, not a claim that no further scrutiny
could ever find one.** Confirmed the ch33 P11/P12 pair still preserves
the exact same divergence pattern as the source (the two sung lines
differ from each other the same way source's two versions do — no more,
no less) and that no trace of the original "treasure"/"leisure"/"well
and gay" rhyme-driven additions survives.

## Remaining open item (not a defect in what's staged — a scope note for
the next batch)

**Chapter 16, paragraphs 41/43/45 above are a narrow, targeted correction
of the specific archaic constructions that were easy to fix without
touching rhyme or meter — they are not a full modernization pass on this
stanza.** Most of the stanza's more purely poetic/dense phrasing (e.g.
"It is her secret ferment fires / The cup of life with flame," "the
foaming must") was deliberately left as-is, either because it isn't
genuinely archaic (just dense/poetic, which the rules don't require
rewriting) or, in the "must" case, because modernizing it would cost an
existing deliberate rhyme for a word that reads as merely odd rather than
unclear. A full, careful re-rendering of this stanza (trading off
rhyme/meter against full modernization of every word) remains legitimate
future work if Anders wants it, but it is out of scope for this pass and
should not be read as "still broken."
