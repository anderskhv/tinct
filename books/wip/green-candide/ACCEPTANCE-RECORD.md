# Acceptance Record — Candide, modern-en candidate

## Identity

- **Title / author:** Candide, ou l'Optimisme — Voltaire
- **Book id:** green-candide (staged, `books/wip/green-candide/`)
- **Structure:** 30 chapters, 709 paragraphs (paragraph count/order/indices
  identical between `source.json` and `candidate.json` — verified
  programmatically: per-chapter paragraph counts match exactly across both
  files, totals 709 = 709).

## Source and candidate origin

- **`source.json`** — the public-domain human English translation used as
  the baseline source text for this non-English original. Per programme
  rules on non-English sources, there is no `candide-original-fr.json` in
  this staging directory; only the English translation baseline was used
  as the anchor source for the modern-en rendering. (Note: this is a
  deviation from the ideal of anchoring directly to the original-language
  text, accepted here per existing programme policy for this pipeline;
  flagging it explicitly so a future session does not assume a French
  original was consulted.)
- **`candidate.json`** — the modern-en candidate, staged from the live
  app's edition files for this book.

## Review coverage table

| Round | Scope | Method | Result |
|---|---|---|---|
| Round-1 accessibility (Reviewer A) | All 30 chapters / 709 paragraphs, full read, blind to source | `accessibility-review-1.md` | Needs targeted fixes — unglossed recurring institutional/period vocabulary (quarterings, auto-da-fé, sanbenito, Familiar of the Inquisition, spontoon, cochineal, Ottoman-title cluster, "in articulo mortis"). No plot/tone/flow defects. |
| Round-1 fidelity (Reviewer B), 4 packets | ch1-8, ch9-16, ch17-23, ch24-30, each with 1-paragraph neighboring context | `fidelity-review-1-packet-ch1-8.md`, `-ch9-16.md`, `-ch17-23.md`, `-ch24-30.md` | **Zero blocking defects across all 4 packets / all 709 paragraphs.** Whole-book fidelity verdict: ACCEPT AS-IS, with non-blocking optional polish notes (the same items later addressed by the accessibility fix pass). |
| Accessibility fix pass | 11 targeted paragraphs: (1,0), (4,15), (5,14), (6,0), (6,1), (8,6), (11,1), (12,7), (12,10), (14,9), (30,1) | In-line glosses added for: quarterings, cochineal, Familiar of the Inquisition, auto-da-fé (x2), sanbenito, old law/new law (sabbath), "in articulo mortis" → "at the point of death", Dey, Aga of the Janissaries, Effendis/Pashas/Cadis | Glosses added; scope limited to the 11 paragraphs named. |
| **This session — fidelity spot-check of the 11 glossed paragraphs** | Each of the 11 paragraphs re-derived directly from `source.json` | Manual side-by-side comparison, source vs. candidate, full paragraph text | **Clean.** Every added gloss clarifies a term already present in the source's own meaning; no unlicensed content invented, no ambiguity resolved that the source leaves open, no biographical/historical specifics added beyond what the text implies. [11.1] "in articulo mortis" → "at the point of death" confirmed as a faithful, standard translation of the Latin (not a paraphrase; the sense is exactly "at/on the point of death," matching legal/religious usage), consistent with the protocol's mandate to modernize embedded Latin/foreign phrasing in narration. |
| **This session — final whole-book non-sampled pass (protocol steps C/D)** | All 30 chapters / 709 paragraphs read in full: (a) cross-boundary fidelity read of `candidate.json` against `source.json`, structure verified programmatically; (b) fresh candidate-only accessibility read as a first-time general-adult reader, `source.json` and prior review files not consulted for this half | Manual full read, chapter by chapter | **Clean.** Voltaire's deadpan satirical tone holds consistently start to finish (the "cause and effect" / "best of all possible worlds" refrain, the escalating-disaster structure, the Pococurante and dethroned-kings set pieces, the closing "cultivate our garden"). Terminology and character naming are consistent throughout (Cunegonde, Pangloss, Cacambo, Martin, the Baron; the fixed glosses recur correctly at their later occurrences — e.g. "seventy-two quarterings" at [10.14]/[13.6]/[29.3], auto-da-fé references at [8.7]/[9.5]/[13.6]/[30.2]). No repeated or dropped content found at any chapter boundary. No new accessibility defects surfaced beyond the items already identified and explicitly accepted as non-blocking in round 1. |

