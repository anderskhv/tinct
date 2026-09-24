# Independent review: Prince / Julius Caesar / Jekyll content follow-up

Reviewer: Claude Code (independent of the authoring agent). Date: 2026-09-24.
Input: `codex/content-followup-package` @ `eb1ec7f0cb5f29ca16e4b4cd66f2ffabb2876916`, folder `input/` (copied unchanged; only the package, not the branch, was brought in).
Output: `reviewed/`, which holds the final candidates, records and hashes. `input/` is kept byte-identical to the pinned package as the audit trail.

**Scope.** This review is limited to the 32 changed paragraphs and the paragraphs around them. It is **not** a full-book review of The Prince, Julius Caesar or Jekyll and Hyde. It made no live edition, application, character-card, audio or deployment change.

## Verdict

| Book | Changed paragraphs | Verdict | Reviewed candidate SHA-256 |
|---|---:|---|---|
| The Prince | 29 | **Accepted with 12 review corrections in 9 paragraphs** | `d99629fa3c3e1a345c92e1b9749115111985bfdff520fd7a37037d6a3731d582` |
| Julius Caesar | 2 (3 edits) | **Accepted as authored** | `95a3e5b7516276f703bd77fb42992c6d76f27894619e1d7f147c290170baa952` |
| Jekyll and Hyde | 1 | **Accepted as authored** | `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` |

No blockers remain within scope. Some issues in unchanged paragraphs are recorded as out-of-scope follow-ups at the end; none of them blocks this release.

## 1. Package integrity (verified before review)

- The baseline, source and candidate SHA-256 of all three books match `input/manifest.json` exactly.
- Real diffs between baseline and candidate are Prince 29, Caesar 2 and Jekyll 1. These equal the declared lists exactly, and no undeclared paragraph differs.
- Chapter counts, titles, metadata and per-chapter paragraph counts are identical. The candidates stay paragraph-aligned with their sources.
- All 1,590 rows of the three `candidate-paragraph-hashes.tsv` files verified, with no mismatches. The `source`, `before` and `after` fields in `changes.json` match the JSON files.
- The Caesar edit count is 3 edits in 2 paragraphs (4.8; 9.36 ×2), as corrected by the requester.
- The package README mentions an `assemble.py`, but the package does not contain it. This has no effect, because every check was reproduced independently.

## 2. Method

1. **Blind accessibility read.** A fresh reviewer read only the candidate text: Prince printed Chapters XV–XVIII in full, 26.5–26.9 and 27.11–27.14, Caesar 4.6–4.10 and 9.34–9.38, and Jekyll 10.22–10.26. That reviewer saw no rationales, sources or baselines.
2. **Source comparison, twice and independently.** I compared every changed paragraph sentence by sentence against the English source. A separate reviewer did the same comparison without seeing the edit reasons. Both used the Italian text in the app (`the-prince-original-it.json`) to settle translation-level questions.
3. **Corrections** were applied as exact, single-match string replacements to copies in `reviewed/`.
4. **Reverification.** A third fresh reviewer diffed the author and reviewed versions word by word and confirmed each correction against the source, including the footnote cross-references.

## 3. Answers to the specific questions

**Prince 19.12, "the few find a place only when…"** Correct. The source reads "the few find a place there only when the many have no ground to rest on". The app's Italian reads *e gli pochi hanno luogo, quando gli assai non hanno dove appoggiarsi*. The baseline's "the few find **no** place there when the many have **no** ground" inverts that logic and was wrong. The critical-edition variant (*li pochi non ci hanno luogo quando li assai hanno dove appoggiarsi*) means the same as the candidate. "Only" is Marriott's addition, a fair rendering of the sense.

**Prince 19.13, "reputation and kingdom".** Supported. Marriott has "reputation and kingdom", and the app's Italian has *tolto lo Stato, e la riputazione*. The baseline's "or" departed from both. Note: some modern critical editions read *o la reputazione o lo stato*. The edition's fidelity standard is the pinned Marriott text, which agrees with the Italian in the app, so the candidate stands.

