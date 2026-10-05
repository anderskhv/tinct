# The Adventures of Sherlock Holmes character package

All twelve stories (chapters 1–12) in both live English editions: 160 recognition cards per edition. Holmes is Central. Watson, each story's principal clients and antagonists, and the people whose identity is the mystery are Major. Speaking and acting figures are Supporting, and named people who are only mentioned are Reference. Each story is self-contained, so story-local figures bind only inside their own chapter. Only a small set of recurring figures binds across stories, all with explicit per-paragraph rules: Holmes, Watson, Lestrade (4, 10), Bradstreet (6, 7, 9), Mrs. Hudson (7, 8), Irene Adler (1; 3:6, 3:99, 7:6), the King of Bohemia (1; 3:6, 3:99, 12:6) and Mary Sutherland (3; 2:9, 7:6, 12:6).

Source of truth: `editorial.json` (copy, aliases, chapter scopes, paragraph rules and exclusions). Binding logic: `../entities/adventures-of-sherlock-holmes.py`, interpreted by the unchanged `build_reviewed.compile_package`. Inventory evidence from complete readings of both editions is in `source-notes.json`, which covers concealments, namesakes, deliberately unbound phrases and edition divergences per story. It contains spoilers. `cards.md` and `source-review.md` are generated reading copies and also contain spoilers.

## Spoiler and identity gates

Coordinates are `story:paragraph`, with zero-based paragraphs and gates at paragraph end. First cards are safe at the start of each story. Suspicion is attributed rather than asserted. Disguise names and aliases have their own cards and are never bound to the real person before the reveal. Where a role label would itself hint at the solution, it is hidden until the reveal.

- **1 Scandal:** Count Von Kramm is a separate card, renamed after 1:55, and "your Majesty" binds only from 55. Irene's marriage unlocks after 1:141, and "Madame", "my husband" and IRENE NORTON bind only after it. The slim youth in an ulster is a separate card, revealed as Irene after 1:243. Holmes's groom and clergyman disguises, the faked injury and the hired crowd are unbound.
- **2 Red-Headed League:** Vincent Spaulding and John Clay are separate cards, linked after 2:208, where Holmes finishes the tunnel explanation; Spaulding's role label is hidden until 2:205. William Morris (2:100) and Archie are separate cards. Archie is never merged with Duncan Ross, because the text does not state it.
- **3 A Case of Identity:** Hosmer Angel and James Windibank are separate cards, linked after 3:124. Windibank's role label and the mother's connivance unlock at 3:124. Westhouse & Marbank as Holmes's "firm in the City" unlocks at 3:134.
- **4 Boscombe Valley:** John Turner's guilt unlocks after 4:192, with his confession after 4:208 and death after 4:214; his role label is hidden until 4:192. Black Jack of Ballarat is a separate card, revealed after 4:202. The secret Bristol marriage unlocks after 4:113. Bare "McCarthy" denotes Charles except at 4:211.
- **5 Five Orange Pips:**
  - K. K. K. stays letters only until 5:127. The card is renamed after 5:133.
  - Calhoun's role unlocks after 5:165 and his fate after 5:177.
  - Murder framings are attributed to Holmes.
  - Bare "Openshaw" binds by paragraph only.
- **6 Twisted Lip:** Hugh Boone is a separate card, identified as Neville St. Clair after 6:195; his role label is hidden until then. Holmes's opium-den disguise (6:14, 27, 32) is unbound. Watson's wife calling him "James" at 6:8 is left unbound and recorded as a source inconsistency.
- **7 Blue Carbuncle:**
  - "John Robinson" is a separate card, revealed after 7:168.
  - Ryder's guilt unlocks after 7:183, and his role label is hidden until then.
  - Mrs. Oakshott is identified as Ryder's sister after 7:190.
  - Horner's innocence unlocks after 7:185.
- **8 Speckled Band:**
  - "band", "speckled band" and "serpent" are never bound.
  - The swamp adder card first appears at 8:244.
  - Roylott's death unlocks at 8:244 and Holmes's full explanation at 8:250. The adder's card first appears at 8:244, with its explanation after 8:247 and 8:250.
  - "the Doctor" is always Roylott in this story, never Watson.
  - "Miss Roylott" (8:69) denotes Helen.
- **9 Engineer's Thumb:** Elise's name unlocks after 9:128 and the coiners after 9:157. Dr. Becher's part is **left unresolved**: the text does not settle whether he is Ferguson or the gang's host, so the "foreign patient" phrase is unbound.
- **10 Noble Bachelor:** "F. H. M." is a separate card, attributed to Moulton after 10:206. Hatty's prior marriage unlocks after 10:204. Moulton is first named at the reveal (10:197) with a neutral card.
- **11 Beryl Coronet:**
  - Arthur's innocence unlocks after 11:198 and 11:210.
  - Mary's flight unlocks after 11:202 and her part after 11:207; her role label is hidden until 11:207.
  - Burnwell is identified as the man in the lane after 11:208, with his role label hidden until then.
  - The illustrious client is never identified.
- **12 Copper Beeches:** Alice Rucastle's first card reports only her father's claim. Her imprisonment unlocks after 12:169, and her role label is hidden until then. The man in the road is a separate card, renamed after 12:209. Bare "Rucastle" binds only at 12:194 and 12:211.

