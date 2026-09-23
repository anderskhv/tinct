# Book 12 — independent fidelity review (b12-draft.json)

**Verdict: BLOCKING FINDINGS**. 15 findings: 8 blocking and 7 non-blocking. The findings are in `b12-fidelity.json`, and every `old` string was checked by script to be exact and unique in its paragraph.

I read all 39 of 39 paragraphs against `source-book12.json` (Butler, PG #1727), in packets of seven with overlapping neighbours. I then re-read the whole Book for continuity and compared its recurring phrasing with accepted Books 1–11. Books 10 and 11 were compared directly. `scripts/compound_drift.py` was run with the draft; it covers Books 1–9.

## Drafter claims verified
| Claim | Result |
|---|---|
| The frame quotation reopens in every paragraph and closes only at P38 | **TRUE.** All 39 paragraphs open with “ and only P38 ends ”. Per paragraph, the counts of “ ” ‘ and closing ’ match Butler's exactly (the only differences are two apostrophes). |
| Nested speech is in single quotes | **TRUE.** Butler's unclosed nested speech across P4→P7 (Circe) is also kept. |
| Hyperion is restored and Helios removed | **TRUE.** Hyperion appears 3 times in both source and draft, and Helios 0 times in both. |
| Lampetie is kept | **TRUE.** 2 in source, 2 in draft. Lampetia appears 0 times. |
| Argives is restored | **TRUE** (P14). Greeks appears 0 times. Achaean and Trojans are kept. |
| The fixed dawn formula is used | **TRUE** at P1 and P24. P11's "dawn enthroned in gold" is a different formula of Butler's and is correctly kept separate. |
| The ironic "fine work" line | **TRUE** (P29). |
| The fisherman's "spear" | **TRUE** (P19): "seated with his spear in hand … ox-horn tip of his spear". **But** the note on the same simile says "munch them up" was restored, and that is **false**. The draft prints "lift these struggling men up to her rock and devour them" (finding P19). |

Other drafter claims that are false:
- "Aeaea" is not a Butler spelling. It occurs 0 times in PG #1727 (P0).
- The note says there is "no rule against" "sea-gulls". There is: D15, together with the accepted Books 3 and 5 `seagull(s)`.
- The note says "sun-god" is absent from Books 9 and 10. That is true, but accepted Book 1 already prints "sun-god Hyperion", so the draft is consistent with Book 1.

## Blocking (8)
- **P0**: the draft invents the name form "Aeaea". It should be "the Aeaean island".
- **P11**: the archaism "whereon" is left standing. It should be "At that".
- **P11**: the stock epithet is "great and **clever** goddess". Butler has "cunning", and B10-P11 and B11-P0 both print "cunning".
- **P19**: the second half of the simile is lost ("land these panting creatures … munch them up").
- **P21**: Eurylochus's "you are cruel" is softened to "hard".
- **P35**: "sea-gulls" should be "seagulls". This is a compound drift and the check fails on it.
- **P36**: Butler's parenthetical "(which drifted about by itself)" lost its parentheses, and "about" became "off".
- **P37**: "salt sea water" should be "salt seawater". This is a compound drift against Book 5 and the check fails on it.

## Non-blocking (7)
- **P6**: "Halfway up" should be "In the middle of it".
- **P7**: "spits" should be "vomits". The same verb is kept as "vomited" at P19.
- **P21**: "dismayed" should be "in despair".
- **P33**: "soon" should be "at once".
- **P34**: "the mast" should be "our masts".
- **P34**: the helmsman's position, "in the ship's stern", was dropped.
- **P36**: "ox-hide" should be "ox hide", the open noun used in B02 and B10.

## Cross-Book notes (not findings against Book 12)
- **Book 11 has a drift of its own.** B11-P7 prints "the sun god": open, and with "god" added, where Butler has just "the sun". Book 1 and this draft print "sun-god". A later successor of Book 11 should align it.
- **The fair-wind formula is worded differently.** B11-P0 has "blew steadily behind us". B12-P11 has "blew steady from astern and stayed with us". Both are faithful to Butler's "blew dead aft and staid steadily with us", so this is not a finding, only a difference in wording.
- **The hazards check out.** The Roman→Greek mapping is complete: Ulysses 4, Jove 9, Saturn 2, Neptune, Juno and Mercury 1 each, and none remain in the draft. Teiresias→Tiresias follows the Cast display name (`odyssey-threads.json`) and matches Books 10–11. "heaven" is unchanged (6 = 6). Ops and Rhea are absent. The Wanderers (P5) and the Wandering rocks (P20) are kept distinct. Both bracket instances are handled per class B/C.
