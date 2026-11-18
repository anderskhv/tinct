# Modern-English page and campaign: concept (2026-11-18)

Concept only; nothing is built. For Anders to decide.

## Recommendation

**Who it's for: the stuck reader.** This is someone who has started *Hamlet*, *Crime and Punishment* or *Meditations*, bounced off it, and would otherwise give up or read a summary.
- The busy reader stays a target, but through the app and listening, not this page.
- This page can't promise listening, and two thirds of visitors are on phones, where the stuck reader's path (open a book, read) works today.

**The one job:** get a stuck reader into chapter 1 of *their* book, in modern English, within one tap of arriving, and make the older text easy to find so they trust it.

**Core message** (shares the voice of "No text is beyond you."):
> **The classics, in plain modern English. Free.**
> Every page rewritten in today's English with AI. The original text is always beside it.

**How it works:**
- **The page is a short hub, not a catalogue.** Ads and search land on the book itself; Reddit and broad searches land on the hub.
- **Test in 3 weeks:** about $150 of Google search ads on "[title] in modern English / plain English / easy to read / read online", plus two honest Reddit posts.
- **Go, change or stop** depends on whether visitors **read for 1+ minute** and **come back on a third day**, compared with today's baseline.

**Fix before any traffic** (each one breaks the promise otherwise):
1. **Make the Original/Modern switch one tap on phones.** Today it sits at Menu → Book settings → Main version.
2. **Name what "original" is.** For 52 books it's an old public-domain English translation, not the author's text.
3. **Remove every claim that the editions have been checked**, including our own Try page FAQ draft.

**Decide now:**
- signed-out listening: allow it for cached chapters only, and pre-record the "Start here" first chapters for about $15;
- an ad budget of about $150 for three weeks;
- no Danish test yet;
- competitor keywords: no.

## What in the brief I think is wrong

1. **"The original always one tap away"** isn't true yet, for two reasons:
   - On a phone, switching editions takes 3+ taps (Menu → Book settings → Main version), and side-by-side is desktop-only. Two thirds of visitors are on phones.
   - For **52 of the 116 registry books**, "original" means a 19th- or early-20th-century English translation: Garnett, the Maudes, Butler, Pope, the Long *Meditations* (1862). Our modern edition is a rewrite of *that* translation, not a new translation from the Greek or Russian. Calling it "the original" in a thread about which translation to choose will, rightly, get called out.
2. **Signed-out visitors can already listen,** but only to narration that's already recorded, in two voices (Ara and Helios). The `cacheOnlyGuest` path in `worker/routes/narration.ts` covers this. Recording new narration needs an account. So the real decision is whether signed-out visitors can trigger *recording*, not whether they can listen.
3. **Per-book modern-English pages already exist.** `/read/{book}` pages ("Hamlet in modern English, scene by scene") and chapter pages, 1,481 addresses in the sitemap, are the pages that win searches like "hamlet full text". The hub should point to and strengthen these, not duplicate them.
4. **108 books:** the registry has 110 modern-English edition files. Take the number from the registry when building, after held editions are removed.
5. **"Readers who read on 3+ days almost all stay"** is a description of who stays, not something that causes staying. Use a third reading day as an early signal, not a promise.
6. **Our own Try page FAQ draft** says the modern English is "checked against the original". That breaks this constraint, and I'm fixing it in the Try brief.

## 1. Concept options

| | A. Stuck reader (recommended) | B. Busy reader | C. Both: "the modern-English library" |
|---|---|---|---|
| Message | "The classics, in plain modern English. Free." | "Read it or hear it, wherever you are." | "108 classics in modern English" |
| Job | Get a stuck reader into chapter 1 of their book | Start listening | Browse the collection |
| Works on phone today | Yes | No: signed-out visitors can't record narration, and we can't promise it | Partly |
| Matches searches that convert | Yes ("hamlet full text", "read moby dick online") | Weakly (audiobook searches go to Audible and Libby) | Weakly |
| Risk | Trust in AI editions | Costs money; makes a promise we can't keep yet | A catalogue with no job; people look and leave |

