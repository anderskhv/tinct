# Progress ledger — 2026-09-11 modern-English translation audit

Resumable ledger. If interrupted, resume from the first `[ ]` batch below.
Each batch is a self-contained subagent task; its outputs are the per-book
files listed. A batch is only checked off once its per-book note file,
review-packet contribution, and CSV row all exist and were spot-checked.

Snapshot commit audited against: `cdb6d8b9ee90f0c1d2e6cbab1f4c55b371cd0611`
(branch `claude/upbeat-brown-cuttkn`, 2026-09-11).

## Phase 1 — mechanical checks

- [x] All 101 books (100 public + 1 staged `treasure-island`) processed.
  `mechanical/summary.csv`, `mechanical/<id>.json`, `mechanical/README.md`.

## Phase 2 + 3 — editorial sampling + human-edition research (per batch)

Batches group books by author/genre so translator/rights research is shared
efficiently. Each batch's agent writes:
- `per-book-notes/<id>.md` (evidence notes, findings, mechanical-flag
  confirm/disconfirm, human-edition research, limitations)
- `review-packet/pairs/<id>.json` (neutral-labeled source/candidate excerpts)
- `review-packet/mapping/<id>.json` (label → real identity mapping)
- returns a compact ratings/recommendation JSON compiled into
  `final/audit-results.csv` by the orchestrator

Status key: `[ ]` not started · `[~]` in progress · `[x]` done and spot-checked.

- [ ] B1 — odyssey, ulysses, gilgamesh, iliad, the-aeneid
- [ ] B2 — war-and-peace, anna-karenina, ivan-ilyich, crime-and-punishment, brothers-karamazov, notes-from-underground
- [x] B3 — bible — DONE. **CRITICAL: modern-en verified verbatim NIV (2011, Biblica, all rights reserved) — live commercial copyright exposure, not just quality.** Also ~166 verses deleted across 92 chs, 32 chs with verse-boundary displacement (Jer 16→25, Rev 14→22, etc.), 1 Chr, Acts, Ps runs. Rec: USE HUMAN EDITION (BSB, confirmed public domain/CC0 2023-04-30). modern-da inherits same defects. See per-book-notes/bible.md.
- [ ] B4 — hamlet, macbeth, midsummer, romeo-and-juliet, the-tempest
- [ ] B5 — comedy-of-errors, merchant-of-venice, henry-v, as-you-like-it, winters-tale
- [ ] B6 — julius-caesar, twelfth-night, measure-for-measure, henry-iv-part-2, merry-wives-of-windsor
- [ ] B7 — othello, king-lear, much-ado-about-nothing, taming-of-the-shrew, antony-and-cleopatra
- [x] B8 — richard-iii, coriolanus, cymbeline — DONE. richard-iii Strong/LIGHT EDIT; coriolanus Good with fixes/LIGHT EDIT; cymbeline Good with fixes/LIGHT EDIT but **Acts 5.3-5.5 (23.5% of the play) barely modernized while book-level flags read clean** — same split-quality pattern as B15's Paradise Lost/Beowulf. Confirmed: no rights-clear human modern-English Shakespeare translation exists anywhere (Play On Shakespeare is complete but commercially licensed; everything free is either noncommercial-restricted or original-language). See cross-cutting-findings.md.
- [ ] B9 — the-republic, apology, symposium, phaedo, crito, phaedrus
- [ ] B10 — meditations, the-manual, nicomachean-ethics, aristotle-politics, poetics
- [ ] B11 — oedipus-rex, oedipus-at-colonus, antigone, oresteia, bacchae, medea
- [ ] B12 — the-art-of-war, the-histories, peloponnesian-war
- [ ] B13 — pride-and-prejudice, jane-eyre, frankenstein, great-expectations, moby-dick
- [ ] B14 — the-awakening, heart-of-darkness, jekyll-and-hyde, a-little-princess, jungle-book, around-the-world-80-days
- [x] B15 — divine-comedy, paradise-lost, beowulf, faust-part-1 — DONE. divine-comedy strongest (LIGHT EDIT, evenly modernized across all 100 cantos). **paradise-lost and beowulf both show a split-quality pattern: part of the book genuinely modernized, the rest barely touched** (PL Books 1-7 near-verbatim de-lineated Milton vs Books 8-12 real rewrite; Beowulf Fitts I-XXXII good vs XXXIII-XLIII archaic) — RETRANSLATE / LIGHT EDIT (partial re-run) respectively. **faust-part-1 BLOCKED: original-en is not the credited Bayard Taylor translation — it's a corrupt OCR prose crib missing the opening monologue, with untranslated German in 49/895 paragraphs; modern-en inherits all of it.** See per-book-notes/.
- [ ] B16 — the-prince, beyond-good-and-evil, genealogy-of-morals, kant-groundwork, descartes-meditations
- [ ] B17 — on-liberty, utilitarianism, social-contract, second-treatise, hume-enquiry, discourse-on-inequality, democracy-in-america
- [ ] B18 — leviathan, wealth-of-nations, communist-manifesto, fear-and-trembling, confessions
- [ ] B19 — werther, niels-lyhne, jerusalem, candide
- [ ] B20 — magna-carta, us-founding-documents, federalist-papers, frederick-douglass
- [ ] B21 — vindication-rights-of-woman, walden, imitation-of-christ, don-quixote, essays-montaigne
- [ ] B22 — treasure-island (staged — report separately from published inventory per brief)

