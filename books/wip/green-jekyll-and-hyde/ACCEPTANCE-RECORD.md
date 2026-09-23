# Acceptance Record — Strange Case of Dr Jekyll and Mr Hyde (Stevenson), modern-en

- **Book id:** `jekyll-and-hyde` · **Edition:** `modern-en`
- **Date:** 2026-09-23
- **Source (fidelity anchor):** `source.json`, byte-identical to the served `app/public/data/editions/jekyll-and-hyde-original-en.json` (sha256 `dc134b81…4532b`). This is the Project Gutenberg #43 text.
  - **Completeness:** checked with a word-sequence diff against a fresh download of Gutenberg #43. The only unmatched runs are two chapter headings; no body text is missing.
- **Starting point:** the live modern-en edition, preserved as `baseline-live-modern-en.json` (sha256 `308ad53a…eb654`).
  - Chapters 1–2 were a genuine modern rendering and were kept. They received local fixes only.
  - Chapters 3–10 were a lightly touched copy of the period prose: over 0.9 word similarity, with 90 of 99 paragraphs in ch. 8 and 28 of 28 in ch. 10 near-identical. The protocol rejects "a light spelling pass", so these chapters were given a full modern rendering, with chapters 1–2 as the style reference.
- **Structure:** 10 chapters and 339 paragraphs (28/50/17/18/38/13/14/99/34/28). Chapter numbers, titles and per-chapter paragraph counts are identical to the source. Every edit round passed `validate_structure()` and `assert_only_changed()`.

**Final sha256 (candidate.json):**
```
f2cf24e93c77b354a9fa617d3440b6daaa09acd36e6fdb1df236469ac570a5ae
```

## Earlier external ("Astra") findings — unavailable

The brief pointed to `astra-jekyll-findings.md` and `astra-jekyll-candidate-notes.md` in a local Codex workspace. That path does not exist in this cloud environment, and no branch of the repository contains those files. They were therefore **not** used and not guessed.

In their place, chapters 1–2 received their own independent source-based review (78 of 78 paragraphs). It found 15 local issues, mostly allusions and comprehension, and all were applied:
- Glosses for Cain's heresy, apothecary, Queer Street, holograph will, Damon and Pythias, conveyancing, "bowels of mercy", troglodytic, Dr. Fell and *pede claudo*.
- Meaning fixes at 1.7, 2.15, 2.24 and 2.49.
- One sentence at 2.0 made easier to follow aloud.

The original nine proposals are unavailable, so none of them can be matched one-to-one here. Anyone holding the Astra file can compare it against `round1/jek-ch12-proposals.json`.

## Chapter 10 source variant — decision

- **The two readings:**
  - The locked source (Gutenberg #43) reads "I not only recognised my natural body **from** the mere aura and effulgence of certain of the powers that made up my spirit".
  - The 1886 first edition (Longmans) reads "**for** the mere aura". This was verified on 2026-09-23 against the proofread scan on Wikisource, *Page:Stevenson - Strange case of Dr. Jekyll and Mr. Hyde (1886).djvu/120*. Gutenberg #42 has the same reading.
- **Decision:** keep the "as" sense. "Recognised my body **for** the mere aura" means he recognised it **as** merely the aura, and the Gutenberg #43 "from" is a later variant that obscures this.
  - The candidate reads "I came to recognise my natural body as no more than the aura and radiance of certain of the powers that made up my spirit". The ch. 10 fidelity reviewer confirmed that this renders the first-edition sense correctly.
  - The older backlog's "as" → "from" correction was **not** applied.
  - The locked source file is unchanged, and this is the only place where the candidate follows the 1886 reading over #43.

## Review coverage

| Round | Scope | Reviewer | Method | Result |
|---|---|---|---|---|
| R1 ch 1–2 review | 78 paragraphs | Independent source-based reviewer (Opus) | Full paired read | 15 proposals, all confirmed and applied (11 paragraphs) |
| R1 rendering ch 3–10 | 261 paragraphs | Four drafting lanes (Sonnet), each with its own omission re-read | Paragraph-by-paragraph from source, per `prompts/modern-en-draft-prompt.md` | Drafts merged. The lead then normalised typography and spelling to match chapters 1–2 (curly apostrophes; British spelling, 22 words) |
| R2 fidelity ×3 | All 339 paragraphs (ch 1–5, 6–9, 10) | **Fresh** independent Opus reviewers | Protocol steps B+C: packets with context, then a whole-chapter re-read; extra scrutiny on changed paragraphs | 62 findings, 18 blocking. Examples: 4.0 causality; 7.3 garbled sense; 7.6 dropped repetition; 8.4 invented oath; 8.87 epithet; archaic "waiting your arrival", "Are you come", "bidden him enter"; 9.10 meaning flip; 9.27 invented earlier decision; 10.8 "old age"; 10.24 tense; room-name consistency. All applied |
| Convention | Book-wide | Lead | The room "cabinet" is rendered "study" throughout; the furniture "press" is "glass-fronted cabinet" | 6 paragraphs aligned |
| R2 accessibility | All 339 paragraphs | Fresh reviewer, candidate only | First-time reader and listener | 5 findings, 1 blocking (the will's clause at 2.0). All applied, 3 with adjusted wording (see `round2/jek-acc-final.json`) |
| R2 changed-passage re-verification | 52 paragraphs | Independent Opus verifier | Replayed each edit, read against the source with neighbours, checked conventions and structure | 1 non-blocking read-aloud defect (10.23 "sent … sent"), plus advice to use "towards" |
| R3 fix + re-verification | 10 paragraphs | Same verifier | As above | **VERIFIED CLEAN** |
| Tool checks | Whole book | `audit-truncation.py`, `content-verify.py` (run with local paths) | Screening | 0 truncation flags, 0 fabrication suspects |

No sampling at any stage.

## Preserved deliberately

- **Suspense and ambiguity:** Hyde's indescribable deformity (1.21, 2.36, 4.17), what Jekyll withholds (ch. 3, 5.6), and "preference … or his bondage to him" (2.12). Reviewers confirmed all of these survive.
- **Voice:** the inspector's "He don't" (4.14), Poole's servant speech ("may I die if I like it"), and Jekyll's elaborate but followable confessional voice.
- **Kept close to the source on purpose:** "writing on the wall" (10.14) and "city of refuge" (10.19) are clear in context. Latin *pede claudo* is kept and glossed.

## Verdict

**ACCEPTED — ready for release handoff.** An independent source-based fidelity review covers the whole book, and a fresh candidate-only accessibility review does too. Every blocking finding was fixed, every changed passage was independently re-verified clean, and structure and alignment match the source.