**Why A:** the evidence points there. The searches that converted are about reading a specific book. Your most loyal reader uses Explain dozens of times. Phones handle reading well. B is the next campaign, once signed-out listening is decided and measured.

## 2. Page structure (`tinct.app/modern-english`)

**Phone (above the fold):**
- "The classics, in plain modern English. Free."
- One line: "Every page rewritten in today's English with AI. The original is always beside it."
- A search field: "Find a book…".
- "Start here": 6 covers you can scroll sideways:
  - Hamlet
  - Meditations
  - Pride and Prejudice
  - Crime and Punishment
  - The Odyssey
  - Frankenstein
  
  (Final picks should be the books with the most modern-English reading in the last 6 weeks.)
- A small specimen beneath, before and after: one famous line in the older text with its modern line under it, e.g. "To be, or not to be…" or Meditations 2.1. It answers "what is this?" faster than any copy.

**Desktop:** the same, with the specimen as two columns (older text | modern English). That previews the compare view without depending on it.

**Below the fold:**
- **Start here (6):** each book gets one honest line on why people get stuck and what helps. Example: *Crime and Punishment*: "Long and full of patronymics: the modern edition uses one name per person." Only make claims like that if the edition really does it.
- **All books by shelf,** using the library's shelf names. Each row shows the title, author, "Modern English · from [the original | Garnett's 1914 translation]" and an approximate reading time. **No difficulty labels:** we don't have that data, except one pilot book map.
- **How the editions are made:** the short trust block in section 3.
- **Closing link:** "No text is beyond you. See how Tinct works →" goes to the Try page, so the two pages work together rather than compete.
- **Footer.**

**Where links land:**
- **A book from the page, ads or Reddit:** the reader, chapter 1, modern-English edition, with the one-tap switch visible. Anyone who already has a saved place keeps it.
- **"See it side by side"** (desktop only, a secondary link): the reader's compare view.
- **Searches for a specific book** keep landing on the existing `/read/{book}` page. Its main button should open the reader at chapter 1 in modern English. The hub links to every `/read/{book}`, which helps those pages rank.
- **Never the library grid.** A new visitor can't choose from 108 books.

**Mockup first:** this is a page-heavy piece of work, so the next step is a phone and desktop mockup in the Try page canvas style before anything is built.

## 3. Trust: make "made with AI" a reason to trust it

- **Say it plainly, once, near the top:** "Rewritten in modern English with AI. Not a scholarly translation. The original is always beside it."
- **Name the source on every book row and in the reader's edition switch:**
  - "Modern English, made with AI from Shakespeare's text";
  - "…from Constance Garnett's 1914 translation".
  
  That one line answers the translation question honestly.
- **Notes on this edition:** a short, human-written note per book listing deliberate choices: names kept on purpose, archaic terms explained rather than replaced, what was simplified. The reader who doubted the unusual names needed exactly this. Write these through the book workflow, starting with the 6 "Start here" books.
- **One tap back to the older text on a phone,** at the same line. This is the main trust feature on phones. It needs the top-bar switch (see "Fix before any traffic").
- **"Something wrong here?"** on any selected passage. It goes to a report queue, and fixes show up as dated edition patches, which the reader already supports.
- **Never say** "accurate", "faithful", "checked" or "verified" unless a check has really been done and recorded.

## 4. Distribution

**Google search first.** It's the only channel with controllable volume and intent, and the only one that has converted so far.
- **Target:** "[title] in modern English", "[title] in plain English", "[title] modern translation", "[title] easy to read", "read [title] online", "[title] full text". Start with the 6 "Start here" books plus Moby Dick.
- **Exclude:** pdf, download, epub, summary, sparknotes, essay, quotes.
- **Ads land on the book** (the reader at chapter 1, or `/read/{book}`), not the hub. The hub is for broad terms like "classics in modern english" or "shakespeare in plain english".
- **Ad copy:** "Hamlet in plain modern English. Free, no sign-up. Original beside every line." (The last part only once the phone switch is fixed.)
- **Budget:** about $50 a week for 3 weeks, tagged `utm_source=google&utm_campaign=modern-english&utm_content={book}`.
- **Organic:** the hub links every `/read/{book}`. No new pages are needed for search.

