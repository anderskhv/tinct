# Danish publication accepted, 24 October 2026

Twelve Danish editions are now offered, bringing the selectable total to 18: Moby Dick, Crime and Punishment, The Prince, Confessions, Alice in Wonderland, Bacchae, Magna Carta, Medea, Meditations, Middlemarch, The Art of War and Wuthering Heights. English remains the default and the Danish editions are text only.

- Source: `77c1d7de929a0f45d9c92692ad40f481033aabfa`, integrating the assigned content tip `959296ff926d6fb2b106455074c6227aa1d09600`.
- [Deploy 40107782766](https://github.com/anderskhv/tinct/actions/runs/40107782766): success. All six live acceptance groups passed. Rollback was skipped.
- [Single-use continuation 40107768345](https://github.com/anderskhv/tinct/actions/runs/40107768345): success. It independently required all 120 speaker cases, the accepted predecessor, exact source and final live bundle.
- Worker `2bfcd694-2968-49e5-bbbd-1722189d2211`; bundle `/assets/index-BHdfgYSZ.js`; shared reader remains enabled.
- All 18 offered Danish files match their repository SHA-256 hashes in the production acceptance artifact. Discovery and direct links pass; English defaults remain unchanged.
- Alice passed 59 sampled phone pages, full source-word coverage in chapters 1 and 12 (2,091 and 1,979 words), Compare and reload, plus desktop continuous-reader checks. No text overflow, page errors or audio requests were recorded. The separate extra live comparison sweep completed 10 phone/desktop cases across five books before this environment blocked further browser network access. The complete prepublication 12-book checks remain in `VISUAL-QA.json` and `SHARED-READER-QA.json`.

## Held packages

- Pride and Prejudice: seven paragraph merges require a verified saved-position map.
- Jekyll and Hyde: eight italic-marker mismatches; its English baseline has changed.
- Great Expectations: the existing English modernization gate fails.
- Sense and Sensibility: missing emphasis at chapter 44, paragraph index 35.
- Huckleberry Finn, Sherlock Holmes, Beautiful Stories from Shakespeare, Iliad for Boys and Girls, Lincoln's speeches, Robin Hood, Odyssey for Boys and Girls, and Wonder Book/Tanglewood: their books are not published. Their Danish packages remain staged.
- Grimm and Arabian Nights were already online. Their newer published packages were preserved.

All content review was by AI helper agents. No native Danish speaker has read these editions, and reviewer replacements were not independently re-reviewed. No remaining translation work was started and no Anthropic API was called.

Exact accepted jobs, served hashes and extra live QA results are recorded in [PRODUCTION.json](PRODUCTION.json). Production screenshots are in [production-alice.jpg](../../../docs/assets/danish-integration-20261024/production-alice.jpg). This evidence branch adds documentation only; the accepted main source remains unchanged.
