# Automated authoring queue

Set up 2026-09-11 at Anders's request, to keep the remaining character packages
moving without a person having to start each session. Read this file **before**
picking up a book. It is the assignment list; `library-inventory.json` is the
status record.

Branch: `claude/tinct-character-content-1n5iqq`. Every session works here and
pushes here. Content commits only — no app code, no deploys, no edition text.

## Two lanes, and why

The books are split by how much the binding work depends on judgment rather
than on following the established pattern.

**Lane A — assigned to the smaller-model author, still requiring independent release review.**
These are treatises, essays and philosophy, but genre does not establish simple
identity. This list includes biblical narratives, fictional/mythic figures,
namesakes, autobiographical relationships and staged arguments. For example,
Fear and Trembling includes Abraham and the Merman; Confessions includes narrative
relationships. Author-written coverage tests cannot certify identity correctness
or spoiler safety. Record uncertainties explicitly and leave uncertain bindings
unbound; use the existing Blocked procedure when the assignment exceeds the lane.
This September 11 clarification changes neither lane assignments nor the external
routine. Release review remains separate from authoring and mechanical validation.

**Lane B — keep on the larger model.** Narrative, scripture, epic and history.
These turn on exactly the work a weaker model gets quietly wrong: telling four
Edwards apart, knowing that "Harry ten shillings" is a coin and "Dame Partlet"
is a hen, deciding what is ordinary identity and what is a spoiler. A wrong
binding here shows a reader the wrong person's card, or spoils the book, and
**no test the authoring agent writes for itself will catch it** — the test will
encode the same mistake. Do not take a Lane B book on a smaller model. Leave it
and say so in this file.

## Lane A — automated queue, in order

Take the first entry whose `contentStatus` in `library-inventory.json` is still
`not-started`. Claim it before starting (see Procedure).

| # | Book | Paras/edition | Note |
|---|---|---:|---|
| 1 | `genealogy-of-morals` | 124 | Nietzsche's cited philologists, philosophers and historical figures |
| 2 | `fear-and-trembling` | 232 | Abraham, Isaac, Sarah, Agnes and Agnete, the Merman; Kierkegaard's pseudonym |
| 3 | `second-treatise` | 301 | Filmer, Hooker and the biblical genealogy Locke argues against |
| 4 | `beyond-good-and-evil` | 325 | Nietzsche's philosophers, composers and nations |
| 5 | `meditations` | 412 | Book 1 is a roll of named teachers and kin — the core of the package |
| 6 | `aristotle-politics` | 478 | Named lawgivers, tyrants and cities; watch city-versus-person |
| 7 | `confessions` | 462 | Monica, Ambrose, Alypius, Patricius; scriptural figures |
| 8 | `walden` | 502 | Real neighbours, plus the classical and Eastern figures Thoreau cites |
| 9 | `imitation-of-christ` | 774 | Scriptural and saintly references; no cast |
| 10 | `vindication-rights-of-woman` | 778 | Rousseau, Milton, Gregory, Fordyce and the women cited |
| 11 | `nicomachean-ethics` | 1195 | Greek namesakes — check every Socrates/Plato/Homer citation |
| 12 | `federalist-papers` | 1279 | Signatories, classical republics, named founders |
| 13 | `leviathan` | 1337 | Scriptural and classical citation; Hobbes names few contemporaries |
| 14 | `wealth-of-nations` | 2173 | Large but reference-light; mostly named economists and rulers |
| 15 | `democracy-in-america` | 2258 | Named Americans and Europeans; watch place-versus-person |

## Lane B — larger model only

Not automated. `odyssey`, `iliad`, `the-aeneid`, `divine-comedy`,
`paradise-lost`, `faust-part-1`, `the-republic`, `the-histories`,
`peloponnesian-war`, `essays-montaigne`, `ulysses`, `pride-and-prejudice`,
`crime-and-punishment`, `jane-eyre`, `frankenstein`, `moby-dick`,
`great-expectations`, `niels-lyhne`, `jerusalem`, `brothers-karamazov`,
`anna-karenina`, `don-quixote`.

Plus the three partials, which carry live or drafted work that must be
preserved rather than replaced: `war-and-peace` (45-entry draft),
`bible` (Baruch only, live in three English editions), `the-awakening`
(live pilot needing the approved shortening).

## Procedure for each session

1. `git fetch origin && git checkout claude/tinct-character-content-1n5iqq && git pull --rebase origin claude/tinct-character-content-1n5iqq`
2. `python3 books/characters/inventory.py` and read this file. Pick the first
   Lane A book still `not-started`.
3. **Claim it first.** Write `books/characters/<id>/status.json` with
   `contentStatus: "in-progress"`, commit it alone, and push immediately. This
   is what stops two sessions taking the same book. If the push is rejected,
   fetch and reread the remote queue and per-book ownership before doing work.
   Reconcile the rejected claim; do not blindly rebase or retry it. Pick a different
   unclaimed book only after verifying the current assignment.
4. Read `books/characters/EDITORIAL-POLICY.md`, `README.md`, and one finished
   package as the structural model — `books/characters/coriolanus/` and its
   `build_coriolanus.py` and `test_coriolanus.py` are the closest fit for a
   book with a plain source, `measure-for-measure/` for one whose original
   carries Gutenberg italic underscores.
5. Read **both** English editions at
   `app/public/data/editions/<id>-{original-en,modern-en}.json` in full.
   Build the entity inventory from the text, not from `<id>-threads.json` —
   those aliases can point at the wrong person.
6. Author `<id>/author_content.py` and `build_<id_with_underscores>.py`.
   Run the author script, then the builder, then `--check`.
7. Write focused tests for the real ambiguities you found, not for things that
   cannot fail. Run them and then the full suite:
   `python3 -m unittest discover -s books/characters -p 'test_*.py'`
8. Write `<id>/README.md` covering scope, binding decisions, source defects,
   omissions, commands and the release checks. Set `status.json` to
   `validated-package` / `awaiting-integration`.
9. `python3 books/characters/inventory.py`, commit the package **and** the
   regenerated inventory together, and push.
10. Add the book to `RELEASE-QUEUE.md` under the current Opus batch, with its
    commit hash, entry counts and both edition sha256s from
    `<id>/validation-report.json`.

## Rules that do not bend

- **Never edit an edition file.** Record source defects; do not repair them.
  Printed line numbers and compositor errors stay as printed — stripping them
  moves every UTF-16 offset in the file.
- **No paid generation APIs**, no `generate-editions.cjs`. Author in the agent
  conversation and write to files.
- **Do not mark anything live.** `validated-package` / `awaiting-integration`
  is the ceiling. Production verification belongs to the release owner.
- If a book turns out harder than its lane suggests — namesakes you cannot
  resolve from the text, a disguise, a concealed identity — **stop, set its
  status back to `not-started`, note why under Blocked below, and push.**

## Blocked

_(nothing yet)_
