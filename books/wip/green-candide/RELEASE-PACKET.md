# Release Packet — Candide (Voltaire)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-candide/candidate.json`
- **Target live path:** `app/public/data/editions/candide-modern-en.json`
- **Accepted sha256:** `a32b255597e5f0df7809c2a573a205f7b7dcd113276570abbdddb4e735deb641`
- **Structure:** 30 chapters, 709 paragraphs, matches `source.json`
  exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `candide-threads.json` already exists — release owner should spot-check
  it against the 11 changed paragraphs (all glossing edits, no plot/
  character changes, so unlikely to be affected).

## Validation / review evidence

All evidence lives in `books/wip/green-candide/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1-packet-ch1-8.md` | Round-1 fidelity, chapters 1-8 |
| `fidelity-review-1-packet-ch9-16.md` | Round-1 fidelity, chapters 9-16 |
| `fidelity-review-1-packet-ch17-23.md` | Round-1 fidelity, chapters 17-23 |
| `fidelity-review-1-packet-ch24-30.md` | Round-1 fidelity, chapters 24-30 (+ whole-book summary) |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review +
1 four-packet fidelity review with full 709-paragraph coverage (round
1, fidelity ACCEPT AS-IS with zero blocking defects); accessibility
glossing fix pass (11 paragraphs) + independent fidelity re-check of
those paragraphs; final whole-book non-sampled fidelity + accessibility
pass, specifically checking that Voltaire's deadpan satirical tone holds
consistently across all 30 chapters (a book-specific risk: satire
flattened into sincerity). No sampling at any stage.

## Source note

No `candide-original-fr.json` exists in the editions directory — only
the public-domain English-translation baseline. Per `books/AGENTS.md`'s
non-English-source rule, that translation served as the sole locked
fidelity anchor throughout review. Flagged for awareness, not a defect.

## Relationship to currently-live text

A paragraph-level diff against the current live `candide-modern-en.json`
shows the accepted text differs in only 11 of 709 paragraphs — all light
in-line glosses for period vocabulary (quarterings, auto-da-fé,
sanbenito, Ottoman titles, cochineal, etc.), no fidelity fixes were
needed (round-1 fidelity was ACCEPT AS-IS from the start).

## Audio invalidation

No English audio currently exists for `candide` (`app/public/audio/` has
no directory for this book id). Nothing to invalidate — audio generation
from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `candide-modern-en.json` has not been touched
— the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- [3.10] chamber-pot ellipsis left as authorial delicacy, not clarified
  (judgment call — clarifying risked flattening the joke).
- [11.6]/[12.6] two Italian exclamations left untranslated — a later
  plot point depends on the Old Woman recognizing the language itself.
- [22.27] Fréron reference (a real historical critic Voltaire targeted)
  left unglossed — no further gloss possible without inventing
  biographical detail not in the source text.
- [30.25] Pangloss's list of assassinated kings — a deliberately
  overwhelming wall of names; the density is the joke, not a defect.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
