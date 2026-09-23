# Books 1–9: candidate-only accessibility review, coordinator screening (2026-09-23)

Books 1–9 were accepted on 2026-09-12/13 after source-based round-1 reviews (`bookNN/review/findings-v1.md`), but they never had a separate candidate-only accessibility review. That review was run on 2026-09-23 on each Book's latest file: B1 v4, B2 v6, B3 v3, B4 v6, B5 v3, B6 v3, B7 v2, B8 v2, B9 v3. Each reviewer was a fresh Sonnet agent that read only the candidate text. Findings are in `bNN-access.json`/`.md`.

Screening rule: apply blocking findings, adapting the wording where needed so Butler's content stays, and apply non-blocking findings only when they fix a real mishearing. Reject any finding that deletes Butler's content, replaces Butler's names or epithets, adds a gloss Butler lacks, or reverses a documented round-1 ruling.

| Book | Findings (blocking) | Applied | Rejected, with reason |
|---|---|---|---|
| 1 | 3 (1) | 0 | ¶30 "chief" vs ¶13 "king" of the Taphians (blocking): Butler varies it himself (¶7 and ¶30 "chief", ¶13 "King"), and the edition keeps Butler's words. ¶4 "who": Butler's nearest antecedent (Atlas) is correct. ¶7 "draughts": Butler's word, and the game is clear from context. |
| 2 | 3 (0) | ¶10 "gain nothing" | ¶0 "comeliness of presence", ¶3 "unless it be that": Butler's register, understandable. |
| 3 | 3 (0) | 0 | ¶5 "God": Butler's word. ¶22 "his wife": Butler's syntax, clear in context. ¶29 "the Trito-born": Butler's epithet. |
| 4 | 6 (0) | 0 | ¶8 "so long as": faithful to Butler's "so that" (a condition). The rest are Butler's names or nautical words ("son of bright Dawn", "Halosydne's chickens", "thole pins", "pulling the door to", "been beforehand"). |
| 5 | 4 (2) | ¶29 simile reordered (blocking) | ¶33 "riverhood" (blocking): overruled. It is Butler's coinage and was KEPT by ruling (`book05/continuity.md`, B05-P034), and "draw near to your stream" anchors it. ¶9 "thrice-plowed", ¶19 "adze": Butler's words. |
| 6 | 6 (1) | ¶12 "following me" (blocking) | ¶1 Dymas possessive (an edit was tried and reverted after re-verification: "who" attached to Dymas); ¶8 simile, ¶11 "suppliant", ¶12 "Ogygian", ¶24 epithet order: Butler's names and formulas. |
| 7 | 8 (2) | ¶6 "Rhexenor" named (blocking) | ¶25 Euboea/Rhadamanthus/Tityus (blocking): overruled, because the proposed rewrite deletes Butler's anecdote; the passage is already split into short sentences, and the names are Butler's. ¶3, ¶5, ¶8, ¶9, ¶14, ¶15: Butler's statements and words. |
| 8 | 5 (1) | ¶16 "a hereditary" | ¶5 Pytho (blocking): overruled, because the proposed rewrite deletes Butler's "crossed the stone floor to consult the oracle", and "the oracle" is named in the same clause. ¶7 Butler's list of names; ¶15 Butler's names; ¶41 "had had" is grammatical. |
| 9 | 10 (1) | ¶25 auger clause (blocking, adapted) | "subtlety", "hawsers", "livelong day", "even so": round-1 rulings (`book09/continuity.md`, findings-v1 M-2). "station": the edition's fixed noun. Others are Butler's time images and words. |

The edits applied, with their reasons, are in `acc19-edits.json`. They were independently re-verified; see `acc19-verify.md`.
