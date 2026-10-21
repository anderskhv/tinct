# Handoff: Danish modern-da, batch e-short-classics (21 Oct 2026)

**Status: content accepted for handoff, not published.** These are staged candidates only. No live edition files, registry entries or app code were touched, and nothing was merged or deployed.

## Assignment
- **Task:** Danish translation, content only, of meditations, the-art-of-war, the-prince, candide and communist-manifesto. Each book gets a new modern-da edition made from the current modern-en on origin/main.
- **Danish was reopened by Anders for this run on 21 Oct 2026.** `STRATEGY.md#language-scope` still says Danish is not commissioned and has not been updated. The assignment is recorded here, and the strategy text needs updating by whoever owns it.
- **Instructions followed:** `books/BOOK-TASK-WORKFLOW.md` (approved 2026-09-24), `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md` and `docs/workflow-boundaries.md`, all at origin/main `e8b2703325370882e3b8f22915b74839f295fb23`, plus the task brief.
- **Branch:** `claude/danish-2026-10-21-e-short-classics`.
- **Owned path:** `books/wip/danish-2026-10-21-e-short-classics/` (nothing outside it was changed).
- **Commits:**
  - `bbe3b713`: Manifesto, Art of War, Prince.
  - `79920254`: Meditations.
  - `9c2d2401`: Candide.
  - This handoff is in the final commit on the branch.

## Package contents
| Book | Source modern-en blob | Candidate modern-da blob | Chapters / paragraphs | da/en chars | Reviewer findings (not applied) |
|---|---|---|---|---|---|
| meditations | `0639e9ca2d9efac558f716990036e63d6ddc3f28` | `87dc40309e1c5589b82af900677db77e98997b3e` | 12 / 487 | 0.993 | 74 (0) |
| the-art-of-war | `c00480d5d2ad9ad5bb41f68f6abc4e59d2a1f6b2` | `8266cddc805cd1eeb3d0198f56050f4e05c1690b` | 13 / 385 | 0.996 | 28 (0) |
| the-prince | `30917a5fb27e267b651c8e83ff5735193e4542c4` | `c5ea670b43a45dc5a433bd3a16a60978704408d2` | 27 / 254 | 1.012 | 48 (0) |
| candide | `e7307930fa976f4626219bc8221725c52c69ba61` | `848ca31b0467c90b8fda10f5d2ae454b849595e8` | 30 / 709 | 0.999 | 71 (3) |
| communist-manifesto | `e162fc885c11e94d1ab962dab5205feeb46795c4` | `8e0d7f890eb9f25766ef772f7a0a38e973992a2c` | 5 / 213 | 0.982 | 20 (0) |

Each book folder holds four files:
- `{book}-modern-da.json`: same shape and top-level keys as the live files, so `sections: []` is kept for the-art-of-war.
- `SOURCE.md`: source blob and candidate hashes.
- `REVIEW-LOG.md`: method, fixed terms, translator judgment calls per chunk, every reviewer finding, and the orchestrator's edits.
- `GATES.md`: gate results.

`STYLE.md` is the translation brief that every translator followed.

## Gates (all five books pass)
- **1:1 alignment with modern-en:** same chapters, the same number of paragraphs per chapter, the same order and the same keys. Chapter titles are translated.
- **Zero paragraphs left in English.** Three Prince paragraphs are identical to the English because they hold only names: »Ramiro d'Orco: Ramiro de Lorqua.«, »Christopher Pitt.« and »Edward Dacre, 1640.«.
- **da/en length ratio (characters) between 0.85 and 1.25 for every chapter.** There are no outliers. The lowest chapter is 0.97 (Manifesto ch2) and the highest is about 1.05.
- **`books/danish-lint.py` clean.**
  - The script hard-codes a Mac path, so it was run unmodified by importing it with its `EDITIONS_DIR` pointed at a temporary copy of the live modern-da corpus, with the candidate in place of the old file.
  - It reports 0 real issues.
  - It flags one STRAY-UNDERSCORE in the Manifesto, on `_Philosophie de la Misère_`. That is emphasis markup carried over verbatim from modern-en, which the reader renders as italics; the live corpus has 1,501 such hits. It is listed in GATES.md.
  - Lint hits found during gating were fixed: two »det det« and three spaced »...«. The fixes are logged in each REVIEW-LOG.md.
