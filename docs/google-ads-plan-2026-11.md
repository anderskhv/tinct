# Google Ads: critique and two-week plan

**Owner:** Claude (this stream), from 16 Nov 2026. Anders decides on spend, pricing and new services.
**Hard constraints:** no Google tag, no conversion pixel, no remarketing, no smart bidding that needs conversions. Measurement is Tinct's own first-party data (utm_* and gclid on the landing URL).

---

## 1. Verified on 16 Nov (production, fetched as Googlebot)

| URL | Result |
|---|---|
| `/reader?book=hamlet` | 6.7 KB JavaScript shell, `noindex`. No text for Google's landing-page check. |
| `/read/hamlet/act-1-scene-1?utm_…&gclid=…` | 200, 89 KB, about 3,000 words of real text (original and modern English), loads in about 0.5 s. |
| Scene-page script | Records `utm_source/medium/campaign/term/content` and `gclid` as first touch, and copies them onto the hand-off links into the reader. Ad tags survive the hand-off. |
| Scene pages live | Hamlet 20, Macbeth 28, Romeo and Juliet 24, Julius Caesar 18, Othello 15 (105 in total). |
| `/read/moby-dick` | 200, 40 KB static book page (crawlable). A better Moby-Dick landing page than `/reader?book=moby-dick`, which is a 6.7 KB shell with `noindex`. |

---

## 2. Critique

**1. The main problem is ad rank, not budget.**
About 3 impressions in four days, with the budget untouched, means the ads mostly lose the auction. That comes down to three things:
- **A low cap.** DKK 7 (about $1) on terms where SparkNotes, LitCharts, Chegg and Study.com advertise.
- **A brand-new account** with no history.
- **The landing page.** A JavaScript shell rated "below average".

Raising the cap to DKK 15 is right. On its own it probably isn't enough while the landing page stays the shell.

**2. The keywords are both narrow and partly the wrong intent.**
- **Wrong intent:** "hamlet summary", "hamlet analysis" and "moby dick chapter summary" are student homework searches. Those people want a summary in 30 seconds, not to read the play. They will click "Scene Summaries" and leave, which could make the ads look like they work while bringing nobody who reads.
- **Better intent:** "hamlet modern english", "hamlet in plain english", "hamlet modern translation", "no fear shakespeare hamlet" and "read hamlet online" match what Tinct actually is.
- **Biggest miss: scene-level searches.** Students search "hamlet act 3 scene 1 modern english", "macbeth act 1 scene 7 translation" and "romeo and juliet act 2 scene 2 in plain english". Tinct now has a page that answers exactly that query, word for word, for 105 scenes. Exact intent match is what lifts relevance and landing-page scores, and it's the one advantage Tinct has over the big study sites.

**3. Phrase match on narrow phrases is fine, but they need to be the right narrow phrases.**
Phrase match is the right choice with no conversion data: broad match plus Maximize clicks would wander. The problem is that each phrase gets little volume, so there need to be more of them, at scene level.

**4. Three angles can't be judged on this budget.**
- Comparing reading behaviour between three ads needs roughly 30–50 clicks per ad. At realistic volumes that's 4–8 weeks per book.
- **What two weeks can show:** click-through rate per angle, if each ad gets roughly 300+ impressions. That's a cheap signal of which message makes people click.
- **What it can't show:** which angle brings readers.
- **Fix:** judge the angles on CTR only, and judge the channel on pooled reading results across all ads. The angle test stays only on Hamlet's general keywords. Scene ad groups get one ad each (the modern-english angle), because their keyword already says what the searcher wants.
- **Pinning costs some rank.** Pinned headline 1 and description 1 lower Ad Strength. That's acceptable for a clean test, but it's another reason not to pin everywhere.

**5. Landing on scene pages is right.**
Scene pages are fast, crawlable and match the keyword, and the tags survive the hand-off (verified above). Two cautions:
- **Match the promise:** the "Ask Hamlet Anything" ad lands on a page where Ask is one step away (the hand-off to the live reader). The first screen should make that step obvious, or that angle will lose on reading results for reasons that have nothing to do with the message.
- **Match the scene:** land each scene keyword on its own scene. Land general Hamlet keywords on Act 1 Scene 1, or on the `/read/hamlet` book page if it reads better as a start.

**6. Check the utm_term placeholder.**
ValueTrack parameters such as `{keyword}` are filled in by Google in the **Final URL suffix** and tracking template. Ask the customer-success stream whether tagged visits show `utm_term` as real search terms or as the literal `{keyword}`. If literal, move the tags to the campaign's Final URL suffix (section 5, step D). This needs checking either way, because without it the per-keyword reporting doesn't work.

