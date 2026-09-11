# Crito character package

Complete dialogue reviewed in both English editions; nine entries each. Content revision 2026-09-10.1. Authoring-agent review, not independent editorial approval. Validated content, awaiting runtime integration.

Socrates is Central; Crito and the personified Laws are Major; the prison keeper is Supporting. Simmias, Cebes, Homer, the dream woman and Socrates' children are Reference. Plato is not inserted as a protagonist. Cards retain a single concise identity throughout the dialogue; they do not summarize the argument's conclusion.

Original 159 exact mentions, modern 156, across 95 paragraphs in three reading units. No edition omissions. Full source fingerprints are in validation-report.json; cards.md shows all categories/copy and source-review.md shows first contexts.

All named people were checked by a full proper-name scan and reading of the complete original dialogue. Modern contexts were checked for anonymous identities and the personified Laws. The latter are restricted to explicit speaking references in chapter three; other cities' laws and ordinary legal rules are not automatically linked. The dream woman is not identified as a deity. Hypothetical physicians/trainers, unnamed crowds, geographic names, ordinary God invocations and editorial cross-references to other works are excluded.

Validation: `python3 books/characters/build_crito.py --check`; five focused tests plus the existing suite (46 passing). Compiler assembly in build_reviewed.py is deterministic and shared; all identity prose and contextual matching rules are manually authored. No source edition changes or network generation.

Integration: compare fingerprints, register both English editions, publish the versioned sidecar and verify selection of Socrates/Crito, the prison keeper, and the Laws, including returning to chapter one after chapter three.
