# Fear and Trembling: Tinct Modern English (translated from Danish), replacement package

This is a staging folder. Nothing here is live. Start with **`RELEASE-PACKET.md`**.

| Path | What |
|---|---|
| `RELEASE-PACKET.md` | Handoff for Codex: artifacts, hashes, integration steps |
| `ACCEPTANCE-RECORD.md` | Review coverage, checks, rulings and kept difficulties |
| `EDITION-PLAN.md` | Edition labels; retirement of `original-en` (and `modern-da`); cross-asset items |
| `PROVENANCE.md` | Source and translation provenance |
| `STRUCTURE-MAP.md` / `.json` | Explicit served 232 → final 184 paragraph map and position-migration rule |
| `CHANGED-PARAGRAPHS.md` | Restored omissions, footnote placements, and each final paragraph with the served slots it replaces |
| `accepted-paragraph-hashes.tsv` | Per-paragraph hashes (modern-en and original-da) |
| `character-card-impact.json` | Re-anchoring map for the character package (mapping only) |
| `SIMILARITY.md` | Similarity diagnostic against the served English |
| `HASHES.txt` | sha256 of every artifact |
| `candidate/` | **The deliverables:** `fear-and-trembling-modern-en.candidate.json`, `fear-and-trembling-original-da.candidate.json`, `footnotes.json`, `structure.json`, and `review/chNN.md` (a review copy with the notes inlined) |
| `front-matter.json` | Subtitle, pseudonym, Hamann motto, "Problemata" part title |
| `STYLE-AND-TERMINOLOGY.md`, `DRAFTING-BRIEF.md` | The translation standard and the drafters' brief |
| `source/` | Corrected Danish, scan verification, corrections, printed paragraphing, and the build and check scripts |
| `drafts/` | Per-part drafts (A–J, plus P for the pilot) in their final state; earlier rounds are in `history/`; drafter notes are in `NOTES-*.md` |
| `reviews/` | Every review, applied list, diff and re-verification: rounds R1 → R2 → R3 |

**Rebuild:**

```
python3 assemble.py && python3 build_character_impact.py && python3 build_release.py && python3 similarity_report.py
```

The scripts are deterministic and read only this folder and the served files, which they do not modify.
