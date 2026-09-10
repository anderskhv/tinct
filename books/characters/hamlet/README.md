# Hamlet recognition cards

Content package 2026-09-10.1, ready for app integration. Source and identity bindings reviewed by the authoring agent across all 20 scenes; no independent editorial review is claimed.

- 80 authored entries: cast, speaking minor roles, companies, roles inside the performed play, and named cultural references.
- Original English: 80 entries, 1,851 exact mention spans.
- Modern English: 67 entries, 1,847 exact mention spans. Thirteen named references are omitted rather than invented where the rendering explains or removes the name.
- Both editions: 20 scenes, 1,391 paragraphs. Source fingerprints match the current shipping checkout.
- Recognition copy stays brief. Only the Ghost has two later identity clarifications; its identity claim and Major label remain gated until the end of scene 5 paragraph 11. No murder accusation, motive, or plot outcome is added to that card.

[Cards](cards.md), [source worksheet](source-review.md), [validation report](validation-report.json), [compiled asset](characters.v1.json).

## Binding review

The Hamlet named in scene 1 paragraph 53, scene 2 paragraph 4, and scene 19 paragraph 64 is the dead king. In scene 4 paragraph 15, Hamlet's speaker label remains the prince, but his address “Hamlet, King, father” points to the apparition. Young and elder Fortinbras are distinguished inside the same speech. The stage King/Queen inside the performed play are separate from Claudius/Gertrude, including the dumb show. Literal royal titles and metonymic Norway uses have reviewed exceptions. Generic ghosts in threats or proverbial remarks do not bind to the apparition.

Stage directions and speaker labels are part of the edition text and get exact offsets. This package uses the existing `prose-reader-v1` normalization because these edition files already store each speech/stage paragraph as a prose string. Do not apply a new verse normalization or change the book text to install the package.

First-mention identity may include ordinary relations supplied later in the same opening scene, under the approved editorial policy. Ghost identity is intentionally different: resemblance is not confirmation, and the later card attributes the apparition's claim.

Companies and roles inside the play are explicit kinds, not additional individual-person counts. Generic pronouns, unnamed crowds, most lowercase titles, places, ordinary oaths and adjectival allusions are outside scope. John-a-dreams is a conventional name for a daydreamer rather than a separate person, and keeps dictionary behavior. Yaughan is unresolved beyond being the named source of a drink. The Saviour is absent from the modern opening but Jesus appears later in Ophelia's song; that edition's card begins there.

Supplementary reference check: the public-domain [1917 Yale edition's notes](https://en.wikisource.org/wiki/Hamlet_(1917)_Yale/Notes) and [Shakespeare's Words entry for John-a-dreams](https://www.shakespeareswords.com/Public/GlossaryHeadword.aspx?headwordId=18849). Copy is newly authored; no external annotation text is copied into reader cards.

## Validation and integration

Run `python3 books/characters/hamlet/author_content.py`, `python3 books/characters/build_hamlet.py`, `python3 books/characters/build_hamlet.py --check`, and `python3 -m unittest discover -s books/characters -p 'test_*.py'`.

All 22 current content tests pass (10 Hamlet + 12 Awakening). Checks cover every exact span, duplicate ownership, first-mention release, Ghost identity/category gates, father/son collisions, performed-play roles, edition omissions, and moving backward. Compiler output is deterministic across separate processes.

Release owner must copy `characters.v1.json` to `app/public/data/characters/hamlet.v1.json`, explicitly register original-en and modern-en in the current loader, use a versioned URL, and run app/build/bundle/production checks. Test actual stage-direction and speaker-label selection on mobile, plus scene 1 father/son and scene 9 performed-play cases. Assets alone do not enable live cards. No deployment is claimed by this content package.
