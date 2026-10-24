# Danish retranslation 1 — Pride and Prejudice, Moby-Dick, Crime and Punishment

Content only. Nothing is integrated into the app, the registry or any live data file.

## What is here
| Book | File | Paragraphs | Words | Live Danish words |
|---|---|---|---|---|
| Pride and Prejudice | `books/wip/pride-and-prejudice/editions/pride-and-prejudice-modern-da.json` | 2053 | 122,085 | 117,600 |
| Moby-Dick | `books/wip/moby-dick/editions/moby-dick-modern-da.json` | 2432 | 210,518 | 188,468 |
| Crime and Punishment | `books/wip/crime-and-punishment/editions/crime-and-punishment-modern-da.json` | 3904 | 199,432 | 185,593 |

SHA-256 values are in `SHA256SUMS.txt`.

Each file replaces the live `*-modern-da.json`. Paragraphs, chapters and chapter numbers match the live `*-modern-en.json` one to one, and chapter titles are the live Danish titles.

## How it was made
1. The live modern-en edition was split into 216 bundles of about 2,500 words and translated by helper agents (no API spend).
2. Titles and the "neger" rule were normalised by regex: Mr./Mrs. stay English, "neger" becomes "sort/de sorte".
3. Every paragraph went through an independent review in 371 packets. 1,333 paragraphs failed review (pap 242, mob 665, cpu 426), and each got a minimal replacement from the reviewer. All replacements are applied.
4. Small consistency regexes: Sankt Petersborg, Madame, galoppere, leviatanner/Leviatan.
5. Checks run: paragraph and chapter counts equal the English, no straight or English quotes, no `--`, `\n` and `_` and `[n]` counts match the English, no "neger", no unmarked "miles".

## Problems found in the process
- The reviewer of packet cpu-da-P134 attached two replacements to the wrong ids (shifted by one). I re-keyed them to 38:54 and 38:55 and rebuilt the lost 38:56 fix by hand.
- No reviewer fix was re-reviewed after it was written.

## Open points for a human or native read
- No native Danish read-through has been done.
- Du/De between officers is not uniform. Reviewers disagreed on Ahab to Starbuck, Stubb and Flask, and on Raskolnikov and Sonia. Pick one rule per pair and normalise.
- Nautical terms vary across the Moby-Dick chapters: "essing", "skansekled(ning)", "hals" vs "enkelttalje" for the whip, "Kap Horn" vs the glossary's "Cape Horn". One reviewer proposed "Cape Horn" and others kept "Kap Horn".
- "lord"/"Lord" and "kontorchefen"/"overskriveren" are not unified in Crime and Punishment.
- Moby-Dick contains period words for the Black characters, such as "nigers" in chapter 99 (one reviewer flagged it). Anders decides whether to soften.
- Longest-sentence style follows Melville's; reviewers split a handful of 60+ word sentences and left the rest.