**Prince 17.5, "poor or despised".** Supported. Marriott has "either poor or despised", and the app's Italian has *diventi o povero o vile*. The baseline's "and" departed from both. The critical-edition variant *povero e contennendo* is noted, but the same reasoning as for 19.13 applies.

**Do the rewritten passages keep the full argument?** Yes, with the corrections below. Both reviewers checked every condition, example, list and contrast. They confirmed:
- all 11 quality pairs in 16.2 are present;
- all four conditions in 17.3 are present;
- Cyrus, Caesar and Alexander are kept in 17.4;
- the full list of vices is kept in 18.8;
- the property, women, father and patrimony points are kept in 18.9;
- Hannibal, Scipio, Fabius and the Locrians are kept in 18.10;
- the centaur, fox and lion material is kept in 19.2;
- the Venetian, Spanish and French sequence is kept in 26.7.

The candidate's 17.4 is more faithful than the baseline: it splits spending two ways, "his own and his subjects'" versus "others'". That matches the Italian and the "first case / second case" logic that follows.

**Foreign quotations and verse.**
- **18.4:** the English for Aeneid I.563–4 is accurate.
- **19.3:** the English for Cicero, *De Officiis* I.34, is accurate and consistent with Miller's Loeb translation.
- **19.5:** "Nevertheless, his deceptions always succeeded as he wished" is accurate, and "ad votum" is correctly glossed as Latin for "as he wished".
- **18.6:** the Dido verse is modernized with every element kept.
- **27.14:** Dacre's verse is modernized with every element kept, including the translator's "Roman".
- All Latin and Italian is kept verbatim.

**Caesar "public good", "public treasury" and "Lupercal festival".** All three are justified and accurate:
- "For the general" means for the general good or common cause. The baseline's "only the general one" could be misread as a military general.
- "General coffers" is the public treasury.
- The Lupercal is the Lupercalia festival of Act 1, Scene 2, where the crown is offered three times.

**Jekyll 10.24.** Accepted. A "black countenance" conventionally means a scowling, menacing look, so "such a dark, angry expression" states that meaning and adds no claim. It is also better than the baseline's "so black a face", which could be misread literally. Nothing else in the paragraph changed.

## 4. Findings and resolution (The Prince)

