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

## Tier A (blog) — DHH's own book-review posts on HEY World, read directly

| Post | Books | Notes |
|---|---|---|
| [Books that bust bubbles](https://world.hey.com/dhh/books-that-bust-bubbles-35c46be2) (2021-12-01) | Sowell *A Conflict of Visions*; Haidt *The Coddling of the American Mind*; Kishimi/Koga *The Courage to Be Disliked* (Adler); McWhorter *Woke Racism*; Shellenberger *San Fransicko*, *Apocalypse Never*; Murray *Facing Reality*; Taibbi *Hate Inc* | All in copyright. Reading list is explicitly framed by him ("books for left-leaning readers to challenge their worldview"). |
| [You gotta read Less Is More](https://world.hey.com/dhh/you-gotta-read-less-is-more-88a4f37f) (2021-03-03) | Hickel *Less Is More*, *The Divide*; Wallace-Wells *The Uninhabitable Earth*; Piketty *Capital in the 21st Century* | In copyright. |
| [Misery starts when the struggle ends](https://world.hey.com/dhh/misery-starts-when-the-struggle-ends-390c700f) (2022-09-22) | **Dostoevsky, *Notes from Underground*** (`notes-from-underground`, in Tinct); Orwell essay "Can socialists be happy?"; Sowell *Knowledge and Decisions* | On Notes: "a remarkable book, and a mercifully short one too, compared to the rest of Dostoevsky's works. I can't recommend it highly enough." Also points to a Jordan Peterson lecture on it. |
| [The will to power will return](https://world.hey.com/dhh/the-will-to-power-will-return-58ffb9dc) (2026-07-12) | Strauss & Howe *The Fourth Turning*; Fukuyama *The End of History* (linked) | Cited as framework, not a review. |

`Wolves, sheep, and gypsies` and `The Rape of Britain` only list his own books in the byline; no other book content.

## User-attested, source URL still needed
- ~~Notes from Underground~~: resolved, sourced to the 2022-09-22 blog post above (Tier A).
- The first "five books that meant the most to me" tweet, https://x.com/dhh/status/1739664047191232973, exists but X returned HTTP 402 to the fetcher; contents unread. It is probably the best single "canon" source and should be read by hand.

## Finding from the blog pass
His blog posts are mostly opinion and tech; the true book-review posts are 2021 (two). Almost all of what they recommend is in copyright, so they don't help fill Tinct. His Tinct-relevant picks (Kafka, Kierkegaard, Dostoevsky, Stoics, Orwell) come from tweets and podcasts, so the tweet list is the key missing source.

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