## Editorial checks (run 2026-10-05)

1. **Namesakes.** Each story's namesakes are listed with how they are told apart in `source-notes.json`. The main cases:
   - **John:** the coachman (1), John Clay (2), John Turner and John Cobb (4), John Openshaw and John Swain (5), the dog-cart driver (6, unbound), John Horner and "John Robinson" (7). John never denotes Watson.
   - **James:** Windibank (3), McCarthy (4), Calhoun (5) and Ryder (7). The one Watson "James" (6:8) is unbound.
   - **Shared surnames:** McCarthy and Turner (4), the three Openshaws (5), Rucastle (12), St. Simon (10), Holder (11), Armitage (8) and Stoner (8).
   - **Maids named Mary and Alice:** Mary Jane (1), Mary at Horsham (5), Mary Holder (11), Alice Turner (4), the maid Alice (10) and Alice Rucastle (12). These are scoped to their own stories.
   - **Other mix-ups:** "Hudson" at 5:87 is not Mrs. Hudson, and Mrs. Turner (1) is not Mrs. Hudson. The King of Scandinavia (1, 10) is not the King of Bohemia.

   No occurrence was bound by guesswork: unresolved ones are listed as unbound.
2. **Person or not.**
   - The Lone Star is a ship (`reference`).
   - Westhouse & Marbank is a firm (`group`), and K. K. K. is a society (`group`).
   - Carlo, the cheetah, the baboon and the swamp adder are animals.
   - Families are `family`. Unnamed figures are `unnamed-person`. Initials and diary names are `unresolved-name` or `reference`.
   - "Openshaw" as the tyre brand (5:34) and "Baker Street" are excluded.
3. **Historical and literary references.** Real people (Sarasate, Flaubert, George Sand, Balzac, Hafiz, Horace, Petrarch, George Meredith, De Quincey, Clark Russell, Cuvier, John Hare, Lee, Hood, Jackson, Palmer, Pritchard) are Reference cards with plain identification. Where the text gives only a surname, external identification is hedged ("generally identified as"). Earlier-case titles and The Sign of Four are not imported beyond the Sholto mention.
4. **Ambiguous or generic references.** Pronouns, the narrator's "I", "my friend" and "my companion", "the inspector", "my wife", "father" and "the prisoner" bind only in listed paragraphs, and only where the text settles the referent and binding spoils nothing. Every other ambiguous reference is listed under `unbound` in `source-notes.json`: Holmes's disguises, the wedding crowd, the "foreign patient", the moor-side clergyman and others.
5. **Spot-read.** 28 randomly sampled mentions (14 per edition, seed 20261005) were read in context. All denoted the bound person. The sample included the trap "Miss Roylott" (8:69), which is correctly bound to Helen. Twelve full-story readers also verified every alias and rule against the text, and the compiled counts and first mentions match their independent counts. The one discrepancy (Violet Hunter, 22 counted against 23 bound) was a counting slip, and the extra mention is correct.
6. **Both editions independently.** Each story was read in both editions. Divergences are recorded per story, for example:
   - 1:244 wording
   - 3:134, where the modern edition names Windibank
   - 9:166, where the modern edition drops Becher's name
   - 4:131, where the modern edition names Lestrade

   No entity is omitted from either edition. Mention totals are 1,870 (original) and 1,863 (modern) at revision 2026-10-05.2.

## Verification

```sh
python3 books/characters/entities/adventures-of-sherlock-holmes.py          # rebuild
python3 books/characters/entities/adventures-of-sherlock-holmes.py --check  # byte-identical rebuild
```

The app's own `verifyCharacters` and `releasedCard` were run in memory with a temporary release entry, outside the repository. Both editions verify, source drift is rejected, and 1,036 gate checks pass (revision 2026-10-05.2), covering cards hidden before first mention, snapshots hidden before and shown at their gates, and role labels. The existing character suite (`npx vitest run src/services/characters`) passes 503/503, unchanged.

Release owner: copy `characters.v1.json` to `app/public/data/characters/adventures-of-sherlock-holmes.v1.json`, add the `characterReleases` entry from `books/wip/adventures-of-sherlock-holmes/release/characterReleases-entry.txt`, then run app gates and production verification. A validated package is not live coverage.

## Independent editorial review (2026-10-05)

Seven fresh reviewers who did not write the content each covered two stories, or the intro and onboarding. They read the full text in both editions and checked:
- every card, snapshot and gate;
- every bound mention, in context;
- every cast-list thread.

They raised 89 findings in total:
- **Story findings:** 83, none of them blockers. Three were major: Watson's marital status in story 10, the maid's thread in story 10, and Rucastle's confrontation in story 12.
- **Intro/onboarding findings:** 6.

Fixes were applied to 81 of the 83 story findings and all 6 intro findings. S4-08 (a Baxter card relying on external attribution) and S7-08 (marked acceptable as is by its reviewer) are recorded as justified.

A separate fresh rechecker confirmed:
- 87 findings resolved and 2 justified;
- 4 issues introduced by the fixes (1 major, 3 minor).

All four were then corrected with the rechecker's exact text. The records are in `books/wip/adventures-of-sherlock-holmes/qa/character-review/`.