| ID | Para | Finding | Severity | Resolution |
|---|---|---|---|---|
| F1 | 19.9 / 19.10 / 19.11 | **A defect the candidate introduced.** Footnote 19.10 discusses the English words "contrary to fidelity/faith" (*contro alla fede*) and "altogether faithful" (*tutto fede*). The candidate changed those words in the text to "loyalty" and "true to his word", so the note referred to wording that no longer exists. The blind reader rated this BLOCKER. | Blocker | **Fixed (R6, R7, R8, R10).** 19.9 now reads "act against good faith". 19.11 now reads "appear altogether merciful, faithful, …". The note now says "'Against good faith,' or 'fidelity,' translates…" and "rather than 'good faith' and 'faithful' as rendered here". Reverified: every phrase the note quotes appears in the text. |
| F2 | 19.10 | The candidate reworded South's quoted sermon and spliced an editor's gloss ("—the leading figure—") inside the quotation marks. | Should-fix | **Fixed (R9).** South's words are restored verbatim, as in the baseline, with a bracketed gloss "Coryphaeus [leader]". A coryphaeus is a chorus leader, hence a leader, so the gloss is accurate. |
| F3 | 16.2 | "know how to do wrong, and when necessity calls for it or allows him to refrain" is garbled. Both reviewers flagged it. | Should-fix | **Fixed (R2):** "…and to use that ability or not as necessity requires" (source: "to make use of it or not according to necessity"). |
| F4 | 16.2 | The added gloss "liberal, meaning generous with his money" was followed by a second pair, "generous / grasping and predatory" (*donatore / rapace*). Two different qualities were both called "generous". | Should-fix | **Fixed (R3):** "One is called open-handed, another grasping". |
| F5 | 17.5 | "be forced into predatory greed" lost the source's "incur a **name** for rapacity". The argument contrasts two reputations. | Should-fix | **Fixed (R4):** "be forced into a reputation for predatory greed". |
| F6 | 19.2 / 19.3 | Note 19.3 glosses "Contesting", which did not appear in the text. The problem predates the candidate: the baseline said "contending" and the candidate said "contend for power". | Should-fix | **Fixed (R5)** inside the already-changed 19.2: "two ways of contesting for power". |
| F7 | 26.7 | "boldly and impulsively" and "by acting impulsively" render Machiavelli's key term *impetuosamente*. "Impulsive" implies thoughtlessness, and the chapter elsewhere uses "impetuous". | Should-fix | **Fixed (R11, R12):** "acted impetuously" and "by acting impetuously". |
| F8 | 16.1 | The candidate dropped the source's causal "because" between "never been known or seen" and "how one lives…". | Nit (fidelity) | **Fixed (R1).** |
| F9 | 19.11 | "princes whom it is unwise to challenge" narrows Marriott's ambiguous "which it is not prudent to challenge". | Nit | Not changed: this is a defensible reading of the source. |
| F10 | 19.4 | "so simple" became "so easily deceived". | Nit | Not changed: the meaning is kept. |
| F11 | 18.4 / 18.6 | The Dido lines are now translated twice: once as a prose gloss and once as Marriott's verse note. | Nit | Not changed: both are accurate and the verse note is a source paragraph. |
| F12 | 27.13 | The added lead-in "The verse in Italian, followed below by its English rendering:" is editorial. The Italian lacks accents. | Nit | Lead-in kept: it is harmless and orients the reader. The missing accents come from the pinned source and are left unchanged. |
| F13 | 27.14 | Dacre's verse drifts from Petrarch ("put to flight", "Roman"). | Nit | Not changed: the candidate is faithful to the pinned English source, which is the edition standard. |
| F14 | 17.3, 17.4, 19.3, 19.8, 19.12 | Minor phrasing suggestions: "seize wealth" vs "predatory"; making Caesar's case explicit; "only if"; "you can and know how"; "the few" is opaque. | Nit | Not changed: each is faithful to the source as written. |

All other changed Prince paragraphs are accepted as authored: 17.1, 17.2, 17.3, 17.4, 18.1, 18.3, 18.4, 18.5, 18.6, 18.8, 18.9, 18.10, 18.11, 19.3, 19.4, 19.5, 19.8, 19.12, 19.13, 27.13 and 27.14. Each was compared with its source and found faithful: no lost condition, negation, example, name or quotation. The two explanatory additions, "making a few examples through punishment" (18.1) and "an officer serving under him" (18.10), are accurate glosses.

Reverification: an independent third pass confirmed all of R1–R12. It found no unintended changes (19.3 is byte-identical) and no remaining broken cross-references.

## 5. Current-main reconciliation

`origin/main` @ `b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec` was checked on 2026-09-24. `app/public/data/editions/{book}-modern-en.json` and `-original-en.json` match the pinned baseline and source hashes exactly for all three books. The last publications touching these files are #150 (Prince, Caesar) and #151 (Jekyll). Both came before the package's pinned baselines. Publication has not moved on, so no passage needed reconciliation.

## 6. Out-of-scope observations (not fixed; for a future pass)

The blind reader noticed these in **unchanged** paragraphs. They are recorded so nobody reads this acceptance as a whole-book endorsement:
- **Prince:** Marriott's translator footnotes appear as body paragraphs without anchoring: 18.2 (Pistoia factions), 18.7 ("Christopher Pitt."), 19.1 (Burd epigraph), 19.6–19.7 (proverb, "Italian proverb."), 19.14 (Ferdinand of Aragon, which names the prince 19.13 says it is "best not to name").
- **Prince:** printed Chapters XXV–XXVI (26.5, 26.6, 26.8, 26.9, 27.11, 27.12) are noticeably more archaic than the revised XV–XVIII. Examples are "Changes of estate also issue from this" and "foreign scourings".
- **Jekyll 10.22:** "The largest vessel fills up at last" loses the idea of brimming over.
