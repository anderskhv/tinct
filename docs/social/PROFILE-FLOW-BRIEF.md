# Profile flow for new and returning readers: brief for Coder (22 October 2026)

Agreed with Anders on 22 October. Mockups: https://claude.ai/artifact/Jbc5oLgE1NAZWFY16629bV. This replaces the earlier "Make your profile" concept (`MAKE-YOUR-PROFILE.md`); no come-back email is involved.

## 1. Premium first month free, for everyone

- **New readers:** Premium for their first 30 days, which is the existing trial. Today a brand-new account shows "Account: Free" in Settings (Anders's screenshot, 22 Oct), so either the trial is not applied or not shown; find out which and fix it.
- **Existing readers:** every non-internal account that is not paying gets 30 days of Premium from the release date, using the granted-Premium mechanism: `subscription_status = 'canceled'` with `subscription_period_end` = release + 30 days, so it lapses by itself. Their AI use is reset so they start the period with the full allowance. Anyone with an active paid subscription is left alone. Report the count of accounts changed to Anders.
- **Label** wherever the plan shows (Settings › Account, the You card, the account page): **"Premium · first month free"** while it lasts, then "Free" or "Premium" as today.

## 2. What's-new card (returning readers only)

- **Who:** accounts older than 30 days, not new readers. Shown once, in place of the 19 October findable notice, on the library. It uses the notice's style and position.
- **Heading:** "Tinct has grown up a lot".
- **Bullets:**
  - **Your own books and PDFs.** Open your PDFs and EPUBs with the same companion.
  - **Read with friends.** Follow people you know and see who has read most this week.
  - **AI in the text.** You can now explain, simplify and fact-check as you read, by highlighting the text.
- **Buttons:** **Continue** opens step 1. **Later** hides the card for good on that account.
- **Who goes on to step 1:** any account whose profile was never set up (`auto_created && !set_up_at`, ignoring `prompted_at`). Returning accounts that already set up a profile see the card only, and Continue closes it.

## 3. Step 1: Your profile (the existing sign-up step 2, updated)

- **Top, built like the You card:**
  - the background banner with its camera button (choose or upload);
  - the round picture with its camera button;
  - the name field next to it.

  The name is **empty with the placeholder "Your name"** while the profile still has the neutral "Reader". It never starts with an invented name. A set name shows as text with a small pencil, and a tap edits it in place. Add the same pencil to the name on the You card.
- **"Who can see you?"**, two choices:
  - **Public** (selected): "Your profile, reading and place on the leaderboard."
  - **Private:** "Only you."
- **The line:** "Others see you once you confirm your email. You can change this any time in Settings." Only for accounts whose email is unconfirmed.
- **Buttons:** Continue and Skip.
- **Saving:** nothing is saved before Continue, and Skip saves nothing.
  - Continue with Public sets visibility Everyone, show reading on, show time on and `on_leaderboard` on.
  - Continue with Private sets Only me and turns all three off.
  - Continue also sets `set_up_at`.
  - Friends stays available in Settings only.
- **Consent:** the pre-selected Public is acceptable only because the reader presses Continue on a screen that says exactly what becomes visible. Update privacy.html, which still says a new profile is Only me, and show Anders the wording before release.

## 4. Step 2: Your reading (the existing "Modern English or human translations?" step, updated)

- **"Which languages do you read in?"** English and Dansk as checkboxes. Both may be chosen, and at least one is required. English is preselected; Dansk is preselected too when the browser language is Danish.
- **"Which version should new books open in?"**
  - **Modern English:** "The same book, in today's English."
  - **Human originals or translations:** "The original text, or a published translation." This is the renamed second option.
- **Button:** Start reading. It goes back to where the reader was, or to the library.
- **New storage:** `reading_languages` (text array, default `{en}`) on the profile. This is a schema change, which Anders approves with this brief. What it does now:
  - A reader who chose Dansk sees the offered Danish editions (`OFFERED_DANISH_EDITIONS`) first, where a book has one.
  - The companion answers in Danish when the reader reads a Danish edition or writes in Danish.
  - Nothing else changes yet, and no new Danish content is implied.

## 5. Settings

Mockup board "After":
- **Visibility:** the Profile switch (Only me / Friends / Everyone), Show what I'm reading, Show my reading time and Leaderboard, as today. After Public, all are on, and each can be switched off.
- **New row "I read in":** English and Dansk toggles, at least one required.
- **"New books open in":** Modern / Original, as today. Its footnote keeps saying what Original means.
- **Account:** "Premium · first month free" while the free month lasts.

## Tests

- **Flow:**
  - Skip at either step changes nothing.
  - Public turns on exactly the four settings.
  - Private turns them all off.
  - An unconfirmed email shows as Friends until it is confirmed.
- **Name:** the field is empty for "Reader", never prefilled with an invented name, and the pencil edits it in place.
- **Languages:** Danish editions come first only for readers who chose Dansk, and at least one language is required.
- **The grant:**
  - it sets 30 days on non-paying, non-internal accounts;
  - it never touches paying accounts;
  - it lapses back to Free;
  - the AI allowance is full afterwards.
- **What's-new card:** shows once, never to new accounts, and Later sticks.
- **Layout:** phone and desktop, using `checkLayout`.
