# Alice — proposed metadata and taxonomy

Proposal only; no registry or library metadata has been changed.

| Field | Proposal | Basis |
| --- | --- | --- |
| id | `alice-in-wonderland` | Assigned id |
| title | Alice’s Adventures in Wonderland | Validated source |
| author | Lewis Carroll | Validated source; Charles Lutwidge Dodgson is the author’s legal name, not a second author |
| year / ySort | `1865` / `1865` | First publication; digital baseline includes later verse continuations as documented in SOURCE.md |
| House | `novel` — Novels | Existing House identifier |
| primary Shelf | `english-novels` — 19th-Century English Novels | English Victorian prose fiction |
| additional Shelf | `satirical-novels` — Satire | Parodies of instruction, manners, argument and judicial procedure |
| form | `novel` | A continuous twelve-chapter narrative with inset verse |
| era | `modern` | Existing taxonomy’s nineteenth-century key; historical description: Victorian |
| themes | `language`, `identity`, `authority`, `dream`, `nonsense` | Specific to the reading text |
| hue | `150` | Optional visual proposal: green; not a generated cover |
| langs | `["EN"]` | Both supplied editions are English |
| source words | 26,298 | Whitespace count of the final original JSON |
| modern words | 23,561 | Whitespace count of the final modern JSON |
| reading units | 12 chapters, no sections | Agreed structure |

Suggested blurb: **Alice follows a hurried rabbit into a world of shifting sizes, disputed meanings and impatient rulers.**

The existing `childrens-classics` shelf could be added as a cross-shelf by the integration owner if desired. The supplied text is the complete literary work and a general-reader modern rendering; no abridgment or separate children’s edition is proposed.

## Canon and lists

Proposed explicit canon/list memberships: **none (`[]`)**. No Alice occurrence was found in the reading-list definitions inspected at instruction revision `37876e623fd7bb69cce705a5fe14dfde9e8500d3`. Do not infer a position in Bloom, Columbia, St John’s, Great Books or The Well-Educated Mind from the novel’s reputation. A later membership needs a list-specific source and exact item match. No featured-ten membership is proposed.

## Edition defaults

After independent content acceptance: primary `modern-en`; Compare `original-en`. Both have 12 chapters and 789 paragraphs in exact correspondence. No translator credit for the English original. Credit the modern edition as the Tinct modern-English rendering. Do not claim that modern and original wording are identical or that the original is the first-impression 1865 text.

Source/rights, source revision, acclaim attribution and hashes are in SOURCE.md and HANDOFF.md. Runtime availability, defaults, metadata, character generation, cache identity, builds and publication remain Claude’s later integration work under this assignment.
