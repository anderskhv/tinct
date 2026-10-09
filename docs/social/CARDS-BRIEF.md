# Coder brief: the account as cards

Anders approved this design on 9 October 2026 after a review of what shipped in #356–#370. It replaces the account pages built then (the Account sheet, Your reading page, the "Your Tinct account" card, Settings, You and the Friends page) with a small set of cards that open over the page the reader is on. You remain the single serialized deploy owner; follow AGENTS.md.

**The design:** `docs/social/cards.html` (open it in a browser; the Light/Dark switch at the top flips every screen). It is binding for layout, spacing, wording and colour. Where it differs from `PROPOSAL.md`, `flows.html` or `CODER-BRIEF.md`, this file wins.

## Why
- Too many separate pages, slow to get back to the book, often needing a refresh.
- The sheet showed the email in monospace instead of the reader's name.
- "Premium account" led to an empty placeholder page.
- Settings put every option on its own page.
- The leaderboard asked for email confirmation; that belongs at sign-up.

## The cards
All six open as a card over the current page: on phone a sheet from the bottom with a grabber; on desktop a 400px panel at top right. A row opens the next card on top; the back arrow goes back one; the cross closes them all. The page behind never unloads, so closing is instant. Over the library the card uses the dark theme.

1. **You** (from Profile in the t menu, or the reader's picture in the library top bar, which is the size of the search icon): painting banner, picture with a camera badge, name, "Premium" or "Free". Three groups: Your reading / Leaderboard (the Leaderboard row only when the reader has joined it); AI credits (this month's bar; a second, lighter top-up bar only after a top-up was bought; a "Top up" row with the renewal date); Find readers (with a count badge for pending follow requests) / Settings. Tapping the picture opens a small menu: Upload a picture, Choose a picture, Change background. Choose a picture shows a 4×2 grid of details from the library's paintings.
2. **Your reading:** one white group with the total (Playfair, lining figures), "since {date}, reading and listening", a 12-week bar chart (past weeks mid-grey, current week black), and three facts (last 7 days, finished, streak). Then "Reading now" (one row per book with a thin progress line and hours) and "Finished" (one row per book with month and hours). No covers, no separate page.
3. **Leaderboard:** a Following / Everyone segmented control, "Last 7 days", a ranked white group (rank, 36px picture, name, hours), the reader's own row in bold. A "Find readers" row below.
4. **Find readers:** a search field (name or tinct.app link), "Asking to follow you" with Accept, "Reading your books" with Follow / Following, "Invite a reader" with the reader's link (Copy, Share…). Search and "Reading your books" show only readers whose profile is Public.
5. **A reader's profile:** their banner and picture, name, "Follows you" where true, a Following/Follow button; the three facts; Reading now and Finished as far as they share. A Private profile shows picture, name and an "Ask to follow" button only, until the reader accepts.
6. **Settings:** one group of three rows, each with its control on the right of the same row: Profile (Private / Public), Sharing (None / Followers / Everyone), Leaderboard (switch, disabled while Sharing is None). A second group: New books open in (Modern / Original) with a one-line footnote. A third: Account (value "Premium", opens plan, change and delete account), Email, Password. A last group: Sign out. Each (i) opens a small dark explanation box; tap anywhere to close. No separate Reading-emails row (that lives on the unsubscribe page).

## Rules
- **Fonts:** Playfair Display for the card title, the reader's name and the big figures only (lining numerals). The system font for every row, value and control. Never monospace. No capitals-only labels.
- **Colour:** greyscale only. Light: ground #F2F2F2, groups #FFFFFF, ink #0A0A0A, secondary #8A8A8A, separators #E1E1E1. Dark: ground #000000, groups #1C1C1C, ink #F5F5F5, secondary #8D8D8D, separators #2C2C2C. Black (white in dark) is the only emphasis: the switch on, the current bar, the main button, the selected segment. Colour comes only from the paintings.
- **Metrics:** 16px side gutters, 12px group corners, 48px rows (52px when a row carries a segmented control, 56px with a picture), 17px row text, 15px secondary, 13px footnotes, separators inset 16px (64px after a picture), 32px between groups.
- **Followers, not friends.** Anyone can follow a Public reader. A Private reader approves each follower ("Asking to follow you"). "Followers" in Sharing means readers the reader has accepted.
- **Email confirmation** is part of sign-up (Google sign-ups count as confirmed) and is never asked for elsewhere. Remove the leaderboard's confirm-email button.
- **Numbers agree everywhere:** last 7 days, total, finished and streak come from one source and match on You, Your reading, the leaderboard and profiles.

## Acceptance
- Every card opens and closes over the reader and over the library without a page load; the book's page is unchanged after closing.
- Phone (390px) and desktop renders match `cards.html` in light and dark, with nothing truncated or overflowing.
- No monospace, no accent colour, no uppercase labels anywhere in the cards.
- Settings changes take effect at once; the Leaderboard switch disables when Sharing is None.
- Existing tests pass; add tests for the Private/Public and Sharing rules on the profile card and in Find readers.

Report to Anders with phone and desktop screenshots in both themes.
