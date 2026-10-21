# Make your profile: a come-back flow for current readers (concept, 21 October 2026)

Asked for by Anders: every current reader is asked to make a profile, choose a picture, find friends among all findable readers, and end up visible to everyone and on the leaderboard. Those settings apply only if they finish the flow, after which they see the leaderboard. The first use is to bring stale accounts back and ask them for another test. Mockups: https://claude.ai/artifact/F5Q9Yp1repZLSCjSZhQvea (boards 0a–5).

Status: concept for Anders. Nothing is built.

## Where things stand on main

- Every account has a profile row that was created automatically (`auto_created`), set to Only me with the leaderboard off.
- A one-time prompt (`shouldPrompt` = auto-created, not set up, never prompted) shows once on the library. After it is dismissed, `prompted_at` stops it for good.
- As a result, most stale accounts have never set up a profile and will not be asked again.
- Since 19 October, Find readers searches every Friends and Everyone profile, and a follow to a Friends profile is a request.
- Everyone counts only with a confirmed email; until then it counts as Friends. Email confirmation has been off since May, so many email sign-ups are unconfirmed. Google accounts are confirmed.
- Lifecycle emails are switched off.

## The flow

**Entry**
- **0a, come-back email** (stale accounts only, defined below). It is a one-off, plain email from Anders:
  - what has changed since they last read;
  - "Would you give it ten minutes this week, and tell me honestly what works and what doesn't? Just reply to this email";
  - their own book and place;
  - one button, "Make your profile and pick up".

  The reply-to is Anders, so the feedback lands in his inbox. The link signs them in, through the usual sign-in when needed, and opens the flow.
- **0b, in the app.** A card on the library ("Make your profile and see who else is reading this week", Make my profile / Not now) on the next visit. It is shown to any reader whose profile is not set up, including those who dismissed the old prompt. A campaign key, rather than `prompted_at`, decides whether it shows: it comes back at most twice, a week apart, then stops.

**Steps** (four, each with "Not now" at the top)
1. **Name and link.** The name is prefilled from the account or Google, and the link comes from the name, with the existing handle rules.
2. **Picture.** The library set and cover details, Upload a photo, or Use Google photo.
3. **Find friends.** Every findable reader on Tinct (Everyone and Friends profiles, never Only me, hidden, internal or blocked), sorted:
   1. people who follow you;
   2. people you follow;
   3. the most-read this week.

   There is a search box and a Follow button on each row; a Friends profile gets a request, as today. The step also offers "Invite a friend" once that ships.
4. **Who can see you.** Everyone, Friends and Only me are shown as equal options, with Everyone selected. "Show me on the leaderboard" is a visible switch, set on. The line "Your highlights, notes and chats always stay private" sits above the button. The button is **Create my profile**, and under it: "Creates a public profile on the leaderboard. Change it any time in Settings."

**Finish**
- **5, Leaderboard, Everyone tab.**
  - A banner: "Your profile is live · tinct.app/handle".
  - The reader's own row reads "Read 10 minutes to join this week's board" until they have time this week. Their followed readers show on the Friends tab.
  - At the bottom: "Pick up where you left off" with their last book.

## The rule Anders asked for, and the consent point

- **Nothing changes unless the reader presses Create my profile.** Not now, closing the flow or leaving partway keeps the profile exactly as it was (Only me, leaderboard off). Name, picture and follows made along the way are kept, because each is its own action.
- **Visible to everyone and on the leaderboard by default:** the last screen shows exactly what will be public, offers the alternatives as equal choices, and the button names the result.
  - That is an informed, deliberate act by the reader rather than a pre-ticked box hidden in a form. It is the defensible way to get the defaults Anders wants.
  - Still to do: update privacy.html, which says a new profile is Only me and rests visibility and the leaderboard on consent, and have Anders approve the wording.
  - This answers the open GDPR point in `docs/social/invite/PRIVACY-DRAFT.md` §I the same way.
- **Unconfirmed emails:** choosing Everyone sends the confirmation email, and the profile shows to Friends until the reader confirms. The leaderboard row shows on the Friends board meanwhile. Alternative: let finishing this flow count as confirmed for accounts that signed in recently with a working session. Anders decides.

## Who counts as stale (the email list)

- Signed up before 1 October 2026.
- No reading time in the last 21 days.
- Email consent given at sign-up (`EMAIL_CONSENT_TEXT`) or a paying or trial history.
- Not unsubscribed, not internal or test.

Send in two waves (half, then the rest two days later) so replies and errors can be read in between. Track sent → opened → flow started → profile created → 10 minutes read within 7 days → replied.

## What Coder would build (when approved)

1. **The flow:** reuse sign-up steps 2 and 3 (`signUpSteps.ts`) as a four-step "Make your profile" page at `/profile/start`. Find friends comes from the Find readers API, plus a new "most read this week" list. The last step saves visibility and `on_leaderboard` together, with `set_up_at`, in one request.
2. **The library card:** a campaign key per account (`profile_campaign_shown_at`, count), replacing the reliance on `prompted_at` for this campaign.
3. **The come-back email:**
   - a one-off send route behind its own switch (`COMEBACK_EMAIL`, separate from lifecycle emails), using `sendEmail()` with Anders as the reply-to;
   - an admin preview, a dry run that lists recipients, then wave 1 and wave 2;
   - a signed link that opens the flow;
   - unsubscribe handled the way lifecycle emails do it.
4. **Leaderboard landing:** the banner and the "Read 10 minutes to join" row for a reader with no time this week.
5. **privacy.html:** the wording above, approved by Anders before release.
6. **Tests:**
   - "Not now" at every step changes nothing;
   - Create my profile sets Everyone and the leaderboard on, and only then;
   - an unconfirmed email falls back to Friends;
   - internal and test accounts never appear;
   - the email dry run excludes unsubscribed and recently active readers;
   - the phone and desktop layouts.

## Questions for Anders

1. Who gets the email: everyone stale with email consent only, or also stale readers without it (soft opt-in for existing users is narrower in the EU)?
2. Is the email signed by you, with replies to your inbox?
3. Unconfirmed emails: send a confirmation, or treat finishing the flow as confirmation?
4. Does Friends get renamed to Followers before this goes out? The copy here keeps "Friends", as the app does today.
5. Should readers who already set up an Only me or Friends profile also see the card, or only those never set up?
