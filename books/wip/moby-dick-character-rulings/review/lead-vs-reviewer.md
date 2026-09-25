# Lead vs independent reviewer — comparison

The reviewer derived its rulings blind: it reproduced the inventory itself from the pinned inputs and never saw the lead ledger. The comparison below is field by field, covering the key (characterId, chapter, paragraph, existing span), the decision and the exact final span.

| ID | Character | Ch.¶ | Lead | Reviewer | Final span (lead = reviewer) | Agree |
|---|---|---|---|---|---|---|
| MD-01 | queequeg | 13.0 | drop (descriptor-in-source) | drop (drop-epithet) | — | yes |
| MD-02 | queequeg | 13.6 | drop (epithet-in-source) | drop (drop-epithet) | — | yes |
| MD-03 | queequeg | 16.2 | map (moved-within-clause) | map (map-same-clause) | [557,565) "Queequeg" | yes |
| MD-04 | peleg | 16.62 | drop (pronoun-in-source) | drop (drop-pronoun) | — | yes |
| MD-05 | queequeg | 18.21 | drop (no-name-in-clause) | drop (drop-no-name-in-clause) | — | yes |
| MD-06 | moby-dick-whale | 41.18 | drop (pronoun-in-source) | drop (drop-pronoun) | — | yes |
| MD-07 | ahab | 44.8 | drop (live-sentence-not-in-source) | drop (drop-not-referenced-in-counterpart) | — | yes |
| MD-08 | moby-dick-whale | 44.8 | drop (pronoun-in-source) | drop (drop-pronoun) | — | yes |
| MD-09 | ahab | 44.9 | drop (live-sentence-not-in-source) | drop (drop-pronoun) | — | yes |
| MD-10 | ahab | 48.20 | drop (resumptive-repetition-removed) | drop (drop-merged-into-held-span) | — | yes |
| MD-11 | ahab | 48.20 | map (moved-within-clause) | map (map-same-clause) | [1294,1298) "Ahab" | yes |
| MD-12 | flask | 48.23 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-13 | stubb | 48.30 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-14 | tashtego | 54.2 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-15 | tashtego | 61.14 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-16 | stubb | 61.18 | drop (no-name-in-clause) | drop (drop-live-invention) | — | yes |
| MD-17 | moby-dick-whale | 64.2 | drop (no-name-in-clause) | drop (drop-descriptor) | — | yes |
| MD-18 | starbuck | 64.4 | drop (live-sentence-not-in-source) | drop (drop-not-referenced-in-counterpart) | — | yes |
| MD-19 | queequeg | 66.2 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-20 | queequeg | 66.2 | drop (live-sentence-not-in-source) | drop (drop-live-invention) | — | yes |
| MD-21 | queequeg | 72.7 | drop (pronoun-in-source) | drop (drop-pronoun) | — | yes |
| MD-22 | daggoo | 78.4 | drop (descriptor-in-source) | drop (drop-epithet) | — | yes |
| MD-23 | moby-dick-whale | 134.13 | map (moved-within-clause) | map (map-same-clause) | [522,537) "the White Whale" | yes |

**23 of 23 agree** on decision and exact span.

MD-24, the retained duplicate at 61.8, was found by the reviewer's all-span overlap check. The lead confirmed it independently from a fresh re-anchor run: `stubb 61.8 [344,349)` appears twice, and it is the only duplicate or overlap in the 1,749 retained mentions. Both rule drop for the copy that originates from live @252.

The reviewer and the lead each flagged MD-08 as the closest call, a clause-level versus sentence-level question. Both ruled drop.