**7. The credit offer should not set the strategy.**
Spending DKK 3,000 by about 12 Jan unlocks DKK 3,000 of credit, which is about DKK 53 a day from now. That's worth having only if the clicks are worth something on their own. Don't raise bids just to spend.

**8. Seasonality favours a test now.**
Shakespeare searches follow the school term. 17–30 Nov is the best two-week window before Christmas. Demand drops from about 18 Dec until early January.

**9. Moby-Dick is a weak bet.**
- The ad text is restricted (an "adult content" flag on "Moby-Dick"), and the appeal is unresolved.
- The keywords lean towards summaries.
- The landing page is the shell.
- There are no scene or chapter pages to land on.

Recommendation: **pause it** and move its budget to Shakespeare. If the appeal is approved, restart it with landing on `/read/moby-dick`. Headlines can avoid the flag ("Melville's Whale Novel, Explained", "Read Melville in Modern English").

---

## 3. Confirm with Anders before changing anything

1. **Bid cap** on each campaign: still DKK 7, now 15, or something else?
2. **Ad rotation:** "Optimer" or "Optimer ikke"?
3. **Hamlet final URLs:** still `/reader?book=hamlet`, or the scene page?
4. **Hamlet negatives** added: movie, film, cast, trailer, tickets, theatre, theater, download, epub, torrent, hamnet?
5. **Moby-Dick appeal status:** the ad shows "Godkendt" (approved), "Kvalificeret (begrænset)" or "Afvist" (rejected).
6. **Anything else changed since 16 Nov:** keywords, budgets, locations, auto-applied recommendations ("Automatisk anvendte anbefalinger" should be off).

---

## 4. Two-week plan: 17–30 Nov

### Day 0 (17 Nov): changes, after confirming the above
- **Hamlet angles** campaign:
  - Final URLs → `/read/hamlet/act-1-scene-1` with the same tags.
  - Cap DKK 15.
  - Rotation "Optimer ikke".
  - Pause the summary and analysis keywords: "hamlet summary", "hamlet scene summary", "hamlet analysis".
  - Keep "hamlet explained" and the modern-English, plain-English, No Fear and read-online keywords.