- **Extra checks:** no "…"/“…” quote marks (all quotes are »…« / ›…‹), _emphasis_ marker counts match the English, and the leading paragraph numbers in Meditations match.
- **Copy check against the old modern-da** (the Prince, Candide and Manifesto had one):
  - Shared 8-word sequences: 10.6 %, 20.9 % and 6.1 % respectively.
  - For Candide a blind control was run: a fresh translator with no access to the old file reproduced most of the overlap (mean 0.55 against 0.79 on the 15 highest paragraphs). The overlap is convergence on short, literal dialogue, not copied sentences. Details are in candide/REVIEW-LOG.md.

## Method
- **Chunking.** modern-en was split into 40 chunks of whole chapters, or paragraph ranges for long chapters, of about 3,500 words each.
- **Translation.** One translator subagent per chunk, working from STYLE.md and a fixed term list per book. The old modern-da was used for names and terms only.
- **Independent review.** One reviewer subagent per chunk saw only the English and the Danish, and checked every paragraph and title for meaning, omissions, additions, English left in, stiff phrasing and form. It returned complete corrected paragraphs.
- **Fixes.** 241 findings were logged and 238 applied. Three were not applied because they converted units, which the brief forbids:
  - acres → tønder land;
  - en kvart mil → fire hundrede meter;
  - yards → skridt.

  A fourth unit change (mil → sømil) was cut back to »mil« and the rest of that fix applied.
- **Orchestrator normalisation:**
  - Prince regnal numbers use Danish ordinals throughout (Karl 7., Julius 2.).
  - Candide forms of address were made consistent across chunks: 55 paragraphs, pronouns only, policy and list in its REVIEW-LOG.md.
  - The lint fixes above.
- **API use:** none. All translation and review was done by this session and its subagents, with no script calling api.anthropic.com.

## Throughput
- **Volume:** 124,548 English words.
- **Wall clock:** start of setup at 12:40Z, all 40 chunks translated by 12:53Z, every review applied and all books gated and packaged by 12:58Z.
- **Words per hour:** about 410,000 English words per wall-clock hour end to end (18 minutes in total). The translation phase alone ran at about 680,000 words per hour (11 minutes with up to 20 subagents in parallel).
- **Per translator subagent:** roughly 3,500 words in 1.5 to 3.5 minutes, about 100,000 words per agent-hour, including the self-check.

## Notes for integration (a separate, assigned step)
1. **Publishing.**
   - Replace the live files with the candidates: `app/public/data/editions/{the-prince,candide,communist-manifesto}-modern-da.json`.
   - Add new files for meditations and the-art-of-war.
   - Check registry edition flags and any language or narration caches.
   - Before publishing, confirm each modern-en blob on main still matches SOURCE.md. If it changed, re-check the diff.
2. **Reading position.** Paragraph counts match modern-en exactly, so edition switching should keep the reader's place. The old Danish files also matched modern-en's counts.
3. **Possible modern-en defect (the Prince, ch23 p3).** The text reads "many riches make him want more" without the governing "not" that Marriott's sentence has ("…so that many riches may not make him wish for more"). The Danish keeps the intended sense. Consider repairing modern-en.
4. **Visual QA.** Per CLAUDE.md, every edition must be visually QA'd page by page before shipping. That has not been done here.
5. **Title casing.** The Art of War chapter titles mirror the source's all-caps (e.g. INDLEDENDE OVERVEJELSER). Change them to sentence case if the design rules should apply to book chapter titles.
6. **Logging.** `DECISIONS.md` is shared and was not edited. The following decisions should be logged by the integration step:
   - Danish reopened for this batch.
   - Units kept as in the English (»mil« for miles and leagues).
   - Candide address policy.
