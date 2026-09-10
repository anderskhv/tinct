# Macbeth recognition cards

Validated content package 2026-09-10.1 covering all 28 scenes. Authoring-agent source review; no independent editorial review claimed.

- 63 original-English entries and 1,014 exact mentions.
- 58 modern-English entries and 1,036 exact mentions. Paddock, Harpier, Bellona, Neptune, and Belzebub are not named in this rendering and are omitted.
- Both sources have 806 paragraphs and match the current shipping checkout byte for byte.
- Short stable identities, with only meaningful title/identity updates: Macbeth’s Cawdor title and kingship, the prior Cawdor holder, Duncan’s former kingship, Malcolm’s accession, and Hecate’s participation. No chapter-by-chapter plot recaps.

[Cards](cards.md) · [Source worksheet](source-review.md) · [Validation](validation-report.json) · [Compiled asset](characters.v1.json).

## Reviewed ambiguity and spoiler handling

The old Cawdor holder and Macbeth are distinguished even within Macbeth’s single speech in scene 3 paragraph 30. The first card does not call the old holder “former”; that name and the transfer become available only after Duncan orders it. Macbeth is not identified as king before the relevant source passage. Malcolm’s accession is likewise gated until the final acclamation.

Lady Macbeth/Macduff are not merged with their husbands; Young Siward is distinct from his father. The doctor at the English court and the doctor at Dunsinane have separate identities. Anonymous servants and messengers are scoped to their scenes rather than invented as one recurring person. The First Murderer in the Macduff household is not assumed to be the same individual as Banquo’s attacker. Groups and anonymous speaking roles are explicit kinds.

The three apparitions identify their visible forms only; they do not explain the later fulfillments of their messages. Banquo’s banquet ghost and the figure in the later vision have source-specific bindings. Hecate starts as a referenced goddess; her supporting role and relationship to the witches are released when she speaks. Harpier’s animal form is not invented. Lady Macbeth’s reference to nursing a child does not justify adding an identified living child to the cast.

Coverage excludes generic crowds/pronouns, places, adjectival allusions, ordinary divine oaths, and hypothetical figures in the porter’s jokes. It does not claim every lowercase title as a lookup target. Named cultural references and the witches’ familiars are included.

Supplementary contextual checks: [Folger Macbeth text](https://www.folger.edu/explore/shakespeares-works/macbeth/read/), [The Shakespeare Project’s opening glosses](https://theshakespeareproject.com/macbeth/macbeth-1-1-glosses.html), and the [public-domain annotated Macbeth scan](https://tile.loc.gov/storage-services/public/gdcmassbookdig/macbeth04shak/macbeth04shak.pdf). Reader copy is newly authored; no external annotation prose was copied.

## Validation and release

Regenerate with `python3 books/characters/macbeth/author_content.py` and `python3 books/characters/build_macbeth.py`; check with `python3 books/characters/build_macbeth.py --check`. The content suite has 32 passing tests, including 10 Macbeth tests for exact spans, title transfer, doctors, murderers, family labels, apparitions, speaking-role coverage, and omissions.

Release owner: install as `app/public/data/characters/macbeth.v1.json`, register original-en and modern-en with a versioned URL, run app/build/bundle checks, and verify production. Important browser cases: scene 3 paragraph 30 mixed Cawdor owners; scenes 20/21 doctors; scene 18 apparitions; returning to an early Macbeth card after visiting later scenes. No live coverage is claimed until the owner confirms publication.
