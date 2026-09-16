# Character coverage ledger — The Republic (2026-09-16)

Scope: `books/characters/entities/the-republic.py` → compiled via
`books/characters/build_generic.py the-republic` → released to
`app/public/data/characters/the-republic.v1.json`. Both `original-en` and
`modern-en` compiled and validated independently.

## Starting state

- Released baseline reproduced exactly as stated in the assignment: 13
  cards / edition (200 mentions original-en, 193 modern-en). Confirmed by
  reading the live file before making any change.
- **Historical draft at commit `00375fb8d355d32997dddff4c5ecabcac28bbb0e`
  (62/63 cards) could not be located or verified from this environment.**
  This sandbox is a shallow clone of `anderskhv/tinct` (53 commits) with no
  access to Anders's local Mac checkout; `git fetch` of that SHA against
  `origin` fails with "not our ref," confirming it never reached the
  remote. Treated per instructions as not landed and not reused — this
  ledger's additions were authored fresh against the source text, not
  copied from that draft. **Verification limit: cannot confirm what that
  draft actually contained**, so no claim is made about overlap or
  superiority versus it.

## Method

1. Extracted every capitalized proper-noun-like token from
   `the-republic-original-en.json` (3,908 paragraphs) via frequency script,
   filtered obvious sentence-initial words, cross-checked against
   `modern-en` for independent presence.
2. Read full source context for every candidate before deciding disposition.
3. Authored new entries in `books/characters/entities/the-republic.py`
   (module format used by the existing `build_generic.py` tool), preserving
   all 13 existing card bodies verbatim (confirmed by diff — zero body
   changes to legacy IDs).
4. Compiled with `build_generic.py`, which independently regex-matches
   aliases against each edition's own normalized paragraph text — this is
   the "validate both editions independently" step; both compiled with
   zero dropped entities.
5. Ran a standalone UTF-16 span round-trip check against the live edition
   files for every mention in both editions: **0 errors**.
6. Ran `python3 -m unittest discover -s books/characters -p 'test_*.py'`:
   135 tests pass (these are the-awakening pilot contract tests; there is
   no Republic-specific suite, so this only confirms the shared tooling
   still works, not Republic-specific behavior).
7. **Could not run** `check-character-cards.cjs`, `check-character-card-edges.cjs`,
   `check-reviewed-characters.cjs`, or `check-character-omissions.cjs` — all
   require `playwright` (not installed in this sandbox) and a running dev
   server. This is a real verification gap: in-reader rendering, tap
   targets, and Compare-mode offset alignment are **not** browser-verified
   here. Flagging for Codex/manual QA before release.

## Fixed: person-vs-object conflation (explicitly asked-for check)

The released `ring-of-gyges` card was a `personification` bound to every
bare occurrence of the word "Gyges," including the *first* one (Book II,
para 16, offset 658) — before the ring or its invisibility power is even
introduced in that same paragraph. That is a same-paragraph spoiler and a
conflation of the person (Gyges, the shepherd) with the object (the magic
ring / thought experiment).

Fix: split into two entities.
- `gyges` (kind `person`, new) — first mention now Book II para 16 offset
  663 (name only), identity-only body (shepherd, ancestor of Croesus,
  invoked for a thought experiment) with no mechanism spoiler.
- `ring-of-gyges` (kind `object`, retained id and body) — alias narrowed to
  the literal phrase "ring of Gyges," which does not occur until Book X
  para 282. Its card is now unavailable until that later, explicit
  reference — no longer leaks ahead of the Book II narration.

## Added (15 new cards, 13 legacy cards untouched)

