Model: opus

# Chapter 231 — Book Eleven (1812), Chapter 2 — independent verification

Files verified: `ch231-candidate.json` (pre-correction), `ch231-corrected.json`, `ch231-corrections-log.md`, `ch231-source.json`. `ch231-fidelity.md` read for context only; every verdict below was re-derived from the source, not from the log.

## 1. Diff vs log

Paragraph-by-paragraph diff of the two candidates (0-based indices):

| ¶ | Changed in file? | Logged? |
|---|---|---|
| 1 | yes | yes |
| 2 | yes | yes (3 entries) |
| 3 | yes | yes |
| 5 | yes | yes (2 entries) |
| 6 | yes | yes (2 entries) |
| 8 | yes | yes (7 entries) |

Six paragraphs changed, six logged; the log's sixteen entries all resolve to one of them. For each entry the exact "Before" text was confirmed present in the candidate and absent from the corrected file, and the exact "After" text confirmed present in the corrected file. **No mismatch, no unlogged edit, no claimed edit that was not made.**

`number` (231) and `title` ("Book Eleven (1812) — Chapter 2") are identical across source, candidate and corrected.

## 2. Per-change verdicts (re-derived from source)

**¶1 — MODERATE, the ball simile.**
Source: "as inevitably as a ball recoils after colliding with another having a greater momentum, and with equal inevitability the ball of invasion that had advanced with such momentum rolled on for some distance". Corrected: "as inevitably as a ball recoils after striking another that carries greater momentum. And with equal inevitability, the ball of the invasion, which had advanced with such momentum, rolled on for some distance". The three invented size labels ("smaller ball", "a larger one", "that larger ball") are gone; the only relation the source fixes — which ball carries the greater momentum — is preserved, and Maude's own phrase "the ball of invasion" is back. **Correct, no new drift.** (The added article in "the ball of the invasion" is idiomatic and carries no claim.)

**¶2 — MINOR ×3.** Source: "As a bleeding, mortally wounded animal licks its wounds"; "at Málo-Yaroslávets the field of conflict again remained theirs"; "they fled still more rapidly back to Smolénsk". All three restorations match the source: "bleeding" is back, "again" is back (which is the whole point of the parenthesis — it repeats the Borodino outcome), and the second "fled" is back, so the source's repetition of the verb survives instead of being flattened to "retreated". **Correct.**

**¶3 — MINOR, "fought in" → "taken part in".** Source: "as everyone who had taken part in the battle knew it". The candidate had narrowed the class to combatants. **Correct.**

**¶5 — MODERATE, the inverse-square framing.**
Source: "carried forward by the force of its own momentum now seemingly increased in inverse proportion to the square of the distance from its aim." Corrected: "carried forward by its own momentum, which seemed now to be growing in inverse proportion to the square of the distance from its goal." The candidate's simile ("the way a force grows in inverse proportion…") had asserted a general law flatly and then compared the army to it; corrected restores a single hedged predication about this army's own momentum, which is what the source says. **Correct and complete.**

**¶5 — MINOR, "ability" → "possibility".** Source: "there must also be a possibility of doing it, and that possibility did not exist." The paragraph's surrounding list is of circumstances, not of capacities; the candidate's "ability" had relocated the lack into the army. **Correct.**

**¶6 — MINOR, "and so on" restored.** Source ends the run of rhetorical questions with "and so on", marking the list open. Restored. **Correct.**

**¶6 — MINOR, dropped qualifier and superlative.** Source: "at every moment of this continuous, uninterrupted shaping of events the commander in chief is in the midst of a most complex play of intrigues". Corrected restores both the qualifier and "most", and the qualifier now ties back to the preceding "From moment to moment the event takes shape imperceptibly", which the candidate's bare "at every instant" had cut loose. **Correct.**

**¶8 — MAJOR + MODERATE, the two-officers contradiction and the spy.**
Source: "an officer sent to inspect the locality comes in and gives a report quite contrary to what was said by the officer previously sent; and a spy, a prisoner, and a general who has been on reconnaissance, all describe the position of the enemy's army differently."
Corrected: "An officer sent to inspect the area comes in and gives a report quite contrary to what was said by the officer previously sent; and a spy, a prisoner, and a general back from reconnaissance all describe the enemy's position differently."
Verdict: **correct and complete — the MAJOR is fully repaired.** The previously sent officer is restored, so "quite contrary" once again has something to be contrary to; the semicolon restores the source's two separate claims (two officers contradicting each other, then three sources differing among themselves) rather than the candidate's single re-wired contrast. "Spy" is restored, so the list is three distinct kinds of informant again and no longer collides with the general back from reconnaissance. Nothing was added.

**¶8 — MINOR ×5, plus one ruling.** Each checked against the source: "Milorádovich" without "General" (source names him bare); "An order must be given him at once, that instant" (source verbatim, emphatic doubling and indirect object restored); "carries us past the turn" (source "carries us", the deixis prepared by ¶6's "any of us, sitting over a map"); "the commissary general asking where the stores are to be taken" (source's office and phrasing, undoing the candidate's demotion to "supply officer"); "the commander in chief himself needs sleep and refreshment to maintain his energy" (source's purpose clause and intensive pronoun); "on the twenty-eighth it is suggested to him that he cross" (source's agentless suggestion, removing the candidate's invented "someone"). **All correct.**

## 3. New-reader pass on the changed paragraphs

All six read clearly. ¶8 is the most improved: the restored semicolon list now makes sense on first reading, where the candidate's "reports one thing; a scout, a prisoner…" left the reader hunting for what the officer's report contradicted. "An order must be given him at once, that instant" is faintly archaic in its dative but unambiguous, and the doubling is the source's own urgency. ¶1's simile is easier without the size labels, since the reader is no longer asked to hold a size relation that the argument never uses. ¶5's restored clause is a longer noun phrase than the candidate's dash construction but is a single claim rather than two.

## 4. Structure and punctuation

- Paragraph count 9 in source, candidate and corrected; order unchanged; no empty paragraphs.
- Question-mark and exclamation-mark counts match the source in all 9 paragraphs (including ¶6's three rhetorical questions and ¶8's "When had it been decided?").
- Double-quote counts match the source in all 9 paragraphs.
- JSON parses; key set unchanged.

## 5. New findings

- The MAJOR finding (¶8) and all three MODERATE findings (¶1, ¶5, ¶8) are addressed. **No MAJOR or MODERATE finding remains.**
- New finding (MINOR, non-blocking, pre-existing — present in the candidate and not touched this round): ¶5 renders the source's "the very next morning after the battle" as "the very next morning", dropping "after the battle". The referent is recoverable from ¶4 and the preceding clause, so nothing is misread, but the anchor is lost. Worth a three-word restoration on any later pass.
- Non-blocking, as the log records: ¶8 mixes date formats ("the twenty-eighth", "August 24", "September 1", "the twenty-sixth"). This is a house-consistency issue rather than a fidelity one, and the source itself mixes ("the twenty-fourth of August", "the first of September"), so it does not block.
- "The Drissa camp" and "the Shevardino Redoubt" are Maude's own recurring phrases and are correctly left alone per the review's explicit ruling.
- No new drift was introduced by any of the six corrections.

Verification: ACCEPT
sha256: e10a5b1dd65e1a9b1c4b1c538dadb98a387972f21538ae4a7a391f8e47548403