**Reddit: two honest founder posts**, each following that subreddit's self-promotion rules and checked with the moderators first. Reply to every comment for 48 hours.

1. **r/shakespeare:**
   > *Title:* I made free modern-English versions of Shakespeare's plays, with the original one tap away. Where does it get things wrong?
   > *Body:* who I am; that the modern text is made with AI and is a reading aid, not a replacement; one before-and-after passage; a link to one play (not the hub); and a genuine ask: "If you teach or know the plays well, tell me where it flattens something important." This is an invitation to find mistakes, which builds trust and brings people back.
2. **r/Stoicism:**
   > *Title:* Meditations in plain modern English, free, next to the 1862 Long translation
   > *Body:* name the source translation up front; one passage (2.1) before and after; say what is lost; link to Book 2.

   Tagged `utm_source=reddit&utm_content={subreddit}`.

**Don't:**
- comment on old "which translation" threads (they reach almost nobody);
- post in r/books (strict rules, low fit);
- post in Russian-literature communities until the "from Garnett's translation" labels exist.

## 5. Measures and decision rules

**Measured per channel and per `utm_content`,** first-party only:
1. **Landed visitors.**
2. **Read 1+ minute:** a share of landed visitors who spend at least 60 seconds of reading time in the reader.
3. **Third reading day within 14 days:** a share of landed visitors.
4. **Supporting:** switched to the older text at least once (a trust signal); used Explain; reported a passage.

**Baseline first:** before launch, Coder pulls these three numbers for the last 6 weeks of all traffic, so the rules below compare against our own history and not a guess.

**Minimum before judging:** 150 landed visitors per channel. At $50 a week this takes about 2–3 weeks for ads; one Reddit post may be enough on its own.

| Result after 3 weeks | Means | Do |
|---|---|---|
| Read 1+ min ≥ 1.5× baseline **and** third day ≥ baseline | **Go** | Raise the ads budget on the winning books, write the next 6 notes, add more books. |
| Read 1+ min ≥ 1.5× baseline, third day below baseline | **Change** the reader, not the page | They start but don't come back. Look at the phone switch, resume and returning. Keep the budget flat. |
| Read 1+ min below baseline after 2 versions of the message | **Stop** this angle | Pause the ads. The "free modern English" hook isn't the reason people stay. |
| Cost per reader who reads 1+ min above $1.50 | **Change** keywords or books | Cut keywords that don't convert, keep the books that do. |

The thresholds are proposals until the baseline is in; adjust them once.

## 6. Decisions for Anders

| Decision | Recommendation |
|---|---|
| **Signed-out listening** | Keep it cached-only, as today, and **pre-record chapter 1 of the 6 "Start here" books** in the two guest voices. At about 15 minutes per chapter that's about 90 minutes at $0.06 a minute, roughly $6 per voice, $11 for both. Don't advertise listening on this page; measure whether people find it. |
| **Phone edition switch** | Put Original/Modern in the reader's top bar, as on the Try page. **Required before launch.** |
| **Label the source translation** | Show "from [translator, year]" on the 52 translated books. **Required before Reddit.** |
| **Ad budget** | $150 over 3 weeks, Google search only. |
| **Competitor keywords** ("no fear shakespeare", "sparknotes") | **No** for now. Trademark-sensitive, and the people searching want a study aid, not a reader. |
| **Danish test page** | **Not yet.** English is the strategy; Danish needs native spot checks and its own workflow. Revisit after an English "go". |
| **Notes on this edition** | Write them for the 6 "Start here" books before launch, through the book workflow, so there's no API spend. |
| **Page address** | `/modern-english` is fine and matches the searches. |