101/101 books assigned to a batch. 0/101 books have completed Phase 2/3 so far.

## Phase 4 — ratings, decisions, deliverables

- [ ] Compile `final/audit-results.csv` from all batch outputs
- [ ] Write executive report (`00-executive-report.md`)
- [ ] Reconcile CSV against inventory (every row has evidence)
- [ ] Build independent-review packet index (`review-packet/README.md` +
      merged mapping)
- [ ] Update `books/TRANSLATION_PROTOCOL.md` / add a dated findings note
      (do not change production policy)
- [ ] Final QC pass per brief's Quality Control checklist
- [ ] Commit and push

## Blockers / open questions

(none yet — will be logged here as they arise)

## Batch dispatch log (internal agent tracking)

| Batch | Agent status | Notes |
|---|---|---|
| B1 | dispatched | epic poetry |
| B2 | dispatched | Russian novels |
| B3 | dispatched | Bible |
| B4 | dispatched | Shakespeare set 1 |
| B5 | dispatched | Shakespeare set 2 |
| B6 | dispatched | Shakespeare set 3 |
| B7 | dispatched | Shakespeare set 4 |
| B8 | dispatched | Shakespeare set 5 |
| B9 | dispatched | Plato dialogues |
| B10 | dispatched | Greek/Stoic philosophy |
| B11 | dispatched | Greek tragedy |
| B12 | dispatched | ancient history/strategy |
| B13 | dispatched | 19th c English novels |
| B14 | dispatched | turn-of-century novels/adventure |
| B15 | dispatched | epic verse |
| B16 | dispatched | modern continental philosophy |
| B17 | dispatched | political philosophy |
| B18 | dispatched | political economy/religion |
| B19 | dispatched | European novels |
| B20 | dispatched | American founding documents |
| B21 | queued | misc essays + Don Quixote/Montaigne — hit 20-concurrent-subagent limit, retry once a slot frees |
| B22 | queued | Treasure Island (staged) — hit 20-concurrent-subagent limit, retry once a slot frees |

## URGENT — flagged during audit, outside normal severity triage

**Bible `modern-en` (and `modern-da`, which inherits it) is verbatim copyrighted NIV text (2011, Biblica), not an AI paraphrase.** Verified against Bible Gateway at 11 verse-groups, 6 books, 4 genres — distinctive NIV-only wording and name spellings reproduced exactly against the KJV it's nominally aligned to. This is live in production, serving the complete 66-book NIV (~31,000 verses) inside a paid commercial product; Biblica's stated permission threshold is ≤500 verses / <25% of a book without written license. This is a legal/product-risk finding, not just an editorial one, and is out of scope for this audit to fix (review-only). Recommend Anders see this immediately rather than wait for the full report. See `per-book-notes/bible.md` for full evidence.