- **Moby-Dick:** pause, unless the appeal is already approved. If approved, keep it only with landing on `/read/moby-dick` and its summary keywords paused.
- **New campaign "shakespeare-scenes"** (utm_campaign=shakespeare-scenes), Search only, same locations, Maximize clicks, cap DKK 15, **DKK 70/day** (the money freed from Moby-Dick).
  - Ten ad groups, one per famous scene, each landing on its own scene page:

  | Ad group | Scene page |
  |---|---|
  | hamlet-3-1 (to be or not to be) | `/read/hamlet/act-3-scene-1` |
  | hamlet-1-5 (the Ghost) | `/read/hamlet/act-1-scene-5` |
  | hamlet-3-4 (the closet scene) | `/read/hamlet/act-3-scene-4` |
  | macbeth-1-7 | `/read/macbeth/act-1-scene-7` |
  | macbeth-2-2 | `/read/macbeth/act-2-scene-2` |
  | macbeth-5-5 (tomorrow and tomorrow) | `/read/macbeth/act-5-scene-5` |
  | rj-1-5 | `/read/romeo-and-juliet/act-1-scene-5` |
  | rj-2-2 (balcony) | `/read/romeo-and-juliet/act-2-scene-2` |
  | jc-3-2 (Antony's speech) | `/read/julius-caesar/act-3-scene-2` |
  | othello-3-3 | `/read/othello/act-3-scene-3` |

  - Keywords per ad group (phrase match), Macbeth 1.7 as the example: "macbeth act 1 scene 7", "macbeth act 1 scene 7 modern english", "macbeth act 1 scene 7 translation", "macbeth act 1 scene 7 explained".
  - One ad per ad group, in the modern-english angle, with a headline naming the scene ("Macbeth Act 1 Scene 7, Explained").
  - utm_content = the ad group name.

### Day 3 (20 Nov): is it serving?
- **Under 50 impressions in total since day 0:**
  - Check ad and keyword statuses and run the ad preview tool.
  - Raise the cap to DKK 25 on the scene campaign only.
- **Search terms report:** add irrelevant terms as negatives.

### Day 7 (24 Nov): first read
- **From Google Ads:** impressions, CTR, average CPC and clicks, by ad and keyword.
- **From the customer-success stream** (by utm_campaign and utm_content): real tagged visits (excluding automated checks), visits that opened the reader or read ≥ 1 minute, and accounts created.
- **Adjust:**
  - Pause keywords with 100+ impressions and no click.
  - Move budget between the two campaigns towards the one with more engaged readers.

### Day 14 (30 Nov): decision
Definitions:
- **Engaged reader:** a tagged ad visit that read for at least 1 minute.
- **Benchmark:** the author's X post, where 8 of 98 visitors (8%) read for a minute or more.

| Result over 14 days | Decision |
|---|---|
| **Success:** at least 40 real clicks, ≥ 15% of them engaged readers, cost per engaged reader ≤ DKK 40 | Keep both campaigns. Add the next 10 scenes. Run at the level that unlocks the DKK 3,000 credit by about 12 Jan. |
| **Mixed:** cost per engaged reader DKK 40–100, or engagement 8–15% | Keep the scene campaign only, at DKK 70/day. Fix the landing page's hand-off. Re-judge on 14 Dec. |
| **Fail:** under 300 impressions in total even at a DKK 25 cap, **or** under 8% engaged, **or** cost per engaged reader over DKK 100 | Pause all Search campaigns. Put the time into people-led promotion. Revisit in January when term starts. |

**Raise the budget only** when a campaign is limited by budget ("Begrænset af budget") **and** meets the success line.
**Cut immediately,** any day, if spend passes DKK 500 in total with no engaged reader.

### Why stop is a real option
**On cost:**
- One author's X post brought 98 visitors and 8 engaged readers at no cost.
- At DKK 4–15 per click and a likely 10% engagement rate, ads cost DKK 40–150 per engaged reader.

**On value:**
- No outside reader has paid yet.
- Book clubs bring the stickiest readers.

Ads earn their place only if they deliver steady, cheap, well-matched readers, which scene searches might. They are not a replacement for people-led promotion.

---

## 5. Click paths in the Danish Google Ads interface

Labels follow Google Ads in Danish. If a label differs slightly, the position in the menu is the same.

**A. Bid cap**
**Kampagner** → choose the campaign → **Indstillinger** → **Budgivning** → **Maksimer antallet af klik** → tick **Angiv en grænse for maks. CPC-bud** → enter `15` → **Gem**.

**B. Ad rotation**
Campaign → **Indstillinger** → **Flere indstillinger** → **Annoncerotation** → **Optimer ikke: Roter annoncer på ubestemt tid** → **Gem**.

**C. Final URL on an ad**
**Annoncer** → hover over the ad → **Rediger** (pencil) → **Endelig webadresse**: `https://tinct.app/read/hamlet/act-1-scene-1?utm_source=google&utm_medium=cpc&utm_campaign=hamlet-angles&utm_content=gave-up` → **Gem annonce**.
Editing an ad sends it back for review for a few hours.

**D. Final URL suffix with the keyword** (if the check in critique point 6 shows a literal `{keyword}`)
Campaign → **Indstillinger** → **Flere indstillinger** → **Valgmuligheder for kampagnewebadresse** → **Suffiks for endelig webadresse**: `utm_term={keyword}` → **Gem**.
Then remove `utm_term=…` from each ad's final URL.

**E. Negative keywords**
Campaign → **Søgeord** → **Negative søgeord** → **+** → add to the campaign → paste one per line → **Gem**.

**F. Search terms** (what people actually typed)
Campaign → **Søgeord** → **Søgetermer**. Tick an irrelevant term → **Tilføj som negativt søgeord**.

**G. Pause**
**Kampagner** → the status dot next to the campaign → **Sæt på pause**.

**H. Why an ad isn't showing**
**Værktøjer** → **Fejlfinding** → **Forhåndsvisning og diagnosticering af annoncer** → search for the keyword with location set to the US.

**I. Auto-applied recommendations off**
**Anbefalinger** → **Automatisk anvendelse** → untick all → **Gem**.

---

## 6. Requests to the customer-success stream

Day 7 and day 14, for `utm_campaign` = `hamlet-angles`, `moby-angles` and `shakespeare-scenes`, split by `utm_content`:
1. Real tagged visits: with a gclid, excluding automated-check bursts.
2. Visits that handed over to the reader.
3. Visits that read for ≥ 1 minute.
4. Accounts created.
5. Return visits within 7 days.
6. The `utm_term` values seen: real search terms, or the literal `{keyword}`?
