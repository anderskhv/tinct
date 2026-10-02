# Middlemarch modern-en: editorial fixes (2026-10-01)

Branch `integration/editorial-fixes-middlemarch`, cut from `origin/integration/new-book-sense-and-sensibility`. Content only: `app/public/data/editions/middlemarch-modern-en.json` and its regenerated shard set. No deploy, no merge, no PR, no API spend.

Numbering: all coordinates below are LIVE (Prelude = 1, Eliot's chapter N = N + 1, Finale = 88) with 0-based paragraph indexes. Reviewer (source) unit = live unit - 1. Every paragraph was located by matching text; every edit script asserts the old substring occurs exactly once. Scripts are in `books/wip/middlemarch/editorial-fixes/` (`edits.py` is the audited edit helper; `ship.sh` regenerates shards, commits and pushes; `verify.py`, `shard_check.py`, `short_vs_base.py` are the checks). Pass scripts are one-shot (re-running fails their assertions on purpose).

Structure unchanged: 88 units, 4,674 paragraphs, paragraph N = source N, shards regenerated (`node scripts/split-edition-chapters.cjs middlemarch-modern-en --write-registry`; the registry file did not change, only that edition's 88 shards).

## Pass A: epigraphs (commit "pass A")
Policy: every epigraph and Will's verse restored verbatim from original-en, including its underscore markup. 100 epigraph paragraphs across live units 2-87 (some units have 2-3 paragraphs: 3, 5, 10, 14, 16, 29, 35, 40, 47, 55, 65); 58 were not identical and were restored (units 2-7, 9-34, 42-49, 56-61, 70-75; reviewers listed fewer, units 42 and 43 were also affected). Dante, French and Pascal lines are back in the original language in 20, 23, 31. Will's verse, live 48 paragraphs 12-14, restored (3 paragraphs). The proverb live 47:1 was already identical. Check: all 100 epigraph paragraphs identical to original-en.
Note: the original itself is inconsistent in speaker-tag markup (`1_st Gent_.`, `2_d Gent._`, `2_d Gent_.`); restored verbatim as asked, so the modern edition renders exactly like the original edition. Letters (live 6:2, 6:3, 6:9) are prose, not verse, and were not touched.

## Pass B: typography (commit "pass B")
- 5,030 straight apostrophes replaced by curly (none left; the original has none).
- 13 periodical/title quote marks matched to the original: `‘Pioneer’`/`‘Trumpet’` in narration became `“Pioneer”`/`“Trumpet”` (39:47, 40:46, 47:14, 47:18, 47:20 x2, 47:28), `“Christian Year”` (49:2), `‘Lancet’s’` (17:9), `‘Twaddler’s Magazine’` (18:27, restored quote marks), `‘sugared invention’` (28:23), `‘The Shrubs’` (68:11), plus "sad dark-blue scandal" (63:11). Nested `‘Pioneer’` inside dialogue already matched the original and was left.

## Pass C: spelling (commit "pass C")
All British variants normalised to US spelling, whole words, case preserved, epigraph/verse paragraphs skipped: 203 paragraphs, 256 replacements (-our/-or 18 stems incl. color, honor, neighbor, behavior, parlor, favorite, humor, tumor; -ise/-ize recognized, realize, itemized, patronize; grey -> gray; centre, defence, offence, pretence, mould, sombre, jewellery, fulfil, skilful, travelled, quarrelled, panelled, marshalled ... to US forms) plus "criticising" (47:13) by hand. Caveat found and fixed afterwards: `Grey` (Earl Grey, the Prime Minister) was damaged to `Gray` at 36:52 and 47:5, 47:7 (twice); restored to `Grey`. Note: the source itself is mixed (it keeps centre, defence, offence, pretence, jewellery, travelled); the modern edition follows the stated US policy, not the source's mixed forms. Left alone: `towards`/`toward`, `draught`.

## Pass D: exclamation marks (commit "pass D")
`pass_d_list.py` compares count('!') per paragraph over all units: 70 paragraphs had fewer in modern (all of the reviewers' examples plus others). 72 hand edits restore the '!' on the clause that carried it (e.g. 16:6 "...gradual change!", 25:67 "terribly!", 74:8 "leper!"). Re-run: 0 paragraphs with fewer '!'. No documented genuine restructures remain.

## Pass E: honorifics (commit "pass E")
`pass_e_list.py` compared Mr./Mrs./Miss/Sir before a name per paragraph: 354 paragraphs lacked some (386 Mr., 47 Mrs., 4 Miss, 8 Sir). `pass_e_honorifics.py` matched original and modern sentences and prefixed the missing title only to a bare surname that the modern text still contained (guards: not after a first name, `the`, or before nouns such as `family`/`children`): 248 insertions in 192 paragraphs, each reviewed from the dry-run listing, plus 9 hand edits (`pass_e_hand.py`: 49:14, 64:4, 67:7, 68:11, 69:20, 71:37, 72:14, 73:9, 86:14). Reviewer examples fixed: Bambridge/Horrock (67:5), Hawley (72:17), "Mr. Casaubon will know" (48:9), "Mr. Casaubon was already up" (49:36); unit 72 Mr. count back near the original.
Deliberately left: `the Featherstone pew` (13:33), `Edward Casaubon` (30:4), `Aunt Bulstrode` (32:9), `Jane Featherstone` (33:8), `the Vincy children` (64:16), `the Hackbutt children` (75:44). Not applied: 170 paragraphs still have fewer titles (138 Mr., 43 Mrs., 4 Miss, 8 Sir), where the modern text replaced the name by a pronoun, `the Vicar`, `she`, or a first name; restoring those would mean rewriting sentences, which was out of scope ("minimal edits"). `Miss Brooke`/`Sir James` constructions fall in this group. Live 67:14 "Come down to Farebrother" is bare in the original too.

## Local fixes (commit "local meaning fixes")
| Live | Before | After |
| --- | --- | --- |
| 30:11 | Pity, that newborn child ... did not ride the wind | Pity, that “new-born babe” which was by-and-by to rule many a storm within her, did not “stride the blast” |
| 20:4, 20:8 | the sallow clergyman / “What, the clergyman?” | the sallow _Geistlicher_ / “What! The _Geistlicher_?” (done in pass D) |
| 18:27 | the Twaddler’s Magazine. | the ‘Twaddler’s Magazine.’ (pass B) |
| 88:24 | Her sensitive spirit still produced fine effects, although few people saw them. / acts that history never records | Her finely touched spirit had still its fine issues, though they were not widely visible. / depends partly on unhistoric acts |
| 68:15-16 | almost impossible to replace that loss / “Almost,” | I fear the loss to the Hospital can hardly be made up / “Hardly,” |
| 73:7 | some errors carry a terrible punishment | there is the terrible Nemesis that follows some errors |
| 47:5 | emancipation of enslaved black people, reform the criminal law | Negro Emancipation, Criminal Law |
| 47:8 | weighted towards representatives of interests other than those of the landowners’ nominees | not weighted with nominees of the landed class, but with representatives of the other interests |
| 72:26 | went over to the Catholics | went over to the Romans |
| 72:60 | At the word “deceit,” | At the word chicanery, |
| 59:65 | “Then I must!” | “Then I must ask him!” |
| 61:20 | “fond of indulgence” | “given to indulgence” |
| 29:12 | Perhaps someone seeing him ... could detect signs she had missed | ... at the thought that those who saw him afresh after an absence might be aware of signs she had not noticed |
| 38:38 | not suitable enough | not good enough for it |
| 61:5 | constantly on the alert | on the _qui vive_ |
| 63:11 | a thoroughly blue scandal | a sad dark-blue scandal (pass B) |
| 74:9 | His general exclusion had begun. | The general black-balling had begun. |
| 84:42 | as final as murder | as fatal as murder |
| 56:20-21 | good birth and good looks (x2), those advantages | blood and beauty (x2), those gifts |
| 80:10 | another pleasing association ... Still—what does it matter now? | a new ring in the sound of my name to recommend it in her hearing; however—what does it signify now? |
| 88:8 | “All the more fools they!” | “The more spooneys they!” |

Not changed (not requested, noted for Anders): live 20:25 still renders the German `Der Neffe als Onkel` / `_ungeheuer!_` in English ("The Nephew as Uncle ... monstrous!").

## Verification
- JSON valid; 88 units, 4,674 paragraphs, paragraph-aligned with original-en; shards match the edition (88/88).
- Paragraphs under 0.70 of source words (source >= 20 words): 35, all pre-existing; none new (two older ones, 29:12 and 67:12, are now above 0.70).
- `!` check: 0 paragraphs with fewer; epigraph check: 100/100 identical to original-en.
- `python3 books/classify-modern-en.py middlemarch --gate`: GATE PASS, weighted similarity 0.489 (<= 0.75), light+mechanical 0/88 = 0.0%, identical long paragraphs 88/4078 = 2.2% (<= 5%), buckets REAL-HEAVY 49, REAL 39, LIGHT 0, MECHANICAL 0, no wrapped scaffolding, no truncated quotations.
- From app/: `npm test` 249 files passed, 2,920 tests passed, 1 skipped; `CI=1 npm run build` exit 0, no errors; `npm run verify-bundle` passed. The build was run with `app/public/read` moved aside temporarily because the shared disk was nearly full; it was restored afterwards and `sitemap.xml` reverted.
