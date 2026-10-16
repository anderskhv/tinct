# Invite a friend by email: brief for Coder

Requested by Anders on 16 October 2026. Groups are on hold, so this replaces them for now. Mockups: https://claude.ai/artifact/WH78ShdjsqfYdxJGmr4uL6 (boards 1–8).

## What it does

A signed-in reader types a friend's email address. They can also suggest a book and add a note. Tinct then sends that person one email. When the friend joins from the email, the two follow each other straight away, both ways. The suggested book opens first.

## The inviter

1. **Entry points:**
   - an "Invite a friend" button on the You page, below the first card;
   - the top of Find readers, above the profile link;
   - the t menu.
2. **The sheet** (board 2):
   - **Their email:** required, validated.
   - **Suggest a book:** optional. It is prefilled with the book the inviter is reading, and "Change" opens the book picker. It only offers catalogue books, never uploads.
   - **A note:** optional, plain text, at most 280 characters. Links are stripped and the profile word filter is applied.
   - Next to the button: "Tinct sends one email from “<name> via Tinct”. Your email address is not shown."
3. **Sent** (board 3) confirms with "We emailed … with <book> and your note." Below it, "Your invites" lists each invite as one of:
   - Sent <when>;
   - Joined · follows you, with the reader's avatar and name;
   - Expired.
4. **When the friend joins,** the inviter gets one short email: "<friend> joined Tinct from your invite. You now follow each other." On their Followers board, the friend's row reads "Joined from your invite" for the first 7 days.

## The email (board 4)

- **Header:**
  - Sender: "<inviter name> via Tinct" <contact@tinct.app>, sent through Brevo with `sendEmail()`.
  - No reply-to: the inviter's email is never exposed (profileRules.ts).
  - Subject: "<name> invited you to read <book>". Without a book: "<name> invited you to read with them on Tinct".
- **Body:**
  - the inviter's avatar;
  - the line "<name> invited you to read with them on Tinct.";
  - the note in italics;
  - the book card;
  - the button "Join <name> on Tinct";
  - the line "You’ll follow each other, so you can see each other’s reading."
- **Footer:** "<name> entered your address on Tinct. We won’t email you again unless someone else invites you." followed by a "Never send me invites" link. That link adds the address to a suppression list, which every later invite checks.

## The friend

1. **The link** is `tinct.app/join/<token>`. The token is random, single use and valid for 30 days, and is stored hashed.
2. **Join page** (board 5):
   - the inviter's avatar and "Join <name> on Tinct";
   - the book card, with "Opens right after you join";
   - Continue with Google, or email prefilled with the invited address;
   - "Already on Tinct? Sign in, and you’ll follow each other."
3. **Sign-up** is the normal flow. Step 2 (board 6) adds one line: "You and <name> will follow each other."
4. **Arrival** (board 7): the suggested book opens at its start, with a dismissable card "You and <name> follow each other" and the note's first sentence. With no book suggested, they land in the library. Either way the book goes onto their desk, as reading it would.
5. **Following:** at account creation (or sign-in for an existing account), the server creates both follows. Mutual follows make them Friends in the existing model.
6. **Existing account:** signing in from the link creates the same two follows. They are skipped if either reader has blocked the other.
7. **Bad links:** an expired or used token still shows the join page, without the auto-follow, and says "This invite has expired". The friend can still join. Accepting an invite the friend sent to themselves does nothing.

## New defaults for new profiles (Anders, 16 October 2026)

- **Who can see your reading:** Friends ("Followers" in the copy, per Anders's rename) is preselected.
- **Skip on step 2** now keeps Friends and the leaderboard on, instead of setting Only me.
- **"Show me on the leaderboard"** is a new toggle on step 2 and is on by default. It also turns on "Show my reading time", because the board needs it.
- **Everyone** still needs an explicit choice and a confirmed email.
- **Existing accounts are not changed.** Their current settings were chosen, or defaulted with the old wording; flipping them silently would expose people who did not agree to it. Coder: confirm with Anders before any backfill.
- `socialRules.ts` header and `signUpSteps.ts` comments: update the "opt-in, default off" and "Skip (Only me)" wording.

## Limits and abuse

- Only signed-in readers whose profile is set up can invite.
- At most 10 invites a day and 50 a month per inviter. Internal and test accounts are exempt.
- One invite per address per inviter every 14 days. A second send says "Already invited on <date>".
- Addresses on the suppression list are refused with a neutral message: "We can’t send an invite to that address."
- Never tell the inviter whether an address already has a Tinct account.
- Store the invite (inviter, email hash, book, note, token hash, sent, accepted_by, accepted_at). Delete the raw email once the invite is accepted or expires.
- New table plus suppression list: this is a schema change, so it needs Anders's approval. This brief is that request.

## Copy

All new words go in `cardsCopy.ts` (`inviteFriend`, `theirEmail`, `suggestBook`, `aNote`, `sendInvite`, `inviteSent`, `yourInvites`, `followEachOther`), plus the email template beside the lifecycle emails.

## Tests

- **Unit:** token rules, rate limits, suppression, blocked pairs, self-invite, expired token, the new defaults (skip = Friends + leaderboard on), note filtering.
- **End to end, desktop and phone:**
  - invite from profile A;
  - open the email link in a fresh profile;
  - sign up with Google or email;
  - check both follow each other, the book opens, the card shows, and A's board shows the friend;
  - repeat with an existing account.
- Use the test accounts, flagged with `?internal=1`.
