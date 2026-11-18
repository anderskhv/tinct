# V5 final corrections verification

Note: the slice's `p` is the 0-based index into `batches/chNN.json` `paragraphs`; in every case that paragraph (1-based position p+1) equals the slice's `current` text exactly (no drift).

| Para | Verdict | Note |
|---|---|---|
| ch03 p17 | VERIFIED | Doge glossed 'chief executive' (fixed term); all content, 'POWERFUL' caps kept. |
| ch09 p1 | VERIFIED | Ungrammatical 'principles ... that were' fixed by apposition; full fidelity, ORBIT/ENLARGEMENT caps kept. |
| ch42 p16 | VERIFIED | 'may have the power ... or rather every State is placed under a necessity, to confer' now grammatical and faithful; quotations verbatim; 'several' (a few) kept. |
| ch44 p4 | VERIFIED | 'the same reasons that show the necessity' restored; verb agreement fixed; nothing omitted. |
| ch44 p12 | VERIFIED | 'It is evident that' restored; faithful. |
| ch46 p1 | DEFECT | Source's 'therefore' (on the side of these, THEREFORE, the popular bias) is dropped, losing a logical connective the style note requires. Fix: insert 'therefore'. The 'suggested on a former occasion' fix is good. |
| ch51 p5 | VERIFIED | 'Just as ... so' correctly renders 'As ... the weakness ... on the other hand'; faithful. |
| ch51 p9 | VERIFIED | 'impracticable' restored; 'Second.', faction/republic terms, structure all faithful. |
| ch58 p14 | VERIFIED | 'secessions by members' is a short in-sentence clarification supported by the quorum context; otherwise faithful. |
| ch66 p11 | VERIFIED | 'chief executive' fixed term applied; faithful. |
| ch69 p10 | VERIFIED | 'denizens' gloss in parentheses is brief and accurate; 'who are chosen at regular intervals' grammatical. |

## DEFECT: ch46 p1 (corrected paragraph)

```
Many considerations, in addition to those suggested on a former occasion, seem to put it beyond doubt that the people's first and most natural attachment will be to the governments of their own States. More individuals will expect to rise into the administration of these governments. More offices, with the pay attached to them, will flow from their gift. Their watchful care will regulate and provide for all the more domestic and personal interests of the people. The people will know their affairs more familiarly and in more detail. And a greater share of the people will have ties of personal acquaintance and friendship, and of family and party attachment, with their members. The popular bias, therefore, may well be expected to lean most strongly toward these governments.
```

## Replacements

```json
[
 {
  "chapter": 46,
  "p": 1,
  "replacement": "Many considerations, in addition to those suggested on a former occasion, seem to put it beyond doubt that the people's first and most natural attachment will be to the governments of their own States. More individuals will expect to rise into the administration of these governments. More offices, with the pay attached to them, will flow from their gift. Their watchful care will regulate and provide for all the more domestic and personal interests of the people. The people will know their affairs more familiarly and in more detail. And a greater share of the people will have ties of personal acquaintance and friendship, and of family and party attachment, with their members. The popular bias, therefore, may well be expected to lean most strongly toward these governments."
 }
]
```
