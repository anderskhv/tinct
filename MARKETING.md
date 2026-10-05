# Tinct — Marketing

**Created:** 2026-10-05. Owner: Anders.
**Scope:** day-to-day outreach. Mainly replying to conversations that Social Lead Finder surfaces on Reddit and YouTube without getting removed, shadowbanned or labelled a spammer.
**Companion docs:** [`GROWTH-PLAN.md`](GROWTH-PLAN.md) (launches, budget, the big moves), [`SEO-STRATEGY.md`](SEO-STRATEGY.md) and [`docs/seo-roadmap.md`](docs/seo-roadmap.md) (search), [`STRATEGY.md`](STRATEGY.md) (positioning, pricing).

---

## 1. The pitch is the gift: reading is free

Tinct's strongest marketing fact is also its best protection against spam reports: **you aren't selling anything to someone who only wants to read.** Lead with that.

### What we can say (true as of 2026-10-05; re-check before changing)

| Claim | Exact wording to use | Source |
|---|---|---|
| Reading is free, permanently | "Reading on Tinct is free, no ads, no account needed to start." | `STRATEGY.md` §2, §10.6 |
| Modern English alongside the original | "It shows the original next to a modern-English version, paragraph by paragraph." | `STRATEGY.md` §2 |
| Optional paid extras | "There's an optional $3/month tier for the AI companion and narration; you never need it to read." | `STRATEGY.md` §5 |
| Who makes it | "I'm building it" / "I made this", **always** | Reddit norm; see §3 |

### What we must not say