## Defect counts by round

- Round-1 accessibility: 1 category of defect (recurring unglossed
  institutional/period vocabulary across ~11 first-occurrence sites, plus
  a handful of isolated hard passages) — 0 plot/flow defects.
- Round-1 fidelity (4 packets): 0 blocking defects.
- Accessibility fix pass: 11 paragraphs edited (glosses added), 0 defects
  introduced (verified this session).
- This session's spot-check + final pass: 0 defects found.
- Round 2 (2026-09-23): 1 blocking defect class the passes above missed. Silent proper-noun normalization and added diacritics: 131 occurrences in 93 paragraphs, fixed and independently verified. See the Round 2 section below.

## Deliberately preserved non-blocking items (not re-flagged as blockers)

These were identified in round 1 and explicitly left untouched by the
accessibility fix pass; this session confirms they are still present and
correctly *not* treated as blockers:

1. **[3.10]** — the chamber-pot ellipsis ("emptied over him a full….
   Oh, heavens!"). Deliberately coy rhetorical device in the original;
   preserved as-is.
2. **[11.6]** / **[12.6]** — the untranslated Italian exclamations ("O che
   sciagura d'essere senza coglioni!" / "Ma che sciagura d'essere senza
   coglioni!"). Correctly left untranslated — the Old Woman's later
   recognition of Italian as her own language ([12.0]: "Astonished and
   delighted to hear my own language...") is a plot point that depends on
   the phrase staying in Italian.
3. **[22.27]** — the unexplained Fréron reference ("a hack pamphleteer—a
   Fréron"). Left as an untranslated period in-joke, consistent with the
   book's density of topical satire elsewhere (e.g. the Pococurante
   scene's proper-noun density, explicitly praised in round 1 as working
   as intended).
4. **[30.25]** — Pangloss's dense list of assassinated kings (Eglon, King
   of Moab... Croesus, Astyages, Darius...). Not a defect — the
   overwhelming density is the joke, and Candide cutting Pangloss off
   before he finishes is the payoff; no individual name needs to be
   recognized for the scene to land.

## Round 2 — proper-noun / printed-form sweep (2026-09-23, supersedes the 2026-09-21 hash)

A pre-publication verification found a defect class that the round-1 packets
missed. The candidate had silently normalized the source's printed proper
names to modern or standard forms and added diacritics the source lacks
(Buenos Ayres→Buenos Aires, Leibnitz→Leibniz, Abbe→Abbé,
Marchioness→Marquise, Mahomet→Muhammad, Abares→Abarians, Palus
Meotides→Sea of Azof, and others). `books/AGENTS.md` forbids this. The
2026-09-21 verdict "0 blocking defects" was therefore wrong for this class.

- Repaired: 93 paragraphs, 131 occurrences reverted to each aligned source
  paragraph's own printed form, using a documented convention. One short
  gloss was added at 12.11 for the restored "Palus Meotides".
- Deliberately kept as ordinary-vocabulary modernization: Muslim, Franciscan
  friar, Imam, Boyar, "Saint …", St. Mark's Square, "clichés".
- Full list, convention and method: `fidelity-review-2-name-sweep.md`.
- Independent verification: two passes by a reviewer who did not make the
  edits. Pass 1 verified the first 90 paragraphs and found 5 misses. Pass 2
  confirmed those fixes and a clean whole-book re-sweep. Structure was
  re-validated (30 chapters / 709 paragraphs, titles unchanged). Verdict:
  VERIFIED CLEAN.
- Every other finding and deliberately preserved item from round 1 stands
  unchanged.
- `accepted-paragraph-hashes.tsv` was regenerated for the new text.

## Final hash and date

```
sha256sum candidate.json
e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25  candidate.json
```

Date pinned: 2026-09-23. Round 2 supersedes the 2026-09-21 hash
`a32b255597e5f0df7809c2a573a205f7b7dcd113276570abbdddb4e735deb641`,
which does **not** cover the publishable text.

This acceptance record covers `candidate.json` at the exact content state
of the hash above. The 2026-09-21 session did not edit the candidate. Round 2
on 2026-09-23 made the edits recorded above and verified them
independently.
