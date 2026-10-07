# Coder brief: reading time, profiles and the leaderboard

Anders assigns this to you (coding + release) on 7 October 2026. You remain the single serialized deploy owner. Finish or park any release already in flight first. Follow AGENTS.md: build, verify-bundle, GitHub Actions deploy, acceptance, deploy-safety gate.

**Read first (branch `claude/dreamy-faraday-30zl0v`):**
- `docs/social/PROPOSAL.md`: the approved proposal. Build exactly that; Anders approved every decision in it.
- `docs/social/mockup.html`: the approved look (open in a browser).
- `docs/social/flows.html`: how readers get there, as storyboards. These are binding for navigation:
  - **Library:** the library top bar shows your picture instead of "Account". It opens a **You** page with AI credits at the top and two tabs, Reading and Profile. The **leaderboard is its own page** (podium for the top three, roomy rows), reached from the "#3 among friends ›" line. Profile also holds Followers and following, Premium, Email and password, and Sign out.
  - **Reader:** the reader's t menu starts with your picture, name and last-7-days hours. That opens the Account sheet, whose rows open the matching tab. Back returns to the same page in the book.
  - **After sign-up:** a one-time toast ("Your 1 h 05 m is saved. Find it under the t.").
  - **Skipped profile step:** a reader who skipped it gets one "Join the leaderboard?" card on their first leaderboard visit.
  - **Account prompt:** gains the line about saving reading time already built up. Use the copy in flows.html.
  - Account sheet and sign-up are in their current looks.
  - Your reading, the leaderboard and profiles are in the library look.

Don't reopen the design. Ask Anders only where something is truly ambiguous. Ship in the order below; each ship is releasable on its own.

## Approved by Anders with this brief
- **Schema:**
  - a `reading_time` table: reader, day, book, read seconds, listen seconds;
  - new profile columns: display name, unique handle, picture kind/value, visibility, three switches, email confirmed at, consent wording version;
  - `follows` and `blocks` tables.
- **Defaults:**
  - skipping the profile step = Only me;
  - Everyone needs an explicit tap and a confirmed email;
  - public profile pages are noindex in v1.
- **Leaderboard:** reading + listening over a **rolling last 7 days** (today plus the six days before), updated at least hourly.
- **Consent line**, replacing the current sign-up text, with its wording version stored alongside the consent:
  > Email me about my reading progress and ideas for what to read next. Stop any time.
- **Soft email confirmation:**
  - sign-up stays instant;
  - the welcome email carries one-click "Confirm your email";
  - reading emails and public profiles wait for that click;
  - Google sign-ups count as confirmed.

## SHIP 1: Reading time you can trust
- **Heartbeat:**
  - Worker route takes a heartbeat about once a minute, from the same activity rule `useLabReadingYear` uses today (active or audio playing, tab visible).
  - The Worker enforces: at most one per ~50 s per reader, at most 60 s credited each, at most 16 h a day. Listening only while narration plays.
  - Writes go to `reading_time` by the reader's local date and book.
- **The ledger is the source** for the sheet, Your reading, profiles and the leaderboard.
  - Merge in the existing `reading-year-*` totals once, so nobody loses counted time.
  - Keep the device tally for signed-out and offline reading; flush it on sign-in.
- **Books finished** = reached the end of the last chapter (position record). Replace "books" (opened) everywhere.
- **Account sheet (`LabV2Sheet`, account layer):**
  - "Last 7 days" in large type, with a 7-day bar;
  - a facts line (streak, total since first reading; rank comes in ship 3);
  - a "Your reading" row. AI use and Manage account stay.
  - Signed out: device hours and "Create a free account to keep your reading time and join the leaderboard."
- **Your reading page** (library look):
  - total hours as the hero, plus a books comparison ("about six Frankensteins": hours ÷ that book's estimated reading time);
  - 12 calendar weeks of hours;
  - finished, chapters, listening, longest streak;
  - Reading now and Finished with hours per book;
  - Share button: reading card, using the highlight-share renderer.
- **Tests:**
  - heartbeat limits (rate, per-beat cap, daily cap, listening only while playing);
  - one-time merge of yearly totals without double counting;
  - finished-book rule;
  - the 7-day window across a time-zone change.

## SHIP 2: Profiles
- **Fields:**
  - display name;
  - handle: 3–20 letters, digits, `_` or `.`; unique; reserved words blocked; word filter on names and handles;
  - picture: a cover detail (book id + preset crop), initial, Google photo or upload;
  - background banner: a library scene or upload;
  - uploads: resized, location data stripped, stored in R2; visible to the owner at once and to others after approval in the admin view;
  - visibility: Only me / Friends / Everyone;
  - switches: what I'm reading, how much I read, appear on the leaderboard.
- **Sign-up step 2:** replaces the "Welcome to Tinct" screen in `/sign-in`.
  - picture, name (prefilled), handle (suggested), who can see you (Friends preselected);
  - Start reading, or Skip for now (Only me).
- **Profile and privacy:** reached from the sheet row and from the desktop account page. Account sheet header shows picture, name, "tinct.app/name · who can see you", the tier and an AI credits bar ("15% left · renews 5 Nov"); the t menu's first row shows picture, last-7-days hours and AI credits. The email moves to Manage account.
- **Email confirmation:** add the one-click confirm link to the welcome email and the confirmed-at field. Reading emails require `email_opt_in` and a confirmed email.
- **Never exposed:** highlights, notes, chats, Talk, email. Row-level security: readers write only their own rows. Public data is served by the Worker from views that apply each reader's choices.
- **Tests:**
  - handle rules and uniqueness;
  - each visibility level and switch, seen from a stranger, a one-way follower and a friend;
  - skip = Only me;
  - Everyone blocked until the email is confirmed.

## SHIP 3: Social
- **Follows:**
  - follow and unfollow, remove follower, block;
  - friends = mutual follows;
  - no reader search.
- **Leaderboard** (library look):
  - Friends tab (friends + you) and Everyone tab (public profiles with the leaderboard switch on);
  - rolling 7 days, updated at least hourly (a cached view is fine);
  - your row and rank always visible; tap a reader to open their profile;
  - "#N among friends" in the sheet facts line, and a Leaderboard row.
- **Public profile page** at `tinct.app/{handle}` (Worker-rendered, noindex), with the reader's background banner:
  - picture, name, handle, Follow;
  - last 7 days and this year;
  - Reading now and Finished, as the reader allows;
  - Report link.
  - Handles can never equal a book id, an existing route or a reserved word; the book-id generator must skip taken handles. Book routes always win.
- **Reading card:** "Finished {book} · {hours}" offered at the end of a book. It links to the public profile, else the book.
- **Admin view:** rename or hide a profile; see reports.
- **Analytics events:**
  - `profile_created`, `profile_skipped`, `visibility_changed`;
  - `follow`, `unfollow`;
  - `leaderboard_opened` (tab), `profile_viewed`;
  - `reading_card_shared`.
- **Tests:**
  - ranking across the 7-day window;
  - blocked readers never see each other;
  - private readers never appear;
  - switching off "appear on the leaderboard" removes you within the hour.

## Acceptance and report
After each ship, report to Anders: what's live, phone and desktop screenshots, test results, and anything that needs his decision.

The proposal's "Measure" section lists what we'll watch. Make sure the events above land in the funnel views from #279.