- **"Completely free"** with no qualifier. The reading is free; the AI companion and narration are Premium. Someone will check, and a half-truth in a Reddit thread gets screenshotted.
- **Danish editions.** Out of scope since 2026-09-21. (`llms.txt` and the Odyssey meta still say it; that's a known site fix, not a talking point.)
- **A book that isn't live.** Check `https://tinct.app/read/{bookId}` returns 200 before naming it. As of today *Treasure Island*, *Robinson Crusoe* and *Twenty Thousand Leagues* are **not** live; *Moby-Dick* and *The Odyssey* are.
- **"Translated by experts" or anything that hides how the modern editions are made.** If asked, say plainly that the modern-English versions are AI-assisted and reviewed, and that the original is always one tap away. Book communities are hostile to undisclosed AI. Being upfront costs a few upvotes; being found out costs the account.
- Comparisons that put down Penguin, Oxford, Standard Ebooks, Gutenberg or a translator by name. Tinct is a way into these books, not a rival to the people who print them.

---

## 2. Social Lead Finder workflow

The tool emails matches for `https://tinct.app` in two buckets: **DIRECT_MATCH_HIGH_INTENT** and **Possible Matches**. The labels are a starting point; the triage below decides.

### Triage: answer only the A's

| Grade | Test | Action |
|---|---|---|
| **A: Reply** | The person is asking something a classics reader can genuinely answer: which edition or translation, how to start a classic, how to stick with a hard book, what to read next in the canon. | Reply. Mention Tinct only if it is part of the answer (§3 rule 4). |
| **B: Help, no link** | The topic fits but Tinct isn't the answer (habit building, general reading advice, a commenter rather than the poster). | Answer helpfully **without mentioning Tinct**. It builds account history and karma, which pays for the A replies later. |
| **C: Skip** | Contemporary or copyrighted books, test prep, fandom threads, anything where Tinct would be a non sequitur. | Ignore. Replying here is what gets accounts reported. |

Also skip any thread that is **older than ~7 days** (late replies with a link look like bots), is locked or archived, or is in a subreddit whose rules forbid self-promotion (see §4).

### Mechanics

1. Open the lead, then go to the **actual thread** and read the whole post and its top comments. The tool's one-line summary is often wrong about intent.
2. Draft the reply. Paste it here (Claude Code session) with the thread link or the post text, and the subreddit name, for a check against §5 before posting.
3. Post from the platform itself, never via the tool's redirect link.
4. Log it in §6. Come back after 24 hours and record whether it was removed, its score, and any replies. Answer follow-up questions; that's where the real conversions happen.

**Budget:** at most 3–5 replies a day, of which at most one mentions Tinct. Volume is the fastest route to a ban.

---

## 3. Rules for not getting banned

These are the patterns Reddit's spam filters, moderators and users act on. They apply to YouTube comments too, with the YouTube notes below.

1. **Disclose, every time.** Any mention of Tinct says you built it: "(I make this)", "full disclosure, I'm building it". Undisclosed self-promotion is the single most reported thing on Reddit.
2. **Answer first, product last.** The reply must be useful with the Tinct sentence deleted. If it isn't, don't post it.
3. **9 in 10 contributions don't mention Tinct.** The old Reddit "10% rule" is no longer official policy, but moderators still apply it informally, and it's the pattern the spam filter looks for: an account whose posts mostly link one domain.
4. **One mention, one link, at the end.** Plain `tinct.app`, no URL shorteners, no UTM parameters, no tracking redirects. Link to the specific book page (`https://tinct.app/read/odyssey`) when it answers the question, not the homepage.
5. **Never paste the same text twice.** Identical or near-identical comments across threads are an automatic spam signal. Write each reply fresh.
6. **No new or empty accounts.** Use your real, aged account with ordinary history. Don't create a "Tinct" brand account for replies, and never use a second account to upvote or agree with yourself (vote manipulation is a site-wide ban).
7. **No unsolicited DMs.** If someone asks for the link, reply in public or answer their DM. Never DM first.
8. **Removed means done.** If a mod removes a reply, don't repost it, don't argue in modmail, and don't post to that subreddit again without reading its rules. If you think the rule is unclear, ask the mods *before* posting next time.
9. **Read each subreddit's rules (sidebar and wiki) before your first post there.** Many book subs ban self-promotion outright or allow it only in a weekly thread.
10. **Don't reply to everything the tool surfaces in one subreddit.** Three Tinct mentions in one sub in a week and people will notice.

**YouTube:** comments with links are often held for review by the channel or filtered by YouTube. Prefer naming the site in words ("it's called Tinct") or leaving it out. Never post the same comment under several videos.

---

## 4. Subreddit notes

Fill this in as you go. Record each sub's actual rules after reading the sidebar; don't rely on memory, rules change.

| Subreddit | Self-promo rule (verified on date) | Fit | Notes |
|---|---|---|---|
| r/classicliterature | _verify_ | High | Edition and translation questions are the core A lead. |
| r/books | _verify_ (historically strict) | Medium | Assume no product mentions unless the rules say otherwise. |
| r/suggestmeabook | _verify_ | Medium | Recommend books, not apps. |
| r/AskLiteraryStudies, r/literature | _verify_ | Low–medium | Expert audience; an AI reader will get pushback. Help without links. |
| r/TrueChristian, r/Bible, r/Christianity | _verify_ | Low–medium | B leads mostly: habit advice, no link unless asked for a reading tool. |

---

## 5. Review checklist (what Claude checks when you paste a draft)

Paste: the draft, the subreddit or video, and the post or comment you're answering (text or link). The verdict comes back as **Post / Edit / Don't post** with reasons, scored against:

1. **Rules.** Does this subreddit allow it? (If unknown, verdict is "check the sidebar first".)
2. **Useful without Tinct.** Delete the Tinct sentence: is it still a good answer to *their* question?
3. **Disclosure.** Present, plain, in the same sentence as the mention.
4. **Claims.** Every Tinct claim matches §1 ("free" qualified; the book is live; no Danish; AI-assisted if the subject comes up).
5. **Link hygiene.** At most one, plain, specific, at the end; none on YouTube by default.
6. **Tone.** Sounds like a reader, not a landing page: no "game-changer", "revolutionary", feature lists, exclamation marks or emoji.
7. **Freshness.** Thread is under ~7 days old; the reply isn't a copy of an earlier one.
8. **Account pattern.** How many Tinct mentions this week, and in this sub?

---

## 6. Outreach log

| Date | Platform / place | Thread | Grade | Mentioned Tinct? | Result after 24h |
|---|---|---|---|---|---|
| | | | | | |

---

## 7. Worked example: leads from the 2026-10-05 email

| Lead | Grade | Why |
|---|---|---|
| YouTube: pirate/nautical book recommendations (comment on a book-review video) | **B** | A real request, but our obvious pirate book (*Treasure Island*) isn't live. Recommend books; naming Tinct is optional and link-free. |
| Reddit r/classicliterature: Oxford World's Classics vs Penguin Classics | **A** | Exactly our reader: new to classics, choosing an edition. |
| Reddit: building a daily Bible-reading habit (a commenter suggests starting with John) | **B** | Help with the habit; no link unless someone asks for an app. |
| Reddit: improving reading comprehension and speed for a test | **C** | Test prep, not classics. |
| Reddit r/LesbianBookClub: worst WLW book | **C** | Contemporary books, no question Tinct answers. |

**Draft for the A lead** (adapt to the actual post before using; don't paste verbatim):

> For books originally written in English, the text is basically the same in both, so you're choosing between the extras. Oxford tends to have fuller endnotes and textual notes; Penguin's introductions are often livelier and their recent printings have nicer paper. Either is a good buy.
>
> For translated books it matters much more, because the translator is the real choice, not the publisher. Look up who translated each edition (Penguin and Oxford often use different ones) and read the first page of each in a bookshop preview. The one whose voice you like on page one is the one you'll finish.
>
> One tip: skip the introduction until you've finished the book. Both series' intros give away the plot.
>
> If you want to try a book before buying, I'm building a free reader, tinct.app, that shows the original next to a modern-English version. No ads, no account needed. But a good paperback is still the best way to read these.

**Draft for the YouTube B lead:**

> *Treasure Island* is the obvious one and still the best. Then *Captain Blood* by Rafael Sabatini if you want swashbuckling, and *Moby-Dick* if you want to go deep (literally). Patrick O'Brian's *Master and Commander* if you'll take navy instead of pirates.
