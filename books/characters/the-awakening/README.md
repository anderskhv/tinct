# The Awakening character pilot

Prepared 2026-09-09. Complete first editorial pass through all 39 chapters, source-reviewed by the authoring agent; not independently copy-edited and not integrated into the app.

- **86 entries**, including central and minor people, recurring unnamed figures, families and cultural references.
- **86 first-encounter cards + 177 later reminder snapshots**: 263 authored descriptions, shared where the English editions support the same facts.
- Original English: **86 entries, 1,421 matched mentions**. Modern English: **85 entries, 1,415 matched mentions**.
- Both editions: 39 chapters, 1,044 aligned paragraphs. Offsets and source fingerprints are compiled separately.

Read [the full editorial card draft](cards.md) to assess the copy. **It contains the whole plot.** [Source worksheet](source-review.md) pairs reminder updates with their trigger paragraphs. [Validation report](validation-report.json) records counts, fingerprints and review limitations. [Compiled asset](characters.v1.json) is the implementation input.

## Editorial choices and limits

Edna is central; Léonce, Robert, Adèle, Mademoiselle Reisz and Arobin are major. Role visibility is separately gated: early mention of Arobin does not announce his later importance. Minor callers, servants, anecdotal names and musicians get brief identification rather than being dropped for having few appearances. Descriptions identify people directly and explain relationships with recognizable context. They do not tell the reader whether remembering someone is “enough.”

The last Edna reminder describes the text’s final swimming scene without asserting a definitive interpretation of her death or intentions. Reports, gossip and memories remain attributed where appropriate. Gluglu is deliberately unresolved: the phrase about riding behind Gluglu does not justify inventing a person’s identity or species.

The modern English text omits the Holy Ghost reference in original chapter VI. That entry is therefore original-only. Duvigne/Duvigné and other spelling variations have edition-specific span bindings. Existing book text is unchanged. No Danish copy or bindings are included.

Coverage means named people/references plus selected distinctive unnamed figures, not every pronoun or incidental anonymous person. Names embedded in property and venue references may keep dictionary behavior. Excluded as character entries: Klein’s hotel, Lecompte’s stables, street/place names, Sèvres/Angostura, musical work titles such as Zampa and The Poet and Peasant, general exclamations and personifications. Places remain outside this first feature.

Family groups are separate kinds, not additional individual characters. Nested relationship labels are intentional: selecting “Sylvano’s wife” resolves the wife; selecting just “Sylvano” resolves the husband. Ambiguous surnames have reviewed occurrence overrides. Generic pronoun resolution is not attempted. These decisions require browser-level selection tests before shipping.

## Next step

Implement against this pilot using the [handoff](../../../docs/design/character-cards-implementation-handoff-2026-09-09.md), then review actual early/middle/late reading experiences. Only after that should the same contract be used to author the remaining library. The current content is reviewable and mechanically checked; the feature has not shipped.
