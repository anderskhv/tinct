# Reading list demo: DHH (David Heinemeier Hansson)

Status: research draft, 2026-09-30. Not wired into `LIBRARY_READING_LISTS`.

Rule (from acclaim-quote policy): an entry ships only with a primary source URL. Tiers below say how far each entry got.

## Tier A — primary source read directly

| Book | In Tinct? | Source |
|---|---|---|
| A Guide to the Good Life (Irvine) | no (in copyright) | Daily Stoic interview, https://dailystoic.com/dhh/ — step 1 of his Stoic order |
| On the Shortness of Life (Seneca) | no (missing, PD, easy add) | same — step 2 |
| **Meditations** (Marcus Aurelius) | **yes** `meditations` | same — step 3 |
| The Daily Stoic (Holiday) | no (in copyright) | same — step 4 |
| Maverick (Semler), Punished by Rewards, Myth of the Spoiled Child (Kohn), Age of Absurdity (Foley), Drive (Pink), Turn the Ship Around! (Marquet), Origins of Political Order / Political Order and Political Decay (Fukuyama), The Big Short, 4-Hour Workweek, Understanding Exposure | no (all in copyright) | Tim Ferriss show notes #195, https://tim.blog/2016/10/27/david-heinemeier-hansson/ |

## Tier B — cited by aggregators (mostrecommendedbooks.com, readthistwice.com) to a DHH tweet; tweet URL not yet opened

| Book | In Tinct? | Aggregator claim |
|---|---|---|
| **The Trial** (Kafka) | **yes** `trial-kafka` | "Perhaps my favorite novel of all time" |
| The Road to Wigan Pier (Orwell) | no | tweet about gig economy |
| Escape from Freedom (Fromm) | no | "one of my all-time top ten favorite books" |
| A Doll's House (Ibsen) | no (PD, easy add) | "Classic Danish play" |
| Either/Or (Kierkegaard) | no (PD, easy add) | tweet |
| I and Thou (Buber), Hate Inc., Bullshit Jobs, The Management Myth, Give and Take, The Talent Code | no | tweets |

## Tier C — appears on aggregators with no source found

**The Manual** (`the-manual`), **Fear and Trembling** (`fear-and-trembling`), **1984** (`1984`), **Wealth of Nations** (`wealth-of-nations`), **Notes from Underground** (`notes-from-underground`), The Stranger, Brave New World, Domain-Driven Design, PoEAA, Refactoring, and others. Do not publish until a DHH source is found.

## Not found
Both Lex Fridman transcripts (#474 and the follow-up) came back with no book mentions from a summarising fetch. A search snippet claimed he recommends *Patterns of Enterprise Application Architecture* in #474; unverified. Rerun with full-text grep before relying on either result.

## What the demo says about the product
- Only about 2 of ~25 well-sourced picks are readable in Tinct today (Meditations, The Trial); 3 more are trivial PD adds (Seneca, Ibsen, Kierkegaard's Either/Or).
- DHH's list is mostly modern nonfiction, so a "DHH shelf" of Tinct books alone is thin. Best framing: **"DHH's Stoic sequence"** (Irvine → Seneca → Meditations → Daily Stoic) plus **"DHH on Kafka / Kierkegaard"**, with in-copyright titles shown as "not in Tinct".

## Next steps (need your call)
1. Open the DHH tweets directly to promote Tier B to A (X is often blocked to fetch; may need manual links).
2. Add `sourceUrl` to `LibraryReadingListEntry`, plus a `curator` type for person lists.
3. Onboard Seneca, Ibsen, Either/Or via the book workflow.
