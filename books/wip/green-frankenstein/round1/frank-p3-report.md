# Frankenstein modern-en — fidelity/listenability review, part 3

Scope: chapters 15–21 (titles "Chapter 11"–"Chapter 17"). Source: `books/wip/green-frankenstein/source.json`; candidate: `candidate.json` (read-only, not edited).

## What I read
Every paragraph pair in full, source vs candidate, in order with neighbors visible:
ch15 ¶0–17 (18), ch16 ¶0–18 (19), ch17 ¶0–21 (22), ch18 ¶0–19 (20), ch19 ¶0–37 (38), ch20 ¶0–36 (37), ch21 ¶0–20 (21) = 175 paragraphs. Nothing sampled. Paragraph counts match source in all seven chapters.

## Findings (65 proposals, 16 blocking) — `frank-p3-proposals.json`
Every "old" was checked with Python: exact, unique in its paragraph, no overlapping edits in the same paragraph.

- **Omission (28; 6 blocking):** Pandæmonium allusion replaced by "the finest palace" (15.8); Mont Cenis name dropped (18.9); Plutarch paragraph's opening sentence ("first founders of the ancient republics") missing (19.5); "greater degree of plenty" missing (19.9); "same species and same defects" dropped from the Creature's demand (20.36); "fearful, perhaps, of any change in my sentiments" missing (21.17). Plus non-blocking smaller losses: dropped hedges ("I believe" 16.4/16.10), the Creature learning the word "rain" (16.14), "loathsome" (17.16), "as many on record have been" (17.14), "something out of self" (19.3), "and the lovely moon" (19.11), "the justice ... from any other being in human form" (20.15), "the antelope" (19.37), etc.
- **Addition (3; 2 blocking):** "cruelty of men" pulled into 15.9 from 15.10; "answered only by groans" imported from 17.20 into 19.4; "went down some stairs" (15.0).
- **Meaning (21; 4 blocking):** hovel/cottage subject swap (15.10); "as I now suppose" hedge turned into knowledge (15.0); servant vs daughter following with the property — actor change (18.17); "these thoughts vanished" misattached so the thoughts of friends seem to vanish (20.11); plus non-blocking certainty/wording shifts ("obviously" for "seemingly", "hesitation" for "change of feeling", "humane" for "human", "arch-enemy, because my creator" causality, "the day ... arrived" for "was fixed", etc.).
- **Epithet (5; 1 blocking):** "replied the fiend" → "the creature" (21.4, blocking); "The being" → "The creature" (21.0); "the fiend within me" → "devil" (20.35); "filthy mass" → "grotesque" (21.11); Creature's self-epithet "(foolish wretch!)" → "foolishly" (16.16).
- **Other (7; 3 blocking):** "Werter" silently normalized to "Werther" and title expanded to "The Sorrows of Young Werther" (19.2, 19.3 ×2; 19.5 fixed inside its omission edit) — source spelling must be kept; "kennel" image (15.10); "twenty leagues" converted to "sixty miles" though leagues kept at 18.8 (18.19); "sea of ice" recurring term (21.17); rhetorical "a hundred and a hundredfold" (21.6).
- **Reference (1):** "siroc" replaced by "a deadly storm" (21.19) — restore as "sirocco — the hot desert wind".
- **Aloud:** No standalone aloud defects found; the candidate's sentence splitting generally reads well. The 15.0 hedge fix and 20.5 "peaceful dreams" fix also help comprehension aloud.

## Considered and rejected
- Ratio-shortened paragraphs (e.g. 15.0, 16.4, 17.15, 20.20–20.23): most compression is natural; only concrete content losses proposed.
- Glosses for Paradise Lost, Plutarch, Werter, Volney's _Ruins of Empires_, "syndic": not needed — the text itself frames each as a book/title, and "syndic" is established earlier (5.0). Only Pandemonium (inside its restoration) and sirocco get a brief gloss.
- "Like the devil himself" for "like the arch-fiend" (20.1): acceptable rendering of Milton's Satan; not a Creature epithet.
- "forced patience" for source "forced impatience" (20.11): left; ambiguous in source, candidate reading defensible.
- "over conquerors like Romulus and Theseus" (19.5): slight gloss, consistent with the source's contrast with "peaceable lawgivers"; left.
- Creature's contractions/informal register throughout ch19–21: kept per RULES.
- Minor drops judged not worth churn: "excellent" (15.15), "the loved Felix" (17.18), "my pulses paused" (19.19/20.19), "heath" (20.12), "chain of ... events" (21.13), "the fountain" vs "a fountain" (21.18), "in his power" → "anyone's power" (15.11), "often" → "sometimes" (15.3).
- "[The moon]" bracket in 15.2 is in the source; kept.