## Questions I couldn't answer from here

- **Today's baseline numbers:** read 1+ minute, and third reading day. I don't have analytics access; it's a Coder query.
- **Which 6 books get the most modern-English reading:** this decides the "Start here" picks.
- **Whether the reader already has a "report this passage" path** or only edition patches applied by us.

---

## Anders's decisions (18 Nov 2026) and what changes

1. **One tap on phones:** agreed. For signed-out visitors on a phone, the reader's top bar shows **Original | Modern** in the slot the Play button uses today. Play moves into the menu for them, because they can't record new narration anyway. Signed-in readers keep Play in the bar. This is a reader UI change, so it needs a mockup first. It also fixes the "one tap away" promise for the Try page.
2. **No new recordings by signed-out visitors:** decided. Already-recorded narration stays playable for guests, as the code does today. Open: should we pre-record chapter 1 of the 6 "Start here" books ourselves (about $11) so guests can hear them? I recommend yes, but it isn't decided.
3. **The hub points to the existing `/read/{book}` pages:** agreed.
4. **Label the source translation on translated books:** agreed.
5. **Danish version:** yes, at `tinct.app/moderne-dansk`, pointing only at the **37 Danish editions Tinct offers** (the `OFFERED_DANISH_EDITIONS` allowlist; the other 71 Danish files are held). The rules are the same:
   - "moderne dansk, lavet med AI";
   - name the source;
   - no accuracy claims;
   - a native speaker checks the page copy and the "Start her" picks before it goes live.
6. **Ad testing:** yes. See "Ad test" below.

## The goal is a snowball of leads

That changes what we count and adds one piece the page lacks: a way for each new reader to bring the next one.

- **A lead is a created account** (an email we can write to), not a visit. With no tracking pixels, it's counted first-party, by `utm` and `ref`.
- **The loop:**
  1. A visitor reads a chapter.
  2. They make an account to keep their place and notes. This is the lead.
  3. They share a passage or invite a friend, with a book attached. The invite flow is already designed in `docs/social/INVITE-BY-EMAIL.md`.
  4. The friend lands on *that book* in modern English, and the loop starts again.
- **Share moment in the reader:** after a reader's first Explain, or at the end of a chapter, offer "Send this passage to someone". It sends the line, its modern version and a link to that spot, tagged `ref=share`. No prompts before the reader has read anything.
- **Reddit and search start the snowball; sharing keeps it rolling.** The Reddit posts also build the founder's account, so later posts reach more people.
- **Measured weekly:**
  - **new accounts per channel;**
  - **invited or shared visits per new account:** the snowball number. Above about 0.3 the loop is doing real work; above 1 it would grow on its own, which is rare;
  - **cost per account** from ads.

## Ad test (Google search, first-party `utm` only)

| | English | Danish |
|---|---|---|
| Budget, 3 weeks | about $100 | about $50 (Danish clicks are usually cheaper) |
| Searches | "[title] in modern English / plain English / read online / full text" | "[title] på dansk", "læs [title] gratis", "[title] moderne dansk", "[title] online" |
| Books | the 6 "Start here" books + Moby Dick | the Danish "Start her" picks from the 37 offered (e.g. Meditationer, Forbrydelse og straf, Moby Dick, Fyrsten) |
| Lands on | the book, chapter 1, modern edition | the book, chapter 1, Danish edition |

- **Two messages per language,** as separate ads in the same ad group:
  - **"Stuck":** "Gave up on Hamlet? Read it in plain modern English. Free."
  - **"Free and honest":** "Hamlet in modern English, free. Made with AI, original beside it."
- **Judge on cost per account and on reading 1+ minute, not on clicks.**
- **Exclude:** pdf, download, epub, summary, resumé, opgave, noter.
- **Stop any ad group** that has spent $25 without an account.

**What we'll learn:** which message brings readers who stay, and whether Danish brings leads more cheaply than English. If it does, that's the case for more languages.