| id | kind | role | disposition |
| --- | --- | --- | --- |
| gyges | person | supporting | linked (split from ring-of-gyges, see above) |
| ring-of-gyges | object | supporting | linked (kind corrected from `personification`) |
| euthydemus-brother | person | reference | linked — Cephalus's son, Book I household roll call |
| charmantides | person | reference | linked — guest at Cephalus's house |
| aristonymus | person | reference | linked — named only as Cleitophon's father |
| ariston | person | reference | linked — Glaucon/Adeimantus's father, patronymic only |
| lysanias | person | reference | linked — Cephalus's father |
| leontius | person | supporting | linked — has an actual anecdote (Book IV, soul's parts) |
| aglaion | person | reference | linked — named only as Leontius's father |
| er | person | major | linked — narrator-witness of the closing myth (Book X) |
| armenius | person | reference | linked — named only as Er's father |
| ardiaeus | person | reference | linked — tyrant named within Er's account |
| necessity | deity | supporting | linked — holds the spindle in Er's account |
| lachesis | deity | supporting | linked — one of the three Fates in Er's account |
| clotho | deity | reference | linked — one of the three Fates in Er's account |
| atropos | deity | reference | linked — one of the three Fates in Er's account |

Result: 28 cards / edition, 394 mentions (original-en) / 390 (modern-en).

## Explicit dispositions for everything else found by the name scan

**Justified exclusion — literary/mythological/historical allusions cited as
argument examples, not participants in the Republic's own narrated scene.**
Grouped, with rough mention counts from `original-en`:

- Olympian gods invoked in the Book II–III poetry critique or the Book X
  cosmology: Zeus (16), Apollo/Phoebus (6+4), Hera (0 — not directly named
  in this translation, only "Heaven"), Hephaestus (3), Aphrodite, Ares,
  Artemis, Athene, Persephone, Cronus, Uranus, Hades (4), plus the Roman
  planetary names in the Book X spindle passage (Jupiter, Saturn, Mars,
  Venus, Mercury) used as astronomical labels, not narrative agents.
- Homeric/epic figures cited as examples of good or bad conduct in poetry
  (Achilles, Agamemnon, Odysseus, Patroclus, Ajax, Priam, Hector, Menelaus,
  Helen, Thersites, Sarpedon, Glaucus [sea-deity sense — **homonym risk
  flagged**: this is not Glaucon, and if a future card is authored it must
  not share an id/alias with `glaucon`], Diomede, Peleus, Thetis, Niobe,
  Cheiron, Palamedes, Proteus, Pandarus, Eurypylus, Autolycus, Telamon,
  Pelops, Atreus, Menoetius, Alcinous).
- Historical lawgivers/statesmen cited as examples (Lycurgus, Solon,
  Charondas, Themistocles, Periander, Pittacus, Bias, Anacharsis, Xerxes,
  Croesus [beyond the Gyges link already covered], Perdiccas, Polydamas).
- Poets, musicians, philosophers cited as examples or authorities (Homer
  [43 mentions — see below], Hesiod, Simonides, Pindar, Aeschylus,
  Sophocles, Euripides, Archilochus, Stesichorus, Musaeus, Orpheus,
  Thamyras, Damon, Marsyas, Pythagoras, Thales, Protagoras, Prodicus,
  Heracleitus).

**Real gap, not authored yet (unresolved, flagged rather than silently
dropped):** Homer is the single largest omission by mention count (43
occurrences) and is the explicit subject of sustained argument in Books
II, III, and X (the critique of poetry), not just a passing citation. A
reference-role card for Homer would be defensible and arguably higher-value
than several of the reference-only figures already added above. Left out
of this pass because giving it a correctly-scoped, spoiler-safe body
(Homer is discussed across all three books with escalating critical
content) needs its own careful read rather than the same treatment as a
single-mention patronymic. **Recommend as the next Republic task**, ahead
of moving to other books, if further Republic-specific budget is
available.

## Not reviewed in this pass

- No re-check of `the-guardians` / `the-den` / `philosopher-kings`
  personification boundaries beyond confirming their bodies are unchanged
  and their existing mentions still round-trip. Task item 3 ("repair
  existing descriptions") was not exercised on these three since nothing
  in the source audit surfaced a defect in them.
- No in-reader/browser verification (see "Could not run" above).
- No independent second-reviewer pass; this is one agent's read of the
  source text.

## Release status

**Not yet live.** Changes are written to
`app/public/data/characters/the-republic.v1.json` on branch
`claude/great-clarke-mugpy4` and committed for Codex to integrate,
app-verify (including the browser-based checks this sandbox could not
run), and publish. This ledger does not claim production status.
